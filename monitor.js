/**
 * JackyGu 2021-12-3
 */
const Web3 = require('web3');
const {
	parseSellData, 
	parseBuyData, 
	parseCancelSaleData
} = require('./src/parseLogs');
const {
	addDB,
	updateBuyDB, 
	updateCancelSaleDB,
} = require('./src/db');

const {
	getNftType,
} = require('./src/nftType');

const wss = 'wss://ws-nd-475-177-088.p2pify.com/d86115e778aa9c1e71b5403a89b73fa9';
const sellTopics = "0x6656db943f28baede9b164738dc5fa235b9da60d5c20a38b0eb0230c21196254";
const buyTopics = "0x1e58c00385b2026e41e3dcdd07c0117f1e182f8fd553676950d681ea12185b34";
const cancelSaleTopics = "0xed99d0d4c88606b9c8fac6251e8a3525854dd4418c15df71565c3908f61ae634";

const web3 = new Web3(new Web3.providers.WebsocketProvider(wss, {
	clientConfig: {
			keepalive: true,
			keepaliveInterval: 60000	// milliseconds
	},
	// Enable auto reconnection
	reconnect: {
			auto: true,
			delay: 5000, // ms
			maxAttempts: 10,
			onTimeout: false
	}
}));

console.log('GameX 数据跟踪机器人 By Jacky Gu');
console.log("Web3 connected...");

const subscription_sell = () => {
	web3.eth.subscribe('logs', {
		topics: [sellTopics]
	}, function(error, result){
	})
	.on("connected", function(subscriptionId){
		console.log('subscription_sell Id:' + subscriptionId);
	})
	.on("data", async function(log){
		await _parseSellData(log);
	})
	.on("error", function(error) {
		console.log(error);
		subscription_sell();
	})
}

const subscription_buy = () => {
	web3.eth.subscribe('logs', {
		topics: [buyTopics]
	}, function(error, result){
	})
	.on("connected", function(subscriptionId){
		console.log('subscription_buy Id:' + subscriptionId);
	})
	.on("data", async function(log){
		await _parseBuyData(log);
	})
	.on("error", function(error) {
		console.log(error)
		subscription_buy();
	})
}

const subscription_cancelSale = () => {
	web3.eth.subscribe('logs', {
		topics: [cancelSaleTopics]
	}, function(error, result) {

	})
	.on("connected", function(subscriptionId) {
		console.log('subscription_cancelSale Id:' + subscriptionId);
	})
	.on("data", async function(log) {
		await _parseCancelSale(log);
	})
	.on("error", function(error) {
		console.log(error);
		subscription_cancelSale();
	})
}

const _parseSellData = async (d) => {
	let sellData = parseSellData(web3, d);
	sellData.nftType = getNftType(sellData.nftAddress, sellData.tokenId);

	await addDB(sellData);
}

const _parseBuyData = async (d) => {
	let buyData = parseBuyData(web3, d);
	await updateBuyDB(buyData);
}

const _parseCancelSale = async (d) => {
	const cancelData = parseCancelSaleData(d);
	await updateCancelSaleDB(cancelData);
}

subscription_sell();
subscription_buy();
subscription_cancelSale();