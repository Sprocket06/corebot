const CommandManager = require('../commandManager.js')
const Discord = require('discord.js')
const Duel = require('duel')
const {importCode} = require('../stolenUtils.js')
const config = require('../config.json')
var forms = []
var registeringCache = {}

class RegistrationForm {
  constructor(name, description, bestOf, bans){
    this.name = name
    this.about = description
    this.matches = bestOf
    this.bans = bans
    this.potentials = {}
    this.players = []
  }
  get numDecks(){
    return Math.floor((this.matches-1)/2) + (this.bans + 1)
  }
  //bo3 - b3 b1
  //bo3 - b4 b2
  //bo5 - b4 b1
}

CommandManager.addHandler('!newTournament', (args,msg)=>{
  msg.reply('not implemented :)')
},true)

CommandManager.addHandler('!register', (args, msg)=>{
  //!register <tournamentName> <ingame-name>
  let t = forms.find(_=>_.name == args[1])
  if(!args.length==3){
    msg.reply(`Usage: !register <tournament name> <your ingame name>`)
    return
  }
  if(!t){
    msg.reply(`Could not find tournament ${args[1]}`)
    return
  }else{
    let id = msg.author.id
    if(t.potentials[id]){
      msg.reply(`you're already started registration. Use !reginfo to complete it.`)
    }else if(registeringCache[msg.author.id] && registeringCache[msg.author.id] != args[1]){
      msg.reply(`you've already started the registration process for ${registeringCache[msg.author.id]}. You cannot register for a second tournament until you complete registration for the first one.`)
    }else if(t.players.find(_=>_.id == msg.author.id)){
      msg.reply(`you've already completed the registration process for this tournament. If you'd like to edit your registration information, use !reginfo.`)
    }else{
      let o = {
        username: args[2],
        id: msg.author.id,
        decks: []
      }
      for(var i = 0; i < t.numDecks;i++){
        o.decks.push('placeholder')
      }
      t.potentials[id] =
      registeringCache[msg.author.id] = t.name
      msg.author.send(
        `Thank you for registering for ${t.name}
Match format: build ${t.numDecks} ban ${t.bans}
Submit your decks using the command !reginfo <deck #>:<deck code>
You can submit multiple decks in one command as long as there is a space between them.
Ex: !register 3:20e0e0k0u0x0z0K0L1u1EpY1Q1T2nix2L3e3D 1:3040e0k0u0K0L1V1X2627282b2c2k2kix2r2L`
      )
    }
  }
}, true)

CommandManager.addHandler('!reginfo', (args, msg)=>{
  //!reginfo <deck #>:<deck code> <same thing repeated as many times as you want>
  args.splice(0,1)
  if(!args.length){
    msg.reply('Usage !reginfo <deck #>:<deck code>')
    return
  }
  let l = []
  let tName = registeringCache[msg.author.id]
  if(!tName){
    msg.reply('you are not currently registering for any tournaments. Use !register to change that.')
  }else{
    args.forEach(a=>{
      if(!/[0-9]:[0-9a-zA-Z]{37}/.test(a,i)){
        l.push(`Argument ${i} invalid.`)
      }else{
        let code = /[0-9]:([0-9a-zA-Z]{37})/.exec(a)[1]
          , deckNum = /([0-9]):[0-9a-zA-Z]{37}/.exec(a)[1]
          , deck = importCode(code)
        if(!deck){
          l.push(`Invalid deck code from argument ${i}`)
        }else{
          let t = forms.find(_=>_.name == tName)
          let data = t.potentials[msg.author.id] || t.players.find(_=>_.id == msg.author.id)
          if(!data){
            throw new Error('internal WTF error 1')
          }
          if(deckNum > t.numDecks){
            l.push(`Error at argument ${i}, tournament only requires ${t.numDecks} decks.`)
          }else{
            data.decks[deckNum-1] = code
            l.push(`Set deck ${deckNum} to (${deck.leader}) ${code}`)
          }
        }
      }
    })
  }
  msg.channel.send(l.join('\n'))
},true)
