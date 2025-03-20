const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cros = require('cors');
const dotenv = require('dotenv');
const ytdl = require('ytdl-core');
dotenv.config();
app.use(cros());

// const { igdl,youtube } = require('btch-downloader')


app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/MCPE', (req, res) => {
  res.render('MCPE');
});

//json data
app.use(express.json());

app.get('/ping', (req, res) => {
    res.send('ok').status(200);
});


app.post('/instagram', async (req, res) => {
    console.log(req.ip);
    let url = req.body.url;
    try{
    if(!isUrl(url)){
        res.send({error: 'Please send a valid link', status: 400}).status(400);
    }else{
        const urlRes = await igdl(url);
        if(urlRes == 'Request Failed With Code 401'){
            res.send({error: 'The User has a private account or send the wrong link.', status: 401}).status(400);
        }else{
        const data = removeDuplicates(urlRes);

          if(verifyVideoOrImage(data[0].url)){
            res.send(data).status(200);
          }else{
            res.send(data).status(200);
        }

        }
    }
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
      // const data = await youtube(url);
      const ID = ytdl.getVideoID(url);
      const data = await ytdl.getInfo(ID);
      res.json(data).status(200);

    }catch(err){
        console.log(err);
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



const TelegramBot = require('node-telegram-bot-api');
const e = require('express');

const token = process.env.TELEGRAM_TOKEN;
// const token = '7505850569:AAFleDscypJCq12usa5Dsn_iuVCrZ8FeDEA';

const bot = new TelegramBot(token, {filepath: false,polling: true});
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
     
      let url = msg.text;
      
      try {       
        const list = await igdl(url);
        if(list == 'Request Failed With Code 401'){
            bot.sendMessage(chatId, 'The User has a private account or send the wrong link.');
        }else{
            const data = removeDuplicates(list);

            console.log(data);
            
            if(data.length > 1){
                for(let i = 0; i < data.length; i++){
                  if(verifyVideoOrImage(data[i].url)){

                    await bot.sendVideo(chatId, data[i].url+'.mp4');
                }
                else{
                    await bot.sendVideo(chatId, data[i].url);
                }
                }
            }else{
              let mediaUrl = data[0].url;
                const options = {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: 'Direct Download',
                          url: mediaUrl  // Replace with your desired URL
                        }
                      ]
                    ]
                  }
                };
                
                if(verifyVideoOrImage(mediaUrl)){

                    await bot.sendVideo(chatId, mediaUrl+'.mp4', options);
                }
                else{
                    await bot.sendVideo(chatId, mediaUrl, options);
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
  console.log(mediaUrl);
  if (mediaUrl.includes('https://d.rapidcdn.app/d?token=')) {
    return true;
  }else if(mediaUrl.includes('https://scontent.cdninstagram.com/v/')){
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

