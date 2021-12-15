
const BUY = 1;
const SELL = 2;

const parseSellData = (web3, d) => {
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

	return sellData;
}

const parseBuyData = (web3, d) => {
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

	return buyData;
}

const parseCancelSaleData = (d) => {
	const topics = d.topics;
	let data = {};
	data.seller = topics[1];
	data.auctionId = topics[2];
	data.nftAddress = topics[3];
	return data;
}

module.exports = {
	parseSellData,
	parseBuyData,
	parseCancelSaleData
}