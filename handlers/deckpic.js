const CardImgData = require('../cardImgData.js')
const PureImage = require('pureimage')
const Stream = require('stream')
const Discord = require('discord.js')
const fs = require('fs')
const {importCode, sortDeck} = require('../stolenUtils.js')

function deckPic(deck){//this function is bad and i don't really care at this point lmao it works
	return new Promise( (res, rej) =>{
		let cards = deck.deck;
		let lead = deck.lead;
		let canvas = PureImage.make(1998,1380)
		let ctx = canvas.getContext('2d')
		let doneCount = 0;
	//whoever made loadImage but not a synchronous version can take a piece of rebar through the fuckin skull
	cards.sort(sortDeck)
	let card
	for(let i = 0, x = 0;i < cards.length;i++){ //async in a loop yaaaaaaayyyyy i desire death
		card = cards[i]
		if(!card){
			break;
		}
	//	console.log(JSON.stringify(card))
		let data = CardImgData[card.card_id]
		let filePath = `./All Cards/${data.leader}/FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`
		if(data.art_ver > 2){
			filePath = `./All Cards/${data.leader}/alt_1/FC_${data.leader}_${data.id.toString().padStart(3,'0')}.png`
		}
		PureImage.decodePNGFromStream(fs.createReadStream(filePath)).then(img=>{
			var c = cards[i]
		//	console.log('x is'+x)
			ctx.drawImage(img, Math.floor((x-1) % 6) * 333, Math.floor((x-1)/6) * 460)
			if(c.in_deck == 2){
		//		console.log('2 of?')
				doneCount++;
				//x+=2;
				ctx.drawImage(img, Math.floor( (x-2) % 6) * 333, Math.floor((x-2)/6) * 460)
			}else{
				//x++;
			}
		//	console.log('finished drawing '+data.name)
			if(++doneCount == 18){
				/*let writableStream = new Stream.Writable();
				writableStream._write = (chunk, encoding, next) => {
  				console.log(chunk.toString())
  				next()
				}
				*/
				PureImage.encodePNGToStream(ctx.bitmap, fs.createWriteStream('out.png')).then(_=>{
						res(fs.createReadStream('out.png'));
				})

			}else{
			//	console.log(doneCount)
			}
		})
		// i hate all of this
		/**/if(card.in_deck == 2){
			x+=2;
		}else{
			x++;
		}/**/
	}
})
}

function picCmd(args, msg){
  let deckData = importCode(args[1]);
  let deck = deckData.deck;
  if(!deck){
    msg.reply("Sorry, I don't recognize that deck code.")
  }else{
    deckPic(deckData).then(img=>{
      let A = new Discord.MessageAttachment(img, deckData.lead+'.png')
      msg.channel.send(A)
    })
  }
}

module.exports = picCmd;
