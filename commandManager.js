class CommandManager {
  constructor(){
    this.handlers = {}
    this.logChannel
  }
  handleMessage(msg){
    let args = msg.content.split(' ')
      , cmd = args[0];
    if(this.handlers[cmd]){
      this.handlers[cmd](args,msg);
      let log = `user: ${msg.author} cmd: ${msg.content}`
      console.log(log)
      if(this.logChannel){
        logChannel.send(log)
      }
    }
  }
  addHandler(name,fn){
    this.handlers[name] = fn
  }
  removeHandler(name){
    delete this.handlers[name];
  }
}

module.exports = new CommandManager();
