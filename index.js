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

class Partie {
  constructor() {
    this.N1;
    this.N2;
    this.points = 0;
  }
  
  tireAuSortDeuxNombres() {
    var possibilites = 10 + this.points
    this.N1 = Math.floor(Math.random() * possibilites) + this.points;
    this.N2 = Math.floor(Math.random() * possibilites) + this.points;  
  }

  question() {
    return this.N1 + '+' + this.N2;
  }

  reponse() {
    return this.N1 + this.N2;
  }

  score () {
    return this.points + ' point' + (this.points > 1 ? 's':'')
  }

  marqueUnPoint() {
    this.points++;
  }
}

var parties = {};

function pauseQuestion (message, partie) {
  partie.tireAuSortDeuxNombres();
  message.reply('pong ' + partie.question() + ' !'); 
}

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase() 

  if(contenu.includes('ping')) {
    if (contenu === 'ping') {
      message.reply("Démarrage d'une nouvelle partie!");
      parties[message.author.username] = new Partie();
      pauseQuestion(message, parties[message.author.username]);
    }
    else {
      var partie = parties[message.author.username];
      if (partie) {
        if (contenu === 'ping ' + partie.reponse()) {
          partie.marqueUnPoint();
          message.reply('Correct ! Tu as ' + partie.score());
          pauseQuestion(message, partie);
        }
        else if (contenu.match(/^ping \d+$/)) {
          message.reply("pong : Faux ! Ton score final est de " + partie.score());
          partie = undefined;
        }
      }
      else {
        message.reply('Aucune partie en cours. Tape "ping" pour lancer une partie')
      }
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