/**
 * JackyGu 2021-12-15
 */
const {
	parseSellData, 
	parseBuyData, 
	parseCancelSaleData
} = require('./src/parseLogs');

const {
	addDB,
	updateBuyDB,
	updateCancelSaleDB, 
	deleteDuplicateRowsByField,
} = require('./src/db');

const {	getNftType } = require('./src/nftType');

const Web3 = require('web3');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic')
require('dotenv').config();

const rpcUrl = 'https://bsc-dataseed1.binance.org';
const fixedPriceSellContractAddressV2 = '0xe97fdca0a3fc76b3046ae496c1502c9d8dfef6fc';//2021-12-6升级的合约
const sellTopics = "0x6656db943f28baede9b164738dc5fa235b9da60d5c20a38b0eb0230c21196254";
const buyTopics = "0x1e58c00385b2026e41e3dcdd07c0117f1e182f8fd553676950d681ea12185b34";
const cancelSaleTopics = "0xed99d0d4c88606b9c8fac6251e8a3525854dd4418c15df71565c3908f61ae634";

const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
console.log('Metamon 数据完整性校验机器人 By Jacky Gu');
console.log("Web3 connected...");

const timer = setIntervalAsync(
  async () => {
    console.log('Checking...');
    await check()
    console.log('Finished...');
  },
  1000 * 120 // BSC每分钟20个块，2分钟40个块
)

const check = async () => {
	const blockNumber = await web3.eth.getBlockNumber();
	const fromBlock = blockNumber - 50;
	const toBlock = blockNumber;

	// Check sell data
	const sellLogs = await web3.eth.getPastLogs({
    address: fixedPriceSellContractAddressV2,
    topics: [sellTopics],
		fromBlock,
		toBlock,
	})
	for(let i = 0; i < sellLogs.length; i++) {
		let parsedSellData = parseSellData(web3, sellLogs[i]);
		parsedSellData.nftType = getNftType(parsedSellData.nftAddress, parsedSellData.tokenId);
		await addDB(parsedSellData);
	}

	// Check buy data
	const buyLogs = await web3.eth.getPastLogs({
		address: fixedPriceSellContractAddressV2,
		topics: [buyTopics],
		fromBlock,
		toBlock,
	})
	for(let i = 0; i < buyLogs.length; i++) {
		const parsedBuyData = parseBuyData(web3, buyLogs[i]);
		await updateBuyDB(parsedBuyData);
	}

	// Check cancel sale data
	const cancelLogs = await web3.eth.getPastLogs({
		address: fixedPriceSellContractAddressV2,
		topics: [cancelSaleTopics],
		fromBlock,
		toBlock,
	})
	for(let i = 0; i < cancelLogs.length; i++) {
		const parsedCancelData = parseCancelSaleData(cancelLogs[i]);
		await updateCancelSaleDB(parsedCancelData);
	}

	await deleteDuplicateRowsByField('transactionHash');
	await deleteDuplicateRowsByField('buyerTransactionHash');	
	await deleteDuplicateRowsByField('auctionId');

	console.log("BlockNumber", blockNumber);
	console.log("Total Logs", sellLogs.length);
}

check();
