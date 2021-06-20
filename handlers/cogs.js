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
    rewards: [],
    redemptions: []
  }
}

//define a few helper functions to make working with our data nicer
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

//schedule a running function that can go through and check for order fulfullment reactions in the specified messages in CogDB.redemptions
// 5 minutes, 60 secondss per minute, 1000 milis per second
setInterval(()=>{
  console.log('running')
  global.self.channels.fetch(config.redemption_channel).then(c=>{
    console.log(CogDB.redemptions)
    CogDB.redemptions.forEach( (r, rIndex) => {
      console.log(r)
      c.messages.fetch(r.msg).then(m => {
        console.log(m.content)
        console.log(m.id)
        if(m.reactions){
          m.reactions.cache.forEach(reaction =>{
             if(reaction.emoji.name == '✅'){
               global.log(`Marking redemption ${r.msg} as fulfilled.`)
               CogDB.redemptions.splice(rIndex, 1)
               global.self.users.fetch(r.user).then(user => user.send(`Your redemption of ${r.reward.name} ${r.details?r.details+' ':''}has been fulfilled.`))
               saveData();
             }
          })
        }
      })
    })
  })
} , (1 * 60 * 1000))

CommandManager.addHandler('!shop',(args,msg)=>{
  var indexPad = CogDB.rewards.length.toString().length
    , namePad = CogDB.rewards.sort((a,b)=> a.name.length < b.name.length ? 1 : -1)[0].name.length
  CogDB.rewards.sort((a,b)=> a.cost < b.cost ? 1 : -1)
  msg.channel.send(`\`\`\`Cog Shop\`\`\`
${CogDB.rewards.map((r,i)=>`[${leftPad(i.toString(),indexPad,"0")}] :gear: ${r.cost} **${r.name + (" ".repeat(namePad - r.name.length))}** `).join('\n')}

Use \`!redeem <reward number> <details>\` to redeem!
*(\`<details>\` will be required if you are redeeming say, a specific foil card to specify which card you want)*`)
})

//!exchange <reward index|reward name>

//addReward name:Random Foil cost:500
CommandManager.addHandler('!addReward', (args,msg)=>{
  if(!config.helpers.includes(msg.author.id))return;
  if(args.length <= 1){
    msg.channel.send('Usage: !addReward name:<name> cost:<cost>')
    return
  }
  args = argParse(msg.content)
  if(!args.name || !args.cost){
    msg.channel.send('Usage: !addReward name:<name> cost:<cost>')
    return
  }
  if(CogDB.rewards.find(_=>_.name == args.name)){
    msg.channel.send('There is aleady a reward with that name, did you mean to !editCost or !editName?')
    return
  }
  CogDB.rewards.push({name:args.name, cost:args.cost})
  saveData()
})

//redeem. this one be the big fucker
//!redeem
CommandManager.addHandler('!redeem', (args,msg)=>{
  if(!args[1]){
    msg.channel.send(`You must provide the number of the reward you are redeeming!`)
    return
  }
  var rewardNum = parseInt(args[1])
  if(Number.isNaN(rewardNum)){
    msg.channel.send(`Invalid reward number "${args[1]}".`)
    return
  }
  //console.log(`${CogDB.rewards}`)
  var reward = CogDB.rewards[rewardNum]
  if(!reward){
    msg.channel.send(`There is no reward with that number. You can view the list of rewards with !shop.`)
    return
  }
  var acct = CogDB.accounts.find(_=>_.id == msg.author.id)
  if(!acct){
    global.log(`No account found for ${msg.author.username} (${msg.author.id})
Creating one...`)
    acct = {
      username:msg.author.username,
      id:msg.author.id,
      balance:0
    }
    CogDB.accounts.push(acct)
    saveData()
  }
  if(acct.balance < reward.cost){
    msg.channel.send(`You do not have enough :gear: cogs to redeem that reward. :(`)
    return
  }
  var details = args.slice(2).join(' ')
  CogDB.records.push({event:'reward_redeemption', initiator: msg.author.id, reward: reward})
  modifyBalance({name:"cogs_internal",id:"cogs_internal"}, msg.author, -reward.cost)
  global.sendRedemptionMsg(`User ${msg.author.username} (${msg.author.id}) redeemed ${reward.name} ${details}`).then(m=>{
    CogDB.redemptions.push({msg:m.id,user:msg.author.id,details:details,reward:reward})
    saveData();
  })
  saveData();
  msg.channel.send(`Your reward has been redeemed. You can expect up to 24hrs of delay for processing. You will receive a message within 5 minutes of your order being fulfilled.`)
})


//editing rewards
CommandManager.addHandler('!editCost', (args,msg)=>{
  if(!config.helpers.includes(msg.author.id))return;
  args = argParse(msg.content)
  if( (!args.name && !args.index) || !args.cost){
    msg.channel.send('Usage: !editCost index:<reward index> OR name:<reward name> cost:<new cost>')
    return
  }
  let rIndex;
  if(args.index){
    rIndex = CogDB.rewards[args.index] ? args.index : -1
  }else if(args.name){
    rIndex = CogDB.rewards.findIndex(_=>_.name == args.name)
  }else{
    msg.channel.send('UNEXPECTED ERROR 5, PING SPROCKET')
    return
  }

  if(rIndex == -1){
    msg.channel.send(`Could not find the specified reward in the database. Check your input against the output of !shop and try again.`)
    return
  }

  CogDB.rewards[rIndex].cost = args.cost;
  saveData();
  msg.channel.send(`Price has been updated to :gear: **${args.cost}** cogs.`)
})

CommandManager.addHandler('!deleteReward', (args,msg)=>{
  if(!config.helpers.includes(msg.author.id))return;
  args = argParse(msg.content)
  if(!args.name && !args.index){
    msg.channel.send('Usage: !deleteReward index:<reward index> OR name:<reward name>')
    return
  }
  let rIndex;
  if(args.index){
    rIndex = CogDB.rewards[args.index] ? args.index : -1
  }else if(args.name){
    rIndex = CogDB.rewards.findIndex(_=>_.name == args.name)
  }else{
    msg.channel.send('UNEXPECTED ERROR 5, PING SPROCKET')
    return
  }

  if(rIndex == -1){
    msg.channel.send(`Could not find the specified reward in the database. Check your input against the output of !shop and try again.`)
    return
  }

  CogDB.rewards.splice(rIndex, 1)
  saveData();
  msg.channel.send(`Reward has been deleted.`)
})


CommandManager.addHandler('!editName', (args,msg)=>{
  if(!config.helpers.includes(msg.author.id))return;
  args = argParse(msg.content)
  if( (!args.name && !args.index) || !args.newName){
    msg.channel.send('Usage: !editName index:<reward index> OR name:<reward name> newName:<new cost>')
    return
  }
  let rIndex;
  if(args.index){
    rIndex = CogDB.rewards[args.index]
  }else if(args.name){
    rIndex = CogDB.rewards.findIndex(_=>_.name == args.name)
  }else{
    msg.channel.send('UNEXPECTED ERROR 5, PING SPROCKET')
    return
  }

  if(rIndex == -1){
    msg.channel.send(`Could not find the specified reward in the database. Check your input against the output of !shop and try again.`)
    return
  }

  CogDB.rewards[rIndex].name = args.newName;
  saveData();
  msg.channel.send(`Name has been updated to: "${args.newName}".`)
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
`You have :gear: **${acct.balance}** cogs`
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
