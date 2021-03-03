class CommandManager {
  constructor(){
    this.handlers = {}
    this.logChannel
  }
  handleMessage(msg){
    let args = msg.content.replace(/\s{2,}/g," ").split(' ')
      , cmd = args[0];
    if(this.handlers[cmd]){
      this.handlers[cmd](args,msg);
      let l = `user: ${msg.author.username} (id: ${msg.author.id}) cmd: ${msg.content}`
      global.log(l)
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
