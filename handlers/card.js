const Discord = require('discord.js')
const CardImgData = require('../cardImgData.js')
const TokenData = require('../tokendata.js')
const fs = require('fs')
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
	let showAlt = args.indexOf('alt') == -1 ? false : args.splice(args.indexOf('alt'))
	//if(showAlt)args.pop();
	let query = args.slice(1).join(' ');
  let search = cards.search(query)[0];
	let tokenSearch = tokens.search(query)[0];
	search['isToken'] = false;
	if(search && tokenSearch){
		if(tokenSearch.score > search.score){
				search = tokenSearch
				search.isToken = true;
		}
	}
  //console.log(data)
  if(!search){
    msg.channel.send("Sorry, I couldn't find the card you're looking for. Maybe try a !search?")
  }else{
    let data = search.item;
		let filePath = `./All Cards/${data.leader}/FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`
		//let altCheck = fs.existsSync(`./All Cards/${data.leader}/alt_1/FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`)
		let numAlts = search.isToken ? 0 : data.art_vers.length - 1;
		var altCheck = false;
		if(numAlts > 0){
			altCheck = true;
		}
		if(showAlt){
			if(!altCheck){
				msg.channel.send('Could not find alt art for the specified card, defaulting to the normal art. If you believe this to be an error, contact @Sprocket#0781.')
			}else{
				let altNum = 1;
				if(showAlt[1] && showAlt[1] != '1'){
					if(data.art_vers.includes((parseInt(showAlt[1]) * 2) + 1))altNum = parseInt(showAlt[1]);
				}
				filePath = `./All Cards/${data.leader}/alt_${altNum}/FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`
			}
		}
    let embed = new Discord.MessageEmbed()
      .setTitle(`${data.name} (${data.rating})`)
      .setDescription(`${formatLeadText(data.leader)} ${data.creature?`**${data.power}/${data.hp}**`:`**Spell**`}\n${data.cardtext?`*${data.cardtext}*`:''}${data.tokens?`${data.tokens.map(_=>`\n${_.name}: ${_.power}/${_.hp} ${_.cardtext?`*${_.cardtext}*`:''}`)}`:''}${(altCheck&&!showAlt)?`\nThis card has alt ${numAlts > 1 ? 'arts' : 'art'}. View ${numAlts > 1 ? 'them' : 'it'} by adding \'alt\' to the end of the command${numAlts > 1 ? ` followed by a number 1-${numAlts} indicating which alt art you would like to view` :''}.`:''}`)
      .attachFiles([filePath])
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
