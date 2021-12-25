/**
 * JackyGu 2021-12-24
 */
const fs = require('fs');
const { parseData} = require('./src/parseCovalentLogs.js');
const { program } = require('commander');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic');
const request = require("request");
require('dotenv').config();

// const {
// 	addDB,
// 	updateBuyDB,
// 	updateCancelSaleDB, 
// 	deleteDuplicateRowsByField,
// } = require('./src/dbForCovalent.js');

const Web3 = require('web3');
const apiKey = 'ckey_ce266e13a4534c628658d103a92';

const getData = async (web3, gameParams, contractId, fromBlock, toBlock, pageNumber = 0, pageSize = 10) => {
	const params = gameParams.contracts[contractId];
	if(params === undefined) {
		console.log("合约配置信息错误，请确认json文件配置是否正确");
		return;
	}
	const url = `https://api.covalenthq.com/v1/${gameParams.chainId}/events/address/${params.constractAddress}/?quote-currency=USD&format=JSON&starting-block=${fromBlock}&ending-block=${toBlock}&page-number=${pageNumber}&page-size=${pageSize}&key=${apiKey}`;
	console.log(url)
	request({
			url,
			method: "GET",
		},
		async function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// console.log(body)
				const data = JSON.parse(body);
				if(data.error) {console.log(data.error_message, data.error_code); return;}
				let parsedData = [];
				for(let i = 0; i < data.data.items.length; i++) {
					const item = data.data.items[i];
					// console.log(i, data.data.items[i]);
					// console.log("sell...");
					const sellData = params.sell.topic !== undefined ? parseData(web3, item, params.sell, gameParams.chainId, gameParams.gameName) : false;
					// console.log("buy...");
					const buyData = params.buy.topic !== undefined ? parseData(web3, item, params.buy, gameParams.chainId, gameParams.gameName) : false;
					// console.log("cancel...");
					const cancelData = params.cancel.topic !== undefined ? parseData(web3, item, params.cancel, gameParams.chainId, gameParams.gameName) : false;
					if(sellData) parsedData.push(sellData);
					if(buyData) parsedData.push(buyData);
					if(cancelData) parsedData.push(cancelData);
				}
				console.log(parsedData);
			}
		}
	);
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

if(!process.argv[2]) program.help();
program.parse(process.argv);

const options = program.opts();
if (options.json) {
	let gameParams;
	try {
		gameParams = JSON.parse(fs.readFileSync(`./json/${options.json}.json`));
		if(gameParams.rpcUrl === undefined || gameParams.gameName === undefined) {
			console.log("配置文件错误，请检查" + options.json + ".json");
			return;
		}
	} catch(e) {
		console.log(options.json + '.json configure file not found');
		return;
	}
	// console.log(gameParams);
	const contractId = options.contractId === undefined ? 0 : options.contractId;
	const web3 = new Web3(new Web3.providers.HttpProvider(gameParams.rpcUrl));
	// getData(web3, gameParams, 13268838, 13268938);
	getData(web3, gameParams, contractId, 13740858, 13750858)
}


// const timer = setIntervalAsync(
//   async () => {
//     console.log('Checking...');
//     await check()
//     console.log('Finished...');
//   },
//   1000 * 120 // BSC每分钟20个块，2分钟40个块
// )

// const check = async () => {
// 	const blockNumber = await web3.eth.getBlockNumber();
// 	const fromBlock = blockNumber - 50;
// 	const toBlock = blockNumber;

// 	// Check sell data
// 	const sellLogs = await web3.eth.getPastLogs({
//     address: fixedPriceSellContractAddressV2,
//     topics: [sellTopics],
// 		fromBlock,
// 		toBlock,
// 	})
// 	for(let i = 0; i < sellLogs.length; i++) {
// 		let parsedSellData = parseSellData(web3, sellLogs[i]);
// 		parsedSellData.nftType = getNftType(parsedSellData.nftAddress, parsedSellData.tokenId);
// 		await addDB(parsedSellData);
// 	}

// 	// Check buy data
// 	const buyLogs = await web3.eth.getPastLogs({
// 		address: fixedPriceSellContractAddressV2,
// 		topics: [buyTopics],
// 		fromBlock,
// 		toBlock,
// 	})
// 	for(let i = 0; i < buyLogs.length; i++) {
// 		const parsedBuyData = parseBuyData(web3, buyLogs[i]);
// 		await updateBuyDB(parsedBuyData);
// 	}

// 	// Check cancel sale data
// 	const cancelLogs = await web3.eth.getPastLogs({
// 		address: fixedPriceSellContractAddressV2,
// 		topics: [cancelSaleTopics],
// 		fromBlock,
// 		toBlock,
// 	})
// 	for(let i = 0; i < cancelLogs.length; i++) {
// 		const parsedCancelData = parseCancelSaleData(cancelLogs[i]);
// 		await updateCancelSaleDB(parsedCancelData);
// 	}

// 	await deleteDuplicateRowsByField('transactionHash');
// 	await deleteDuplicateRowsByField('buyerTransactionHash');	
// 	await deleteDuplicateRowsByField('auctionId');

// 	console.log("BlockNumber", blockNumber);
// 	console.log("Total Logs", sellLogs.length);
// }

// check();
