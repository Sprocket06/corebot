const config = require('./config.json')

class CommandManager {
  constructor(){
    this.handlers = {}
    this.logChannel
    this.experimentalCommands = []
  }
  handleMessage(msg){
    let args = msg.content.replace(/\s{2,}/g," ").split(' ')
      , cmd = args[0];
    if(this.handlers[cmd]){
      let l = `user: ${msg.author.username} (id: ${msg.author.id}) cmd: ${msg.content}`
      global.log(l)
      if(this.experimentalCommands.includes(cmd)){
        if(msg.guild && config.test_servers.includes(msg.guild.id)){
          this.handlers[cmd](args,msg);
        }
      }else{
        this.handlers[cmd](args,msg);
      }
    }
  }
  addHandler(name,fn,isTestFeature){
    this.handlers[name] = fn
    if(isTestFeature){
      this.experimentalCommands.push(name)
    }
  }
  removeHandler(name){
    delete this.handlers[name];
  }
}

module.exports = new CommandManager();
