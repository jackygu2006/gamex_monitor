const BN = require('bn.js');

const format = async (data, format, web3 = null) => {
	// Change the format of data/topics to be same in the database
	if(format === "shortenAddress") return shortenAddress(data);	
	else if(format === "toLongAddress") return toLongAddress(data);
	else if(format === "toTimestampStarSharks") return toTimestampStarSharks(data);
	else if(format === "hexToDec") return hexToDec(data);
	else if(format === "decToHex") return decToHex(data);
	else if(format === "fromWei") return data / 1e18;
	else if(format === "toNumber") return  parseInt(data);
	else if(format === "dtToTimestampFun") return toTimestampCovalent(data);
	else if(format === "decToString") return decToString(data);
	else return data;
}

const shortenAddress = (longAddress) => {
	// 0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c => 0xf24bf668aa087990f1d40ababf841456e771913c
	return '0x' + longAddress.substr(26, 40);
}

const toLongAddress = (shortAddress) => {
	// 0xf24bf668aa087990f1d40ababf841456e771913c => 0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c
	return '0x000000000000000000000000' + shortAddress.substr(2, 40);
}

const toTimestampStarSharks = (dtString) => {
	// 20202112240154368465 => timestamp of 2021 12 24 01:54:36
	const Y = dtString.substr(2, 4);
	const M = dtString.substr(6, 2);
	const D = dtString.substr(8, 2);
	const h = dtString.substr(10, 2);
	const m = dtString.substr(12, 2);
	const s = dtString.substr(14, 2);
	const timestamp = Date.parse(Y + ' ' + M + ' ' + D + ' ' + h + ':' + m + ':' + s);
	return timestamp / 1000;
}

const toTimestampCovalent = (dtString) => {
	// 2021-12-24T01:10:52Z => timestamp
	const Y = dtString.substr(0, 4);
	const M = dtString.substr(5, 2);
	const D = dtString.substr(8, 2);
	const h = dtString.substr(11, 2);
	const m = dtString.substr(14, 2);
	const s = dtString.substr(17, 2);
	const timestamp = Date.parse(Y + ' ' + M + ' ' + D + ' ' + h + ':' + m + ':' + s);
	return timestamp / 1000;
}

const hexToDec = (hex) => {
	return parseInt(hex.substr(0, 2).toLowerCase() === "0x" ? hex.substr(2, hex.length - 2) : hex, 16);
}

const decToHex = (dec) => "0x" + (new BN(dec)).toString(16);

const heightToTimestampFun = async (height, web3) => {
	const blockData = await web3.eth.getBlock(height);
	return blockData.timestamp;
}

const decToString = (dec) => {
	const bn = new BN(dec);
	const hex = bn.toString(16);
	const str = hexToAscii(hex);
	return str;
}

const hexToAscii = (str1) => {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		const char = parseInt(hex.substr(n, 2), 16);
		if(char !== 0) str += String.fromCharCode(char);
	}
	return str;
}

module.exports = {
	format,
}