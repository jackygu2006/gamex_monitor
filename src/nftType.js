const metamonNft =     	"0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c";
const metamonRNft =    	"0x000000000000000000000000982b5345d0f213ecb2a8e6e24336909f59b1d6e3";
const dragonFriutDog = 	"0x00000000000000000000000038fae8721d4322d2f83d4ee44fdfca3553ffed3c";
const egg = 					 	"0x000000000000000000000000d40c03b8680d4b6a4d78fc3c6f6a28c854e94a79";
const potion = 					"0x00000000000000000000000051353799f8550c9010a8b0cbfe6c02ca96e026e2";
const newDiamond = 			"0x0000000000000000000000005dc3fed851e07715965e5727592ce33d14b7828d";
const MPB = 						"0x000000000000000000000000061c6eeca7b14cf4ec1b190dd879008dd7d7e470";
const BMM = 						"0x0000000000000000000000006efdd0380c9dde9c50ae99669d8ffd9439efcdbd";
const tesla = 					"0x000000000000000000000000123c129d6338858dff0543ac091e05a481c335b7";
const spaceX = 					"0x000000000000000000000000406f9a5779571e2d8abefb367cdc90d848b88471";
const ding = 						"0x000000000000000000000000d4d63f37a13cbc99094afcf8187142af783e29b8";
const oldYellowDiamond = "0x000000000000000000000000872028d15bd53d11561856909d4d3eaa4e846b64";
const oldPurpleDiamond = "0x0000000000000000000000001f70bb2ac9b51d5c2ee32e76188d619d6eaf882a";
const bmbMusk = 				"0x000000000000000000000000db3a8fb8bacd8ccece587344f3e704abe27f7581";
const mbmRaca = 				"0x000000000000000000000000252b6d73afbd35919d80297e86690473aadf1b62";
const mysteryBox = 			"0x0000000000000000000000004eb7ddd1b0103349fd289c5a4e4b95a0cc68d19e";
const potionAvatar = 		"0x000000000000000000000000b9e879719c1271d044a5a3007797613478552d36";
const metamonUsmLand = 	"0x0000000000000000000000009c4f74d1d0399afc80e2d71daddf3c4c3f886e94";
const muskUsmLand = 		"0x000000000000000000000000b5665e1038c4e17c58ab55b5c591fab52ce83fc4";
const kissUpLand = 			"0x0000000000000000000000008460cc2f040828ff59f72d2bd6cc672fafff1941";

/*
update orders set nftType='Metamon' where nftAddress = '0x000000000000000000000000f24bf668aa087990f1d40ababf841456e771913c';
update orders set nftType='Metamon-R' where nftAddress = '0x000000000000000000000000982b5345d0f213ecb2a8e6e24336909f59b1d6e3';
update orders set nftType='Dragon Friut Dog' where nftAddress = '0x00000000000000000000000038fae8721d4322d2f83d4ee44fdfca3553ffed3c';
update orders set nftType='Egg' where nftAddress = '0x000000000000000000000000d40c03b8680d4b6a4d78fc3c6f6a28c854e94a79';
update orders set nftType='Potion' where nftAddress = '0x00000000000000000000000051353799f8550c9010a8b0cbfe6c02ca96e026e2';
update orders set nftType='MPB(Matrix Plus Box)' where nftAddress = '0x000000000000000000000000061c6eeca7b14cf4ec1b190dd879008dd7d7e470';
update orders set nftType='BMM(Bake Musk Mixer)' where nftAddress = '0x0000000000000000000000006efdd0380c9dde9c50ae99669d8ffd9439efcdbd';
update orders set nftType='TESLA' where nftAddress = '0x000000000000000000000000123c129d6338858dff0543ac091e05a481c335b7';
update orders set nftType='SpaceXNaut Dog' where nftAddress = '0x000000000000000000000000406f9a5779571e2d8abefb367cdc90d848b88471';
update orders set nftType='DING' where nftAddress = '0x000000000000000000000000d4d63f37a13cbc99094afcf8187142af783e29b8';
update orders set nftType='Old Yellow Diamond' where nftAddress = '0x000000000000000000000000872028d15bd53d11561856909d4d3eaa4e846b64';
update orders set nftType='Old Purple Diamond' where nftAddress = '0x0000000000000000000000001f70bb2ac9b51d5c2ee32e76188d619d6eaf882a';
update orders set nftType='BMBMusk' where nftAddress = '0x000000000000000000000000db3a8fb8bacd8ccece587344f3e704abe27f7581';
update orders set nftType='MBMRaca' where nftAddress = '0x000000000000000000000000252b6d73afbd35919d80297e86690473aadf1b62';
update orders set nftType='Mystery Box' where nftAddress = '0x0000000000000000000000004eb7ddd1b0103349fd289c5a4e4b95a0cc68d19e';
update orders set nftType='Potion Avatar' where nftAddress = '0x000000000000000000000000b9e879719c1271d044a5a3007797613478552d36';
update orders set nftType='Metamon USM Land' where nftAddress = '0x0000000000000000000000009c4f74d1d0399afc80e2d71daddf3c4c3f886e94';
update orders set nftType='Musk USM Land' where nftAddress = '0x000000000000000000000000b5665e1038c4e17c58ab55b5c591fab52ce83fc4';
update orders set nftType='Kiss-up State Land' where nftAddress = '0x0000000000000000000000008460cc2f040828ff59f72d2bd6cc672fafff1941';

update orders set nftType='New Yellow Diamond' where nftAddress = '0x0000000000000000000000005dc3fed851e07715965e5727592ce33d14b7828d' and tokenId = '0';
update orders set nftType='New Purple Diamond' where nftAddress = '0x0000000000000000000000005dc3fed851e07715965e5727592ce33d14b7828d' and tokenId = '1';
update orders set nftType='New Black Diamond' where nftAddress = '0x0000000000000000000000005dc3fed851e07715965e5727592ce33d14b7828d' and tokenId = '2';

*/
const getNftType = (nftAddress, tokenId) => {
	let nftType = 'other';
	if(nftAddress === metamonNft) {
		nftType = 'Metamon';
	} else if(nftAddress === egg) {
		nftType = 'Egg';
	} else if(nftAddress === potion) {
		nftType = 'Potion';
	} else if(nftAddress === newDiamond && parseInt(tokenId) === 0) {
		nftType = 'New Yellow Diamond';
	} else if(nftAddress === newDiamond && parseInt(tokenId) === 1) {
		nftType = 'New Purple Diamond';
	} else if(nftAddress === newDiamond && parseInt(tokenId) === 2) {
		nftType = 'New Black Diamond';
	} else if(nftAddress === metamonRNft) {
		nftType = 'Metamon-R';
	} else if(nftAddress === dragonFriutDog) {
		nftType = 'Dragon Friut Dog';
	} else if(nftAddress === oldYellowDiamond) {
		nftType = 'Old Yellow Diamond';
	} else if(nftAddress === oldPurpleDiamond) {
		nftType = 'Old Purple Diamond';
	} else if(nftAddress === MPB) {
		nftType = 'MPB(Matrix Plus Box)';
	} else if(nftAddress === BMM) {
		nftType = 'BMM(Bake Musk Mixer)';
	} else if(nftAddress === bmbMusk) {
		nftType = 'BMBMusk';
	} else if(nftAddress === tesla) {
		nftType = 'TESLA';
	} else if(nftAddress === spaceX) {
		nftType = 'SpaceXNaut Dog';
	} else if(nftAddress === ding) {
		nftType = 'DING';
	} else if(nftAddress === mbmRaca) {
		nftType = 'MBMRaca';
	} else if(nftAddress === mysteryBox) {
		nftType = 'Mystery Box';
	} else if(nftAddress === potionAvatar) {
		nftType = 'Potion Avatar';
	} else if(nftAddress === metamonUsmLand) {
		nftType = 'Metamon USM Land';
	} else if(nftAddress === muskUsmLand) {
		nftType = 'Musk USM Land';
	} else if(nftAddress === kissUpLand) {
		nftType = 'Kiss-up State Land';
	}
	return nftType;
}

module.exports = {
	getNftType
}