class CommandManager {
  constructor(){
    this.handlers = {}
  }
  handleMessage(msg){
    let args = msg.content.split(' ')
      , cmd = args[0];
    if(this.handlers[cmd]){
      this.handlers[cmd](args,msg);
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
