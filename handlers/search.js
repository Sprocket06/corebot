const fuse = require('../cardSearch.js')
const Discord = require('discord.js')

function search(args, msg){
  let query = args.slice(1).join(' ')
  let search = fuse.search(query)
  if(search){
    let embed = new Discord.MessageEmbed()
      .setTitle('Card Search')
      .setDescription(`**Found ${search.length} results for "${query}":**\n${search.map(_=>_.item.name).join('\n')}`)
    msg.channel.send(embed)
  }else{
    msg.channel.send(`Sorry, your search for ${query} returned no results.`)
  }
}

module.exports = search;
