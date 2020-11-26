const Discord = require('discord.js');
const CardImgData = require('../cardImgData.js')
const leadColors = {
	"Prisoner": 0x9e42f5,
	"Jedo": 0x425df5,
	"Kahar": 0x1bc0cc,
	"Joanne": 0x32d142,
	"Hush": 0xab0341,
	"Maldeva": 0x987bbd
}
let {importCode, sortDeck} = require('../stolenUtils.js')

function deck(args, msg){
  let embed = new Discord.MessageEmbed()
  let deckData = importCode(args[1]);
  if(!deck){
    msg.channel.send("Sorry, I don't recognize that deck code.")
  }else{
		let deck = deckData.deck;
	  embed.setColor(leadColors[deckData.lead]);
	  deck.sort(sortDeck);
	  embed.setTitle(`Imported Deck (${deckData.lead})`)
	  embed.setDescription(deck.map(_=>_.in_deck==1?`(${_.rating}) ${_.name}\n`:`(${_.rating}) ${_.name}\n`.repeat(2)).join(''))
	  msg.channel.send(embed)
	}
}


module.exports = deck
