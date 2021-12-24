const dbFields = [{
	name: "topic",
	type: "string",
}, {
	name: "senderAddress",
	type: "string",
}, {
	name: "auctionId",
	type: "string",
}, {
	name: "nftAddress",
	type: "string",
}, {
	name: "tokenId",
	type: "string",
}, {
	name: "count",
	type: "string",
}, {
	name: "paymentToken",
	type: "string",
}, {
	name: "amount",
	type: "string",
}, {
	name: "dateTime",
	type: "date",
}
];

/**
 * 
 * @param {*} web3 
 * @param {*} log ex. https://api.covalenthq.com/v1/56/events/address/0xe97fdca0a3fc76b3046ae496c1502c9d8dfef6fc/?quote-currency=USD&format=JSON&starting-block=13268938&ending-block=13270000&page-number=0&page-size=10&key=ckey_ce266e13a4534c628658d103a92
 * @param {*} topic 
 * @param {*} topicIndex: [{key: "topic", value: 0}, {key: "sellerAddress", value: 1}, {key: "auctionId", value: 2}, {key: "nftAddress", value: 3}] 
 * @param {*} dataIndex: [{key: "tokenId", value: 0}, {key: "count", value: 1}, {key: "paymentToken", value: 2}, {key: "amount", value: 3}, {key: "startDate", value: 5}, {key: "endDate", value: 6}] 
 * @param {*} dataTypes : ['uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256']
 * @returns 
 */
const parseData = (web3, log, typeParams) => {
	const {topic, topicIndex, dataIndex, dataTypes, action} = typeParams;

	const checked = checkTypes(topicIndex, dataIndex);
	if(checked.length > 0) {
		console.log('以下字段不合法，在数据库中不存在相应字段: ', checked);
		return false;
	}

	if(topic !== log.raw_log_topics[0]) {
		console.log('topic is not matching');
		return false;
	}

	let data = {};
	const topics = log.raw_log_topics;

	data.contractAddress = log.sender_address;
	data.blockNumber = log.block_height;
	data.transactionHash = log.tx_hash;
	data.action = action;
	
	for(let i = 0; i < topicIndex.length; i++) data[topicIndex[i].key] = topics[topicIndex[i].value];

	const params = web3.eth.abi.decodeParameters(dataTypes, log.raw_log_data);
	for(let i = 0; i < dataIndex.length; i++) data[dataIndex[i].key] = params[dataIndex[i].value];
	return data;
}

const checkTypes = (topicIndex, dataIndex) => {
	let noType = [];
	for(let i = 0; i < dataIndex.length; i++) {
		let has = false;
		for(let j = 0; j < dbFields.length; j++) {
			if(dataIndex[i].key === dbFields[j].name) {
				has = true; 
				break;
			}
		}
		if(!has) {
			console.log(i, dataIndex[i])
			noType.push(dataIndex[i].key);
		}
	}
	for(let i = 0; i < topicIndex.length; i++) {
		let has = false;
		for(let j = 0; j < dbFields.length; j++) {
			if(topicIndex[i].key === dbFields[j].name) {
				has = true;
				break;
			}
		}
		if(!has) noType.push(topicIndex[i].key);
	}
	return noType;
}

const format = (value, format) => {
	// ######
	// Change the format of data/topics to be same in the database

}

module.exports = {
	parseData,
}