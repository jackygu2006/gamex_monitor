const {format} = require('./format.js');

const dbFields = [{
	name: "topic",
}, {
	name: "senderAddress",
}, {
	name: "auctionId",
}, {
	name: "nftAddress",
}, {
	name: "tokenId",
}, {
	name: "count",
}, {
	name: "paymentToken",
}, {
	name: "amount",
}, {
	name: "dateTime",
}, {
	name: "nftType",
}, {
	name: "transferFrom",
}, {
	name: "transferTo",
}, {
	name: "uriBytes",
}, {
	name: "uriLength",
}, {
	name: "line1",
}, {
	name: "line2",
}, {
	name: "line3",
}, {
	name: "dna",
}, {
	name: "artifacts",
}];

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
const parseData = async (web3, log, typeParams, chainId, gameName) => {
	const {topic, topicIndex, dataIndex, dataTypes, constants, action} = typeParams;

	let checked = checkTypes(topicIndex, dataIndex, constants);
	if(checked.length > 0) {
		console.log('以下字段不合法，在数据库中不存在相应字段: ', checked);
		return false;
	}
	// checked = checkFieldsDefined(topicIndex, dataIndex, dataTypes, constants);
	// if(checked.length > 0) {
	// 	console.log('以下字段尚无定义', checked);
	// 	return false;
	// }

	if(topic !== log.raw_log_topics[0]) return false;

	let data = {};
	const topics = log.raw_log_topics;

	data.chainId = chainId;
	data.gameName = gameName;
	data.contractAddress = log.sender_address;
	data.blockNumber = log.block_height;
	data.transactionHash = log.tx_hash;
	data.action = action;
	
	for(let i = 0; i < topicIndex.length; i++) {
		if(topicIndex[i].format !== undefined) {
			data[topicIndex[i].key] = await format(topics[topicIndex[i].value], topicIndex[i].format);
		} else {
			data[topicIndex[i].key] = topics[topicIndex[i].value];
		}
	}

	if(log.raw_log_data !== null && log.raw_log_data !== undefined ) {
		const params = web3.eth.abi.decodeParameters(dataTypes, log.raw_log_data);
		for(let i = 0; i < dataIndex.length; i++) {
			if(dataIndex[i].format !== undefined) {
				data[dataIndex[i].key] = await format(params[dataIndex[i].value], dataIndex[i].format);
			} else {
				data[dataIndex[i].key] = params[dataIndex[i].value];	
			}
		}
	}

	for(let i = 0; i < constants.length; i++) {
		if(constants[i].format !== undefined && constants[i].formatParam !== undefined) {
			let formatParam = '';
			if(constants[i].formatParam === "heightToTimestamp") formatParam = log.block_height;
			else if (constants[i].formatParam === "dtToTimestamp") formatParam = log.block_signed_at;
			if(formatParam !== '') data[constants[i].key] = await format(formatParam, constants[i].format, web3)
		} else {
			data[constants[i].key] = constants[i].value;
		}
	}

	return data;
}

/**
 * Check if the configure key is in the database fields
 * @param {*} topicIndex 
 * @param {*} dataIndex 
 * @param {*} constants 
 * @returns 
 */
const checkTypes = (topicIndex, dataIndex, constants) => {
	let noType = [];
	for(let i = 0; i < dataIndex.length; i++) {
		let has = false;
		for(let j = 0; j < dbFields.length; j++) {
			if(dataIndex[i].key === dbFields[j].name) {
				has = true; 
				break;
			}
		}
		if(!has) noType.push(dataIndex[i].key);
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
	for(let i = 0; i < constants.length; i++) {
		let has = false;
		for(let j = 0; j < dbFields.length; j++) {
			if(constants[i].key === dbFields[j].name) {
				has = true;
				break;
			}
		}
		if(!has) noType.push(constants[i].key);
	}
	return noType;
}

/**
 * Check if all database fields are defined
 * @param {*} value 
 * @param {*} format 
 */
const checkFieldsDefined = (topicIndex, dataIndex, dataTypes, constants) => {
	let noType = [];
	if(dataIndex.length !== dataTypes.length) return ['dataTypes is error']
	for(let i = 0; i < dbFields.length; i++) {
		let has = false;
		if(topicIndex.length === 0) has = true;
		else for(let j = 0; j < topicIndex.length; j++) {
			if(topicIndex[j].key === dbFields[i].name) {
				has = true;
				break;
			}
		}
		if(dataIndex.length === 0) has = true;
		else for(let j = 0; j < dataIndex.length; j++) {
			if(dataIndex[j].key === dbFields[i].name) {
				has = true;
				break;
			}
		}
		if(constants.length === 0) has = true;
		else for(let j = 0; j < constants.length; j++) {
			if(constants[j].key === dbFields[i].name) {
				has = true;
				break;
			}
		}
		if(!has) noType.push(dbFields[i].name);
	}
	return noType;
}

module.exports = {
	parseData,
}