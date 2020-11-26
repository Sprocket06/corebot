const requireDir = require('require-dir')
const Discord = require('discord.js')
const client = new Discord.Client();
const config = require('./config.json')
//load command handlers
var Handlers = requireDir('./handlers', { noCache:true })

client.login(config.token)

client.on('ready', _=>{
	console.log('discord link online')
});

client.on('message', msg => {
	if(msg.content.startsWith('!')){
		let args = msg.content.split(' ');
		if(Handlers[args[0].slice(1)]){
			console.log(`Handling ${args.join(' ')}`)
			Handlers[args[0].slice(1)](args, msg);
		}else if(args[0] == '!reloadshit'){
			if(msg.author.id == config.admin){
				Handlers = requireDir('./handlers', { noCache:true })
			}
		}
	}
})
