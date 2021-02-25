const requireDir = require('require-dir')
const Discord = require('discord.js')
const client = new Discord.Client();
const config = require('./config.json')
//load command handlers
var Handlers = requireDir('./handlers', { noCache:true })
var CommandManager = require('./commandManager.js');
var LogChannel

client.login(config.token)

client.on('ready', _=>{
	console.log('discord link online')
	client.channels.fetch(config.log_channel).then(c=>LogChannel=c)
});

client.on('message', msg => {
	let args = msg.content.split(' ');
	if(args[0] == '!reloadshit'){
		if(msg.author.id == config.admin){
			Handlers = requireDir('./handlers', { noCache:true });
			msg.reply('done.')
		}
	}else{
		CommandManager.handleMessage(msg);
	}
})
