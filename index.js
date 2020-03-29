const Discord = require('discord.js')
const exitHook = require('exit-hook');
const bot = new Discord.Client()

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`);
})

bot.login(require('./token.js'))

exitHook(() => {
  bot.destroy();
});

var N1;
var N2;
var points = 0;
var partie_en_cours = false;


function question (message) {
  N1 = Math.floor(Math.random() * 10);
  N2 = Math.floor(Math.random() * 10);
  message.reply('pong ' + N1 + '+' + N2 + ' !'); 
}

function affiche (points) {
  return points + ' point' + (points > 1 ? 's':'')
}

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase() 

  if(contenu.includes('ping')) {
    if (contenu === 'ping') {
      message.reply("Démarrage d'une nouvelle partie!");
      points=0;
      partie_en_cours = true;
      question(message);
    }
    else if (contenu === 'ping ' + (N1+N2)) {
      points++;
      message.reply('Correct ! Tu as ' + affiche(points));
      question(message);
    }
    else if (partie_en_cours && contenu.match(/^ping \d+$/)) {
      message.reply("pong : Faux ! Ton score final est de " + affiche(points));
      points=0;
      partie_en_cours = false;

    }
  }
});

bot.on('message', message => {
  if(message.content.toLocaleLowerCase() == 'ping règles') {
    message.reply(`écris "ping" pour commencer une partie.
    Je vais alors te poser une question. Réponds par 'ping <reponse>'
    Si ta réponse est correcte tu gagne un point et je te pose une nouvelle question.
    Si c'est faux, je te donne ton score et la partie se termine.`)
  }
});