//create server and listen on port 3000
//user enviroment variable to set port number
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cros = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');
const dotenv = require('dotenv');


app.use(cros());

//this is an server for an instagram post or reel downloader
//user will send the link of the post or reel and server will send the direct download link
//to the user
const { igdl,youtube } = require('btch-downloader')

const a = async () => {
    const url = 'https://www.instagram.com/reel/C_ffkXjAXsf/?igsh=MXV0N2ZtYjMxZ3VvdA=='
    const data = await igdl(url)
    console.log(data) // JSON
}
// const { youtube } = require('btch-downloader')

// const a = async () => {
//     const url = 'https://youtu.be/wsfb3qBOHc0?si=z6Johd_1F-yRHA4x'
//     const data = await youtube(url)
//     console.log(data) // JSON
// }
// a()
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('home');
});
const postUrl = 'https://www.instagram.com/reel/C_ffkXjAXsf/?igsh=MXV0N2ZtYjMxZ3VvdA==';
app.get('/a', (req, res) => {
    let ad;
    axios.get(postUrl).then((data1) => {

        // console.log(res.data);
            const data = data1.data;
            
           
            const $ = cheerio.load(data);
           
                
            const img = $('img');
            
            console.log(img.html());
            res.send($.html());
    });
    
});

//json data
app.use(express.json());

app.get('/ping', (req, res) => {
    res.send('ok').status(200);
});


app.post('/link', async (req, res) => {
    let url = req.body.url;
    // const url = 'https://www.instagram.com/reel/C_ffkXjAXsf/?igsh=MXV0N2ZtYjMxZ3VvdA=='
    try{
    console.log(url);
    const data = removeDuplicates(await igdl(url));
    console.log(data) // JSON
    
    res.send(data).status(200);
    }catch(err){
        console.log(err);
        res.send(err).
        status(400);
    }
});

function removeDuplicates(images) {
  let seen = new Set();
  return images.filter(image => {
    if(seen.has(image.thumbnail) || seen.has(image.url)){
      return false;
    }else{
      seen.add(image.thumbnail);
      seen.add(image.url);
      return true;
    }
  });
}



app.post('/youtube', async (req, res) => {
    let url = req.body.url;
    try{
    console.log(url);
    const data = await youtube(url);
    console.log(data); // JSON

    }catch(err){
        console.log(err);
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const e = require('express');
// replace the value below with the Telegram token you receive from @BotFather
// const token = dotenv.config().parsed.TELEGRAM_TOKEN;
const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {filepath: false});
bot.setMyCommands([
    {command: '/start', description: 'Start the bot'},
    {command: '/about', description: 'About the bot'},
]);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome');
  bot.sendMessage(chatId, 'Send me the link of the post or reel');

});


bot.on('message', async (msg) => {
    let msgt = msg.text;
    if(msgt == '/start'){
        
    }else if(msgt == '/about'){
        bot.sendMessage(msg.chat.id, 'This is a bot to download the instagram post or reel');
    }else{
        
    const chatId = msg.chat.id;
  
    if (isUrl(msg.text)) {
      bot.sendMessage(chatId, 'File In Progress..' );
      bot.sendSticker(chatId, 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif');
  
      let url = msg.text;
      
      try {
        // console.log(await igdl(url));
       
        const list = await igdl(url);
        if(list == 'Request Failed With Code 401'){
            bot.sendMessage(chatId, 'The User has a private account or send the wrong link.');
        }else{
            const data = removeDuplicates(list);

            console.log(data);

            if(data.length > 1){
                for(let i = 0; i < data.length; i++){
                    await bot.sendPhoto(chatId, data[i].url);
                }
            }else{
                let mediaUrl = data[0].url;
                if(verifyVideoOrImage(mediaUrl)){
                    await bot.sendVideo(chatId, mediaUrl+'.mp4');
                }
                else{
                    await bot.sendPhoto(chatId, mediaUrl);
                }
            }
            await bot.deleteMessage(chatId, msg.message_id+1);
        }
   
        
      } catch (error) {
        console.error('Error downloading or sending media', error);
        bot.sendMessage(chatId, 'Failed to download or send the media.');
      }
    } else {
      bot.sendMessage(chatId, 'Please send a valid link.');
    }

    }
});

function verifyVideoOrImage(mediaUrl) {
  if (mediaUrl.includes('https://d.rapidcdn.app')) {
    return true;
  }else if(mediaUrl.includes('https://scontent.cdninstagram.com')){
    return false;
  }else{
    return false;
  }
}



// Function to check if the message is a URL
function isUrl(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(message);
}




// //funtion to delete the send file
// function deleteFile(filePath) {
//   fs.unlinkSync(filePath);
// }