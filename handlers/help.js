var CommandManager = require('../commandManager.js')

function help(args, msg){
  msg.author.send(
`Available Commands: ( <> denotes a required argument, ? denotes a optional flag or parameter)
!search <query>
  Returns a list of cards matching the search query.
!card <query> ?alt
  Returns information on the first card matching the provided query.
!altcards
  Returns a list of every card currently in-game with an alt-art version. (for collectors/completionists)
!deck <deck code>
  Returns a list of all cards in a deck, given a valid deck code.
!deckCompare <deck code A> <deck code B>
  Returns a detailed breakdown of the differences between two decks.
  Decks that are at least 60+% similar to each-other are usually different "versions" of the same archetype.
!image <deck code>
  Returns a collage of all card art in the given deck code.
  NOTE: this is *very* slow on current hardware, the bot can and will take upwards of 8 seconds to respond.`
  )
}

CommandManager.addHandler('!help', help);
