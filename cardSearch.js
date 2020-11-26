const Fuse = require('fuse.js')
const FuseOpts = {
	threshold: 0.15,
	includeScore: true,
	includeMatches: true,
	minMatchCharLength: 4,
	ignoreLocation:true,
	keys: ['name','cardtext','tokens.name','tokens.cardtext']
}
const CardImgData = require('./cardImgData.js');
const TokenData = require('./tokendata.js')
Object.keys(CardImgData).forEach(_=>{
	if(CardImgData[_].token_ids){
		CardImgData[_].tokens = []
		let cards = CardImgData[_].token_ids.split(';')
		cards.forEach(card=>{
			card = card.split(',')
			let cData = TokenData[card[0]][card[1]]
			CardImgData[_].tokens.push(cData)
		})
	}else{
		CardImgData[_].tokens = []
	}
})

let fuse = new Fuse(Object.values(CardImgData), FuseOpts);

module.exports = fuse;
