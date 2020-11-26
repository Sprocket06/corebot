function help(args, msg){
  msg.author.send(
`Available Commands:
!search <query>
  Returns a list of cards matching the search query.
!card <query>
  Returns information on the first card matching the provided query.
!deck <deck code>
  Returns a list of all cards in a deck, given a valid deck code.
!deckpic <deck code>
  Returns a collage of all card art in the given deck code.
  NOTE: this is *very* slow on current hardware, the bot can and will take upwards of 8 seconds to respond.`
  )
}
