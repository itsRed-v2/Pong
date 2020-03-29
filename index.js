const Discord = require('discord.js')
const bot = new Discord.Client()

var N1;
var N2;
var points = 0;

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`);
})

bot.login(require('./token.js'))

function question (message) {
  N1 = Math.floor(Math.random() * 10);
  N2 = Math.floor(Math.random() * 10);
  message.reply('pong ' + N1 + '+' + N2 + ' !');
  
}

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  if(message.content.toLowerCase().includes('ping')) {
    if (message.content.toLowerCase() === 'ping') {
      question(message);
    }
    else if (message.content.toLowerCase() === 'ping ' + (N1+N2)) {
      points++;
      message.reply('pong : Correct ! Tu as ' + points + ' points');
      question(message);
    }
    else {
      message.reply("pong : non c'est faut !");
      points=0;
    }
  }

});

/*message.reply('pong ' + N1 + '+' + N2 + ' !');
    if (message.content.toLowerCase().includes('ping ' + N1+N2)) {
      message.reply('test')
      */