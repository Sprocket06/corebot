const Discord = require('discord.js')
const CardImgData = require('../cardImgData.js')
const TokenData = require('../tokendata.js')
/**/Object.keys(CardImgData).forEach(_=>{
	if(CardImgData[_].token_ids){
		CardImgData[_].tokens = []
		let cards = CardImgData[_].token_ids.split(';')
		cards.forEach(card=>{
			card = card.split(',')
			let cData = TokenData[card[0]][card[1]]
      console.log(card,cData)
			CardImgData[_].tokens.push(cData)
		})
	}else{
		CardImgData[_].tokens = []
	}
})/**/
const {cards, tokens} = require('../cardSearch.js')

function card(args, msg){
  //let name = args.slice()
  //let data = Object.values(CardImgData).find(_=>_.name.toLowerCase() == args.slice(1).join(' ').toLowerCase())
	let query = args.slice(1).join(' ');
  let search = cards.search(query)[0];
	let tokenSearch = tokens.search(query)[0];
	if(search && tokenSearch){
		if(tokenSearch.score > search.score){
				search = tokenSearch
		}
	}
  //console.log(data)
  if(!search){
    msg.channel.send("Sorry, I couldn't find the card you're looking for. Maybe try a !search?")
  }else{
    let data = search.item;
    let embed = new Discord.MessageEmbed()
      .setTitle(`${data.name} (${data.rating})`)
      .setDescription(`${formatLeadText(data.leader)} ${data.creature?`**${data.power}/${data.hp}**`:`**Spell**`}\n*${data.cardtext}*${data.tokens?`${data.tokens.map(_=>`\n${_.name}: ${_.power}/${_.hp} ${_.cardtext?`*${_.cardtext}*`:''}`)}`:''}`)
      .attachFiles([`./All Cards/${data.leader}/FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`])
      .setImage(`attachment://FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`);
    msg.channel.send(embed)
  }
}

function formatLeadText(leader){
	let leadtext = leader
	let leads = leader.match(/[A-Z]/g)
	if(leads.length > 1){
		let i = leader.indexOf(leads[1])
		leadtext = `${leadtext.substring(0,i)} / ${leadtext.substring(i)}`
	}
	return leadtext
}

module.exports = card
