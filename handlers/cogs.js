const CommandManager = require('../commandManager.js')
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
    rewards: {}
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
  global.log(log)
  saveData()
  return newBal
}

function redeem(){

}

function addReward(){

}

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
        msg.reply('Error: '+m)
      }else{
        msg.channel.send(`Success. ${_.username} now has ${m} cogs.`)
      }
    })
    .catch(e=>{
      msg.reply('Error')
      global.log(e)
    })
})
