//various helper functions
const { importCode } = require('./stolenUtils.js')
const cardData = require('./cardImgData.js')

function compareDecks(codeA, codeB){
  var deckA = importCode(codeA)
    , deckB = importCode(codeB)
    , ranks = ['S','A','B','C']
    , rankArr1
    , rankArr2
    , matches = []
    , rankMatches = { 'S':[], 'A':[], 'B':[], 'C':[] }
    , matchIndex
  if(!deckA || !deckB)throw new Error('Invalid deck code.')
  deckA = deckA.deck
  deckB = deckB.deck

  //console.log(deckA[0])
  deckA.forEach(_=>_.in_deck > 1?deckA.push(_):false)
  deckB.forEach(_=>_.in_deck > 1?deckB.push(_):false)

  ranks.forEach(rank=>{
    rankArr1 = deckA.filter(_=>_.rating == rank)
    rankArr2 = deckB.filter(_=>_.rating == rank)
    //console.log(rankArr1)
    rankArr1.forEach(card => {
      matchIndex = rankArr2.findIndex(_=>_.name == card.name)
      if(matchIndex != -1){
        matches.push(cardData[card.card_id])
        rankMatches[rank].push(cardData[card.card_id])
        rankArr2.splice(matchIndex,1)
      }else{
        console.log(`Found difference: ${JSON.stringify(card)}`)
      }
    })
  })

  return {matches, rankMatches}
}

function argParse(input){ //for use for commands with more complicated arguments/
  let keys = input.match(/\w+\:/g)
    , argObject = {}
    , s = ''
    , t = []
    , i2
  keys.forEach((key,i)=>{
    i2 = input.indexOf(keys[i+1])
    s = input.slice(input.indexOf(key), (i2 >= 0)?i2:undefined)
    //ternary because keys[i+1] makes indexOf return -1 at end of seq and this is shorter than an if
    t = s.split(':')
    argObject[t[0]] = t[1].trim()
  })
  return argObject
}

module.exports = {compareDecks, argParse}
