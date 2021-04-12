const { compareDecks } = require('../utils.js')
const commandManager = require('../commandManager.js')

commandManager.addHandler('!deckCompare', (args, msg)=>{
  if(args.length != 3){
    msg.channel.send(`Usage: !deckCompare <deck code 1> <deck code 2>`)
  }
  var comparison = compareDecks(args[1], args[2])
  msg.channel.send(`Deck Comparison Results:
Overall similarity: ${((comparison.matches/18)*100).toFixed(2)}% (${comparison.matches}/18 cards match)
S slot: ${((comparison.rankMatches['S']/3)*100).toFixed(2)}% similar. (${comparison.rankMatches['S']}/3 cards match)
A slot: ${((comparison.rankMatches['A']/4)*100).toFixed(2)}% similar. (${comparison.rankMatches['A']}/4 cards match)
B slot: ${((comparison.rankMatches['B']/5)*100).toFixed(2)}% similar. (${comparison.rankMatches['B']}/5 cards match)
C slot: ${((comparison.rankMatches['C']/6)*100).toFixed(2)}% similar. (${comparison.rankMatches['C']}/6 cards match)`)
})
