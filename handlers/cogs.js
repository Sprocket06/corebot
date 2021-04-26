const CommandManager = require('../commandManager.js')
const { argParse } = require('../utils.js')
const config = require('../config.json')
const fs = require('fs')
var CogDB

// load saved data from JSON (yes this could be improved by using an actual database setup, but that takes significantly more time)
try {
  CogDB = require('../data/cogs.json')
} catch(e) {
  CogDB = {
    records: [],
    accounts: [],
    rewards: []
  }
}

//define a few helper functions to make working with our data nicer

//
function saveData(){
  global.log('Writing DB...')
  //IMPORTANT NOTE: this is a hard-coded file path, and if the organization scheme changes this will break
  fs.writeFileSync('./data/cogs.json', JSON.stringify(CogDB))
  global.log('DB write successful')
}

function modifyBalance(caller, target, amount){
  caller = { name:caller.username, id:caller.id }
  target = { name:target.username, id:target.id }

  //authentication
  if(!config.helpers.includes(caller.id)){
    return "Not authorized."
  }

  var acct = CogDB.accounts.find(_=> _.id == target.id)
  if(!acct){
    global.log(`No account found for ${target.username} (${target.id})
Creating one`)
    acct = {
      username:target.username,
      id:target.id,
      balance:0
    }
    CogDB.accounts.push(acct)
  }
  var newBal = acct.balance + amount
  if(newBal < 0){ // disallow people going into debt
    return "Operation would result in negative balance."
  }
  acct.balance = newBal
  var log = {
    event: 'acct_balance_change',
    account: target,
    initiator: caller,
    change: amount
  }
  CogDB.records.push(log)
  //global.log(log)
  saveData()
  return newBal
}

function leftPad(str, amount, char){
  char = char || " "
  return (char.repeat(amount) + str).slice(-amount)
}

CommandManager.addHandler('!cogShop',(args,msg)=>{
  var indexPad = CogDB.rewards.length.toString().length
    , namePad = CogDB.rewards.sort((a,b)=> a.name.length < b.name.length ? 1 : -1)[0].name.length
  msg.channel.send(`Cog Exchange:
${CogDB.rewards.map((r,i)=>`${leftPad(i.toString(),indexPad)} | ${r.name + (" ".repeat(namePad - r.name.length))} | ${r.cost}`)}
Use !exchange <reward index|reward name> <details>
(<details> will be required if you are redeeming say, a specific foil card to specify which card you want)`)
})

//!exchange <reward index|reward name> 

//addReward name:Random Foil cost:500
CommandManager.addHandler('!addReward', (args,msg)=>{
  if(!config.helpers.includes(msg.author.id))return;
  args = argParse(msg.content)
  if(!args.name || !args.cost){
    msg.channel.send('Usage: !addReward name:<name> cost:<cost>')
    return
  }
  if(CogDB.rewards.find(_=>_.name == args.name)){
    msg.channel.send('There is aleady a reward with that name, did you mean to !editReward?')
    return
  }
  CogDB.rewards.push({name:args.name, cost:args.cost})
  saveData()
})

// register commands
CommandManager.addHandler('!balance', (args,msg)=>{
  var acct = CogDB.accounts.find(_=>_.id == msg.author.id)
  if(!acct){
    global.log(`No account found for ${msg.author.username} (${msg.author.id})
Creating one`)
    acct = {
      username:msg.author.username,
      id:msg.author.id,
      balance:0
    }
    CogDB.accounts.push(acct)
  }
  saveData()
  msg.channel.send(
`You have ${acct.balance} cogs`
  )
})

CommandManager.addHandler('!changeBal', (args, msg)=>{
  if(!config.helpers.includes(msg.author.id)){
    return
  }
  if(args.length != 3){
    msg.reply('Usage: !changeBal <user id> <amount>')
    return
  }
  msg.client.users.fetch(args[1])
    .then(_=>{
      var m = modifyBalance(msg.author, _, parseInt(args[2]))
      if(typeof m == 'string'){
        msg.channel.send('Error: '+m)
      }else{
        msg.channel.send(`Success. ${_.username} now has ${m} cogs.`)
      }
    })
    .catch(e=>{
      msg.reply('Error')
      global.log(e)
    })
})
