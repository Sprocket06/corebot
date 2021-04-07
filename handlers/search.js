const {cards, tokens} = require('../cardSearch.js')
const cData = require('../cardImgData.js')
const Discord = require('discord.js')
const CommandManager = require('../commandManager.js')


function search(args, msg){
  let query = args.slice(1).join(' ')
  let cardSearch = cards.search(query)
  let tokenSearch = tokens.search(query)
  let search = cardSearch
  if(tokenSearch){
    tokenSearch.forEach(item=>{
      item.item.name = item.item.name + ' (Token)'
      search.push(item)
    })
  }
  if(search){
    let embed = new Discord.MessageEmbed()
      .setTitle('Card Search')
      .setDescription(`**Found ${search.length} results for "${query}":**\n${search.map(_=>_.item.name).join('\n')}`)
    msg.channel.send(embed)
  }else{
    msg.channel.send(`Sorry, your search for ${query} returned no results.`)
  }
}

CommandManager.addHandler('!search',search);

CommandManager.addHandler('!altcards', (args,msg)=>{
  msg.channel.send(`${cData.filter(_=>_.art_vers.length > 1).map(_=>_.name).join('\n')}`)
},true)
