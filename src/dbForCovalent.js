const date = require('date-and-time');
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
});

const addDB = async (sellData) => {
	try {
		// Check if duplicated transaction hash
		const sql1 = `select * from orders where transactionHash = '${sellData.transactionHash}'`;
		return connection.query(sql1, async function(error, result, fields) {
			if(result.length > 0) {
				return false;
			} else {
				const sql = `INSERT into orders(contractAddress, sellerAddress, auctionId, nftAddress, blockNumber, transactionHash, tokenId, count, paymentToken, amount, startingPrice, startDate, endDate, nftType, action, createdAt) values ('` + sellData.contractAddress + `','` + sellData.senderAddress + `', '` + sellData.auctionId + `', '` + sellData.nftAddress + `', ` + sellData.blockNumber + `, '` + sellData.transactionHash + `', '` + sellData.tokenId + `', ` + sellData.count + `, '` + sellData.paymentToken + `', ` + sellData.amount + `, '` + sellData.amount + `', ` + sellData.dateTime + `, 3000000000, '` + sellData.nftType + `', '` + sellData.action + `', unix_timestamp())`;
				const promise = new Promise((resolve, reject) => {
					connection.query(
						sql,
						function (error, data, fields) {
							if(error) return reject(error);
							else {
								const dt = date.format(new Date(sellData.dateTime * 1000), 'YYYY-MM-DD HH:mm:ss');
								console.log(`=> ${dt} Sell ${sellData.nftType} #${sellData.tokenId} @${sellData.amount} hash ${sellData.transactionHash}`);
								return resolve(data);
							}
						}
					)
				})
				return promise;	
			}
		})
	} catch (error) {
		console.error(error);
	}
}

const updateBuyDB = async (buyData) => {
	try {
		const sql = `select * from orders where nftAddress = '${buyData.nftAddress}' and tokenId = '${buyData.tokenId}' and auctionId = '${buyData.auctionId}'`;
		return connection.query(sql, async function(error, data1, fields) {
			if(data1.length == 0 || data1[0].buyerTimestamp > 0) return false;
			else {
				const sellData = data1[0];
				const sql = `update orders set buyerAmount = ${buyData.amount}, buyerAddress = '${buyData.senderAddress}', buyerTransactionHash = '${buyData.transactionHash}', buyerBlockNumber = ${buyData.blockNumber}, buyerAction= '${buyData.action}', buyerTimestamp = '${buyData.dateTime}' where nftAddress = '${buyData.nftAddress}' and tokenId = '${buyData.tokenId}' and auctionId = '${buyData.auctionId}'`;
				const promise = new Promise((resolve, reject) => {
					connection.query(
						sql,
						function (error, data2, fields) {
							if(error) return reject(error);
							else {
								const dt = date.format(new Date(buyData.dateTime * 1000), 'YYYY-MM-DD HH:mm:ss');
								console.log(`<= ${dt} Buy ${sellData.nftType} #${sellData.tokenId} @${sellData.amount} hash ${buyData.transactionHash}`);
								return resolve(data2);
							}
						}
					)
				})
				return promise;
			}
		})
	} catch (error) {
		console.error(error);
	}
}

const updateCancelSaleDB = async (cancelData) => {
	try {
		const sql1 = `SELECT * from orders where auctionId = '${cancelData.auctionId}'`;
		return connection.query(sql1, async function(error, data1, fields) {
			if(data1.length == 0 || data1[0].cancelSale == 1) return false;
			else {
				const sql = `update orders set cancelSale = 1 where nftAddress = '${cancelData.nftAddress}' and auctionId = '${cancelData.auctionId}'`;
				return new Promise((resolve, reject) => {
					connection.query(
						sql,
						function(error, data, fields) {
							if(error) return reject(error);
							else {
								console.log(`=> Cancel #${cancelData.auctionId}`);
								return resolve(data);
							}
						}
					)
				})						
			}
		})
	} catch(error) {
		console.error(error);
	}
}

const updatePriceSaleDB = async (updateData) => {
	try {
		const sql1 = `SELECT * from orders where auctionId = '${updateData.auctionId}'`;
		return connection.query(sql1, async function(error, data1, fields) {
			if(data1.length == 0) return false;
			else {
				const sql = `update orders set amount = ${updateData.amount}, startingPrice = ${updateData.amount} where nftAddress = '${updateData.nftAddress}' and auctionId = '${updateData.auctionId}'`;
				return new Promise((resolve, reject) => {
					connection.query(
						sql,
						function(error, data, fields) {
							if(error) return reject(error);
							else {
								console.log(`=> UpdatePrice #${updateData.auctionId} to ${updateData.amount}`);
								return resolve(data);
							}
						}
					)
				})						
			}
		})
	} catch(error) {
		console.error(error);
	}
}

/**
 * Cause the database duplicated write, do the following sql and delete the duplicated records
 */
const deleteDuplicateRowsByField = async (field) => {
	try {
		const sql = `delete orders from orders inner join (select max(id) as lastId, ${field} from orders group by ${field} having count(*) > 1) duplic on duplic.${field} = orders.${field} where orders.id < duplic.lastId`;
		return connection.query(sql, function(error, data, fields) {
			console.log(`Delete duplicated ${field} rows: ${data.affectedRows}`);
			return data.affectedRows;
		})	
	} catch(error) {
		console.error(error);
	}
}

module.exports = {
	updateCancelSaleDB,
	updateBuyDB,
	addDB,
	deleteDuplicateRowsByField,
	updatePriceSaleDB,
}