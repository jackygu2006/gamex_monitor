const metamonNftAddress = "0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c";
const metamonRNftAddress = "0x000000000000000000000000982b5345d0f213ecb2a8e6e24336909f59b1d6e3";
const landNftAddress = "0x00000000000000000000000038fae8721d4322d2f83d4ee44fdfca3553ffed3c";
const eggNftAddress = "0x000000000000000000000000d40c03b8680d4b6a4d78fc3c6f6a28c854e94a79";
const potionNftAddress = "0x00000000000000000000000051353799f8550c9010a8b0cbfe6c02ca96e026e2";
const yellowDiamondAddress = "0x0000000000000000000000005dc3fed851e07715965e5727592ce33d14b7828d";
// 未知nft
// 0x0000000000000000000000001f70bb2ac9b51d5c2ee32e76188d619d6eaf882a

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

const getNftType = (nftAddress) => {
	let nftType = 'other';
	if(nftAddress === metamonNftAddress) {
		nftType = 'Metamon';
	} else if(nftAddress === eggNftAddress) {
		nftType = 'egg';
	} else if(nftAddress === potionNftAddress) {
		nftType = 'potion';
	} else if(nftAddress === yellowDiamondAddress) {
		nftType = 'yellowDiamond';
	} else if(nftAddress === metamonRNftAddress) {
		nftType = 'MetamonR';
	} else if(nftAddress === landNftAddress) {
		nftType = 'land';
	}
	return nftType;
}

module.exports = {
	getNftType
}