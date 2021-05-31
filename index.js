const requireDir = require('require-dir')
const Discord = require('discord.js')
const client = new Discord.Client();
const config = require('./config.json')
//load command handlers
var Handlers = requireDir('./handlers', { noCache:true })
var CommandManager = require('./commandManager.js');
var {tokens, cards} = require('./cardSearch.js');
var LogChannel
var RedemptionChannel

function formatLeadText(leader){
	let leadtext = leader
	let leads = leader.match(/[A-Z]/g)
	if(leads.length > 1){
		let i = leader.indexOf(leads[1])
		leadtext = `${leadtext.substring(0,i)} / ${leadtext.substring(i)}`
	}
	return leadtext
}

global.self = client

global.log = function(msg){
	console.log(msg)
	if(LogChannel){
		if(!msg)return
		LogChannel.send(msg)
	}
}

global.sendRedemptionMsg = function(text){
	if(RedemptionChannel){
		return RedemptionChannel.send(text)
	}
}

//this is a bit scuffed but the current framework doesn't allow for this type of feature
//thus, we implement it at a slightly loewr level than normal
function parseCardMentions(input){
	var r = /\[\[([ \w]+)\]\]/g
	  , cName = r.exec(input)
		, cNames = []
	while(cName != null){
		cNames.push(cName[1].trim())
		cName = r.exec(input)
	}
	return cNames
}

client.login(config.token)

client.on('ready', _=>{
	console.log('discord link online')
	client.channels.fetch(config.log_channel).then(c=>{LogChannel=c;})
	client.channels.fetch(config.redemption_channel).then(c=>{RedemptionChannel=c;c.messages.fetch().then(m=>console.log('done fetching messages: '+c.id ));})
});

client.on('message', msg => {
	let args = msg.content.split(' ');
	if(args[0] == '!reloadshit'){
		if(msg.author.id == config.admin){
			Handlers = requireDir('./handlers', { noCache:true });
			msg.reply('done.')
		}
	}else if(!msg.content.startsWith('!')){
		var cMentions = parseCardMentions(msg.content)
		if(cMentions.length){
			cMentions.forEach(cName => {
				var card = cards.search(cName)[0]
				var token = tokens.search(cName)[0]
				if(card && token){
					if(token.score > card.score){
						card = token
					}
				}
				if(!card){
					msg.channel.send(`You mentioned the card ${cName}, but I could not find a matching database entry.`)
				}else{
					var data = card.item;
					let embed = new Discord.MessageEmbed()
			      .setTitle(`${data.name} (${data.rating})`)
			      .setDescription(`${formatLeadText(data.leader)} ${data.creature?`**${data.power}/${data.hp}**`:`**Spell**`}\n${data.cardtext?`*${data.cardtext}*`:''}${data.tokens?`${data.tokens.map(_=>`\n${_.name}: ${_.power}/${_.hp} ${_.cardtext?`*${_.cardtext}*`:''}`)}`:''}`)
					msg.channel.send(embed)
				}
			})
		}
	}else{
		try {
			CommandManager.handleMessage(msg);
		}catch(e){
			console.log(e);
			LogChannel.send(`<@${config.admin}>\n${e.stack}`);
			msg.channel.send('There was an error in processing your command.')
		}
	}
})
