/**
 * JackyGu 2021-12-3
 */
const date = require('date-and-time');
const Web3 = require('web3');
const mysql = require('mysql');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic')
require('dotenv').config();
 
/**
 * 
例子1: 以下是卖蛋的参数
https://www.bscscan.com/tx/0x0b78a78ed81b16152e77e8fd459c92bc411327908277b39c78fc27b058d080f0#eventlog
发送交易DATA
0x467f963d sell方法
000000000000000000000000d40c03b8680d4b6a4d78fc3c6f6a28c854e94a79 nftAddress（蛋）
0000000000000000000000000000000000000000000000000000000000000000 tokenId
0000000000000000000000000000000000000000000000000000000000000002 count
00000000000000000000000012bb890508c125661e03b09ec06e404bc9289040 paymentToken(RACA)
00000000000000000000000000000000000000000001707596c91ce527800000 startingPrice(单价*数量)
0000000000000000000000000000000000000000000000000000000000000000 startDate
0000000000000000000000000000000000000000000000000000000000000000 endDate

对应的Logs
topic 0x6656db943f28baede9b164738dc5fa235b9da60d5c20a38b0eb0230c 21196254
000000000000000000000000c6090ee2184e4d0d425987432aaeb17fb39b4192 sellAddress
7770285f13d31daf82ae18cd75429100ce2b399dca3430c2e5699ed064e2be98 auctionId
000000000000000000000000d40c03b8680d4b6a4d78fc3c6f6a28c854e94a79 nftAddress(蛋的合约)

Data:
0000000000000000000000000000000000000000000000000000000000000000 tokenId
0000000000000000000000000000000000000000000000000000000000000002 count
00000000000000000000000012bb890508c125661e03b09ec06e404bc9289040 paymentToken(RACA)
00000000000000000000000000000000000000000001707596c91ce527800000 startingPrice
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000061a9f218 startDate
000000000000000000000000000000000000000000000000ffffffffffffffff endDate
00000000000000000000000000000000000000000000000000000000001f6f2a n/a

例子2：以下是卖元兽的参数
https://www.bscscan.com/tx/0x159da7dcee7e5d87d35ebc372cdb475bb4d8c2b7a843e5368836cacd82e12170
发送交易DATA
0x467f963d
000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c nftAddress(元兽)
0000000000000000000000000000000000000000000000000000000000078e24 tokenId
0000000000000000000000000000000000000000000000000000000000000001 count
00000000000000000000000012bb890508c125661e03b09ec06e404bc9289040 paymentToken(RACA)
00000000000000000000000000000000000000000000a6953fd2d8e701680000 startingPrice
0000000000000000000000000000000000000000000000000000000000000000 startDate
0000000000000000000000000000000000000000000000000000000000000000 endDate

对应的Logs: 
topic 0x6656db943f28baede9b164738dc5fa235b9da60d5c20a38b0eb0230c21196254
0000000000000000000000000000000000000000000000000000000000078e24 tokenId
0000000000000000000000000000000000000000000000000000000000000001 count
00000000000000000000000012bb890508c125661e03b09ec06e404bc9289040 paymentToken(RACA)
00000000000000000000000000000000000000000000a6953fd2d8e701680000 startingPrice
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000061a8d2de startDate
000000000000000000000000000000000000000000000000ffffffffffffffff endDate
00000000000000000000000000000000000000000000000000000000001de4d3 n/a

================================================================
购买：executeAuction
发送交易DATA
0x25d377f7
5040d0c612d7ccb8c7617508c08f46d3b89230d7491b7b38e79b3baca643510a auctionId
00000000000000000000000000000000000000000000e185c403ec2b27a00000 amount(RACA)

对应的Log
0x1e58c00385b2026e41e3dcdd07c0117f1e182f8fd553676950d681ea12185b34 topic
0x000000000000000000000000fee560fd3e4b6a096bfc465304209598c70829de buyerAddress
0x5040d0c612d7ccb8c7617508c08f46d3b89230d7491b7b38e79b3baca643510a auctionId
0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c nftAddress

Data
000000000000000000000000000000000000000000000000000000000006031d tokenId
00000000000000000000000000000000000000000000e185c403ec2b27a00000 amount(RACA)
0000000000000000000000000000000000000000000000000000000061a8bbd9 buyTimestamp

================================================================
1- 自动购买解决方案
- 侦听卖单log, topic: 0x6656db943f28baede9b164738dc5fa235b9da60d5c20a38b0eb0230c21196254
- 获取卖单信息
- 与自己设定的条件比较
- 符合条件的，下单

2- 自动卖出解决方案

================================================================
授权DATA
发起账号账号：0x8844A26344C97134B0D5bd8B8493C5Ab10799843
买蛋合约：
0x095ea7b3
000000000000000000000000e97fdca0a3fc76b3046ae496c1502c9d8dfef6fc
000000000000000000000000000000000000000000000fab8c4c3b325a400000


买药水
0x095ea7b3
000000000000000000000000e97fdca0a3fc76b3046ae496c1502c9d8dfef6fc
0000000000000000000000000000000000000000000020c58e70ee60dd200000
================================================================

*/

const rpcUrl = 'https://nd-475-177-088.p2pify.com/d86115e778aa9c1e71b5403a89b73fa9';
const wss = 'wss://ws-nd-475-177-088.p2pify.com/d86115e778aa9c1e71b5403a89b73fa9';

const ADMIN_PRI_KEY = process.env.ADMIN_PRI_KEY;
const FixedPriceSellJson = require('./contracts/FixedPriceSell.json');
const FixedPriceSellJsonAddress = "0x7B4452dD6c38597fa9364AC8905C27EA44425832";
const sellAddress = "0x77B8277cE46d2ddeDda0Ff43a41452D9c1D473B4"; // Old contract
const metamonNftAddress = "0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c";
const metamonRNftAddress = "0x000000000000000000000000982b5345d0f213ecb2a8e6e24336909f59b1d6e3";
const landNftAddress = "0x00000000000000000000000038fae8721d4322d2f83d4ee44fdfca3553ffed3c";
const eggNftAddress = "0x000000000000000000000000d40c03b8680d4b6a4d78fc3c6f6a28c854e94a79";
const potionNftAddress = "0x00000000000000000000000051353799f8550c9010a8b0cbfe6c02ca96e026e2";
const yellowDiamondAddress = "0x0000000000000000000000005dc3fed851e07715965e5727592ce33d14b7828d";
// 未知nft
// 0x0000000000000000000000001f70bb2ac9b51d5c2ee32e76188d619d6eaf882a

const sellTopics = "0x6656db943f28baede9b164738dc5fa235b9da60d5c20a38b0eb0230c21196254";
const buyTopics = "0x1e58c00385b2026e41e3dcdd07c0117f1e182f8fd553676950d681ea12185b34";

const BUY = 1;
const SELL = 2;

const actions = {
	buyEgg: {
		enabled: true,
		topPrice: 80000,
	}, 
	buyMetamon: {
		enabled: true,
		topPrice: 700000,
	}, 
	buyMetamonR: {
		enabled: true,
		topPrice: 3000000,
	},
	buyLand: {
		enabled: true,
		topPrice: 200000,
	},
	buyPotion: {
		enabled: true,
		topPrice: 5500,
	}, 
	buyYellowDiamond: {
		enabled: true,
		topPrice: 30000
	}, 
	buyPurpleDiamond: {
		enabled: false,
		topPrice: 0
	}
}

// const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
const web3 = new Web3(new Web3.providers.WebsocketProvider(wss));
console.log('Metamon 数据跟踪机器人 By Jacky Gu');
console.log("Web3 connected...");

const fixedPriceSellContract = new web3.eth.Contract(FixedPriceSellJson.abi, FixedPriceSellJsonAddress);
const account = web3.eth.accounts.privateKeyToAccount('0x' + ADMIN_PRI_KEY);

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
});

web3.eth.accounts.wallet.add(account)

const subscription_sell = () => {
	web3.eth.subscribe('logs', {
		topics: [sellTopics]
	}, function(error, result){
	})
	.on("connected", function(subscriptionId){
		console.log('subscription_sell Id:' + subscriptionId);
	})
	.on("data", async function(log){
		await parseSellData(log);
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
		await parseBuyData(log);
	})
	.on("error", function(error) {
		console.log(error)
		subscription_buy();
	})
}

const parseSellData = async (d) => {
	let sellData = {};
	const topics = d.topics;
	const data = d.data;
	sellData.contractAddress = d.address;
	sellData.sellerAddress = topics[1];
	sellData.auctionId = topics[2];
	sellData.nftAddress = topics[3];
	sellData.blockNumber = d.blockNumber;
	sellData.transactionHash = d.transactionHash;
	sellData.blockHash = d.blockHash;
	sellData.logIndex = d.logIndex;
	sellData.logId = d.id;
	sellData.action = SELL;

	const params = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'], data);
	sellData.tokenId = params[0];
	sellData.count = params[1];
	sellData.paymentToken = params[2];
	sellData.amount = params[3] / 1e18;
	sellData.startingPrice = parseInt(sellData.amount / sellData.count);
	sellData.startDate = params[5];
	sellData.endDate = params[6];

	if(sellData.nftAddress === metamonNftAddress) {
		sellData.nftType = 'Metamon';
		if(actions.buyMetamon.enabled && sellData.startingPrice <= actions.buyMetamon.topPrice) buy(sellData);
	} else if(sellData.nftAddress === eggNftAddress) {
		sellData.nftType = 'egg';
		if(actions.buyEgg.enabled && sellData.startingPrice <= actions.buyEgg.topPrice) buy(sellData);
	} else if(sellData.nftAddress === potionNftAddress) {
		sellData.nftType = 'potion';
		if(actions.buyPotion.enabled && sellData.startingPrice <= actions.buyPotion.topPrice) buy(sellData);
	} else if(sellData.nftAddress === yellowDiamondAddress) {
		sellData.nftType = 'yellowDiamond';
		if(actions.buyYellowDiamond.enabled && sellData.startingPrice <= actions.buyYellowDiamond.topPrice) buy(sellData);
	} else if(sellData.nftAddress === metamonRNftAddress) {
		sellData.nftType = 'MetamonR';
		if(actions.buyMetamonR.enabled && sellData.startingPrice <= actions.buyMetamonR.topPrice) buy(sellData);
	} else if(sellData.nftAddress === landNftAddress) {
		sellData.nftType = 'land';
		if(actions.buyLand.enabled && sellData.startingPrice <= actions.buyLand.topPrice) buy(sellData);
	} else {
		sellData.nftType = 'other';
	}
	const dt = date.format(sellData.startDate * 1000, 'YYYY-MM-DD HH:mm:ss');
	console.log(`=> ${dt} Sell ${sellData.nftType} #${sellData.tokenId} @${sellData.startingPrice} RACA hash ${sellData.transactionHash}`);
	await addDB(sellData);
}

const parseBuyData = async (d) => {
	let buyData = {};
	const topics = d.topics;
	const data = d.data;
	buyData.buyerTransactionHash = d.transactionHash;
	buyData.buyerBlockHash = d.blockHash;
	buyData.buyerLogIndex = d.logIndex;
	buyData.buyerLogId = d.id;
	buyData.buyerBlockNumber = d.blockNumber;
	buyData.buyerAction = BUY;

	buyData.buyerAddress = topics[1];
	buyData.auctionId = topics[2];
	buyData.nftAddress = topics[3];

	const params = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint256'], data);
	buyData.tokenId = params[0];
	buyData.buyerAmount = params[1] / 1e18;
	buyData.buyerTimestamp = params[2];

	const sql = `select * from orders where nftAddress = '${buyData.nftAddress}' and tokenId = '${buyData.tokenId}' && auctionId = '${buyData.auctionId}'`;
	connection.query(sql, async function(error, data, fields) {
		if(data.length == 0) return;
		else {
			await updateBuyDB(buyData, data[0]);
		}
	})
}


const addDB = async (data) => {
	try {
		const sql = `INSERT into orders(contractAddress, sellerAddress, auctionId, nftAddress, blockNumber, transactionHash, blockHash, logIndex, logId, tokenId, count, paymentToken, amount, startingPrice, startDate, endDate, nftType, action, createdAt) values ('` + data.contractAddress + `','` + data.sellerAddress + `', '` + data.auctionId + `', '` + data.nftAddress + `', ` + data.blockNumber + `, '` + data.transactionHash + `', '` + data.blockHash + `', ` + data.logIndex + `, '` + data.logId + `', '` + data.tokenId + `', ` + data.count + `, '` + data.paymentToken + `', ` + data.amount + `, '` + data.startingPrice + `', ` + data.startDate + `, 3000000000, '` + data.nftType + `', ` + data.action + `, unix_timestamp())`;
		const promise = new Promise((resolve, reject) => {
			connection.query(
				sql,
				function (error, data, fields) {
					if(error) return reject(error);
					else return resolve(data);
				}
			)
		})
		return promise;
	} catch (error) {
		console.error(error);
	}
}

const updateBuyDB = async (data, sellData) => {
	const dt = date.format(data.buyerTimestamp * 1000, 'YYYY-MM-DD HH:mm:ss');
	console.log(`<= ${dt} Buy ${sellData.nftType} #${sellData.tokenId} @${sellData.startingPrice} RACA hash ${data.buyerTransactionHash}`);
	try {
		const sql = `update orders set buyerAmount = ${data.buyerAmount}, buyerAddress = '${data.buyerAddress}', buyerTransactionHash = '${data.buyerTransactionHash}', buyerBlockHash = '${data.buyerBlockHash}', buyerLogIndex = ${data.buyerLogIndex}, buyerLogId = '${data.buyerLogId}', buyerBlockNumber = ${data.buyerBlockNumber}, buyerAction= ${data.buyerAction}, buyerTimestamp = ${data.buyerTimestamp} where nftAddress = '${data.nftAddress}' and tokenId = '${data.tokenId}' and auctionId = '${data.auctionId}'`;
		const promise = new Promise((resolve, reject) => {
			connection.query(
				sql,
				function (error, data, fields) {
					if(error) return reject(error);
					else return resolve(data);
				}
			)
		})
		return promise;
	} catch (error) {
		console.error(error);
	}
}

const buy = (sellData) => {
	// console.log("价格合适，购买...");

}

subscription_sell();
subscription_buy();
