/**
 * JackyGu 2021-12-24
 */
const fs = require('fs');
const { parseData} = require('./src/parseCovalentLogs.js');
const { program } = require('commander');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/fixed');
const request = require("request");
const sleep = require('sleep-promise');
const redis = require('redis');

require('dotenv').config();

const client = redis.createClient();
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

const {
	addDB,
	updateBuyDB,
	updateCancelSaleDB, 
	deleteDuplicateRowsByField,
	updatePriceSaleDB,
	addNFTDB,
	updateOwnerNFTDB,
	updateMetadataNFTDB,
	updateTokenURINFTDB
} = require('./src/dbForCovalent.js');

const Web3 = require('web3');

const { exit } = require('process');
const apiKey = process.env.COVALENT_API_KEY;

const getData = async (web3, gameParams, contractId, blockNumber, range) => {
	// fromBlock, toBlock, pageNumber = 0, pageSize = 10
	const params = gameParams.contracts[contractId];
	if(params === undefined) {
		console.log("合约配置信息错误，请确认json文件配置是否正确");
		return;
	}
	const _latestFromBlock = await client.get(`${gameParams.chainId}_height`);
	if(range.fromBlock === undefined) range.fromBlock = _latestFromBlock;
	if(range.toBlock === undefined) range.toBlock = blockNumber + 2;

	console.log('Check marketplace from height', range.fromBlock, 'to', range.toBlock);
	const url = `https://api.covalenthq.com/v1/${gameParams.chainId}/events/address/${params.contractAddress}/?quote-currency=USD&format=JSON&starting-block=${range.fromBlock}&ending-block=${range.toBlock}&page-number=${range.pageNumber}&page-size=${range.pageSize}&key=${apiKey}`;
	// console.log(url);
	request({
			url,
			method: "GET",
		},
		async function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const data = JSON.parse(body);
				if(data.error) {
					console.log(data.error_message, data.error_code); 
					return;
				}
				if(data.data.items.length === 0) {
					await client.set(`${gameParams.chainId}_height`, range.toBlock - 2);
					return;
				}
				let parsedData = [];
				for(let i = 0; i < data.data.items.length; i++) {
					const item = data.data.items[i];
					const sellData = params.sell.topic !== undefined ? await parseData(web3, item, params.sell, gameParams.chainId, gameParams.gameName) : false;
					const buyData = params.buy.topic !== undefined ? await parseData(web3, item, params.buy, gameParams.chainId, gameParams.gameName) : false;
					const cancelData = params.cancel.topic !== undefined ? await parseData(web3, item, params.cancel, gameParams.chainId, gameParams.gameName) : false;
					const updatePriceData = params.updatePrice.topic !== undefined ? await parseData(web3, item, params.updatePrice, gameParams.chainId, gameParams.gameName) : false;
					if(sellData) parsedData.push(sellData);
					if(buyData) parsedData.push(buyData);
					if(cancelData) parsedData.push(cancelData);
					if(updatePriceData) parsedData.push(updatePriceData);
				}
				// console.log(parsedData);
				for(let i = 0; i < parsedData.length; i++) {
					if(parsedData[i].action === 'sell') await addDB(parsedData[i]);
				}
				await sleep(500);
				for(let i = 0; i < parsedData.length; i++) {
					if(parsedData[i].action === 'buy') await updateBuyDB(parsedData[i]);
				}
				await sleep(500);
				for(let i = 0; i < parsedData.length; i++) {
					if(parsedData[i].action === 'cancel') await updateCancelSaleDB(parsedData[i]);
				}
				await sleep(500);
				for(let i = 0; i < parsedData.length; i++) {
					if(parsedData[i].action === 'updatePrice') await updatePriceSaleDB(parsedData[i]);
				}
				await client.set(`${gameParams.chainId}_height`, range.toBlock);
			}
		}
	);
}

const getNFTData = async (web3, gameParams, contractId, blockNumber, range) => {
	const params = gameParams.contracts[contractId];
	if(params === undefined) {
		console.log("合约配置信息错误，请确认json文件配置是否正确");
		return;
	}
	const _latestFromBlock = await client.get(`${gameParams.chainId}_nft_height`);
	if(range.fromBlock === undefined) range.fromBlock = _latestFromBlock;
	if(range.toBlock === undefined) range.toBlock = blockNumber + 2;
	console.log('Check nft update from height', range.fromBlock, 'to', range.toBlock);
	const url = `https://api.covalenthq.com/v1/${gameParams.chainId}/events/address/${params.contractAddress}/?quote-currency=USD&format=JSON&starting-block=${range.fromBlock}&ending-block=${range.toBlock}&page-number=${range.pageNumber}&page-size=${range.pageSize}&key=${apiKey}`;
	// console.log(url);
	request({
		url,
		method: "GET",
	},
	async function (error, response, body) {
		if (!error && response.statusCode == 200) {
			const data = JSON.parse(body);
			if(data.error) {
				console.log(data.error_message, data.error_code); 
				return;
			}
			if(data.data.items.length === 0) {
				// console.log("No events...")
				await client.set(`${gameParams.chainId}_nft_height`, range.toBlock - 2);
				return;
			}
			let parsedData = [];
			// console.log(data.data.items);
			// console.log("total events: ", data.data.items.length);
			for(let i = 0; i < data.data.items.length; i++) {
				const item = data.data.items[i];

				// In transferData, if transferFrom is 0x0000000000000000000000000000000000000000, means new NFT was mint
				// Otherwise, means nft transaction happen.
				// If transferTo is 0x0000000000000000000000000000000000000000, means NFT was burned.
				const transferData = params.transfer.topic !== undefined ? await parseData(web3, item, params.transfer, gameParams.chainId, gameParams.gameName) : false;
				if(transferData) parsedData.push(transferData);

				let updateTokenURIData = params.updateTokenURI.topic !== undefined ? await parseData(web3, item, params.updateTokenURI, gameParams.chainId, gameParams.gameName) : false;
				if(updateTokenURIData) {
					// For IPFS uri, it need 3 lines to store. line1 + line2 + line3
					updateTokenURIData.tokenURI = updateTokenURIData.line1 + updateTokenURIData.line2 + updateTokenURIData.line3;
					parsedData.push(updateTokenURIData);
				}

				const updateMetadataData = params.updateMetadata.topic !== undefined ? await parseData(web3, item, params.updateMetadata, gameParams.chainId, gameParams.gameName) : false;
				if(updateMetadataData) parsedData.push(updateMetadataData);
			}
			// console.log(parsedData);
			for(let i = 0; i < parsedData.length; i++) {
				if(parsedData[i].action === "transfer") {
					if(parsedData[i].transferFrom === '0x0000000000000000000000000000000000000000') await addNFTDB(parsedData[i]);
					else await updateOwnerNFTDB(parsedData[i]);
				}
			}
			await sleep(500);
			for(let i = 0; i < parsedData.length; i++) {
				if(parsedData[i].action === "updateMetadata") {
					await updateMetadataNFTDB(parsedData[i]);
				}
			}
			await sleep(500);
			for(let i = 0; i < parsedData.length; i++) {
				if(parsedData[i].action === "updateTokenURI") {
					await updateTokenURINFTDB(parsedData[i]);
				}
			}
			await client.set(`${gameParams.chainId}_nft_height`, range.toBlock);
		}
	})
}

/**
 * =================================================================
 * Command for cli
 * =================================================================
 */
program
	.allowUnknownOption()
	.version('0.1.0')
	.usage('checkCovalent [options]')

program
	.option('-j --json <GameName>', 'Fetch data with json configure, don\'t include path and .json extension, just game name of config file')
	.option('-i --contractId <ContractId>', 'contracts index in json file')
	.option('-f --fromBlock <FromBlock>', 'From block height, if no fromBlock and toBlock, will run at intervals')
	.option('-t --toBlock <ToBlock>', 'to block height, if no toBlock and fromBlock, will run at intervals')
	.option('-n --pageNumber <PageNumber>', 'Page number to fetch')
	.option('-s --pageSize <PageSize>', 'Page size')

if(!process.argv[2]) program.help();
program.parse(process.argv);

const options = program.opts();
if (options.json) {
	let gameParams;
	try {
		gameParams = JSON.parse(fs.readFileSync(`./json/${options.json}.json`));
		if(gameParams.rpcUrl === undefined || gameParams.gameName === undefined) {
			console.log("配置文件错误，请检查" + options.json + ".json");
			exit(0);
		}
	} catch(e) {
		console.log(options.json + '.json configure file not found');
		exit(0);
	}
	// console.log(gameParams);
	const web3 = new Web3(new Web3.providers.HttpProvider(gameParams.rpcUrl));
	const contractId = options.contractId === undefined ? 0 : options.contractId;
	console.log("Start...");
	if(options.fromBlock !== undefined && options.toBlock !== undefined) {
		// TESTING
		getNFTData(
			web3, 
			gameParams, 
			1, 
			null,
			{
				fromBlock:options.fromBlock, 
				toBlock: options.toBlock,
				pageNumber: options.pageNumber, 
				pageSize: options.pageSize
			}
		);
		getData(
			web3, 
			gameParams, 
			0, 
			null,
			{
				fromBlock:options.fromBlock, 
				toBlock: options.toBlock,
				pageNumber: options.pageNumber, 
				pageSize: options.pageSize
			}
		);
	} else {
		setIntervalAsync(async () => {
			web3.eth.getBlockNumber().then((blockNumber) => {
				getData(
					web3, 
					gameParams, 
					0, 
					blockNumber,
					{
						fromBlock:options.fromBlock, 
						toBlock: options.toBlock,
						pageNumber: options.pageNumber, 
						pageSize: options.pageSize
					}
				);
				getNFTData(
					web3, 
					gameParams, 
					1, 
					blockNumber,
					{
						fromBlock:options.fromBlock, 
						toBlock: options.toBlock,
						pageNumber: options.pageNumber, 
						pageSize: options.pageSize
					}
				);		
			})
		}, 1000 * 20);
	}
}

