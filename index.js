const fs = require('fs');
const Discord = require('discord.js')
const exitHook = require('exit-hook');
const bot = new Discord.Client()
const highscores = require('./highscores.js');
console.log(highscores)

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`);
})

bot.login(require('./token.js'))

function contenuHighscores(highscores) {
  var contenu = '';
  var highscoresTriees = trieHighscores(highscores);
  for (var position in highscoresTriees) {
    var highscore = highscoresTriees[position];
    contenu += "'" + highscore[0] + "' : " + highscore[1] +",\n";
  }
  return contenu;
}

function enregistreHighScore(highscores) {
  var contenu = "module.exports = {\n";
  contenu += contenuHighscores(highscores);
  contenu += "};";

  fs.writeFile("./highscores.js", contenu, function (err) {
    if (err) return console.log(err);
    console.log('Les meilleurs scores ont été sauvegardés');
  });
}

function trieHighscores(highscores) {
  var sortable = [];
  for (var username in highscores) {
    sortable.push([username, highscores[username]]);
  }
  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });
  return sortable;
}

exitHook(() => {
  bot.destroy();
});

//==================
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
//=========================

var parties = {};

function pauseQuestion (message, partie) {
  partie.tireAuSortDeuxNombres();
  message.reply('pong ' + partie.question() + ' !'); 
}

var plus
var moins
var multiplie 

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase()
  var partie = parties[message.author.username];
  var highscore = highscores[message.author.username] || 0;
  
  if(contenu.includes('ping')) {
    if (contenu === 'ping') {                                            // ping
      if (partie) {                                                      // ping déja une partie
        message.reply('Une partie est déjà en cours, tu as ' + partie.score() + ` et la question est: ` + partie.question() + `
Pour commencer une nouvelle partie, tape "ping nouveau"`)
      }
      else {                                                             // ping nouvelle partie
      message.reply("Démarrage d'une nouvelle partie!");
      parties[message.author.username] = new Partie();
      pauseQuestion(message, parties[message.author.username]);
      }
    }
    else if (partie) {
        if (contenu === 'ping ' + partie.reponse()) {                    // test bonne réponse
          partie.marqueUnPoint();
          message.reply('Correct ! Tu as ' + partie.score() + (partie.points > highscore ? ' **Meilleur score!**':''));
          pauseQuestion(message, partie);
        }
        else if (contenu.match(/^ping \d+$/)) {                          // test mauvaise réponse
          message.reply("pong : Faux ! Ton score final est de " + partie.score() + (partie.points > highscore ? ", c'est ton **meilleur score!**":''));
          if (partie.points > highscore) {                              // maj highscore
            highscores[message.author.username] = partie.points;
            enregistreHighScore(highscores);
          }
          parties[message.author.username] = undefined;
        }

        else if (contenu === 'ping ?') {                                 // ping ?
          message.reply('pong ' + partie.question() + ' !')
        }

        else if (contenu === 'ping nouveau') {                           // ping nouveau
          message.reply("Démarrage d'une nouvelle partie!");
          parties[message.author.username] = new Partie();
          pauseQuestion(message, parties[message.author.username]);
        }
    }
    else if (contenu.match(/^ping \d+$/) || contenu === 'ping ?') {      // réponse ou  "ping ?" mais aucune partie en cours
        message.reply('Aucune partie en cours. Tape "ping" pour lancer une partie')
      }
  }
});

bot.on('message', message => {
  var contenu = message.content.toLowerCase()
  if (contenu == 'ping règles') {                                        // ping règles
    message.reply(`écris "ping" pour commencer une partie.
Je vais alors te poser une question. Réponds par 'ping <reponse>'
Si ta réponse est correcte tu gagne un point et je te pose une nouvelle question.
Si c'est faux, je te donne ton score et la partie se termine.
La difficulté augmente en fonction du nombre de points.
Écris "ping help" pour la liste des commandes`)
  }
  if (contenu === 'ping help') {                                         // ping help
    message.reply(`Liste des commandes:
**ping règles** donne les règles du jeu
**ping ?** repose la question en cours
**ping nouveau** recommence une nouvelle partie et abandonne l'ancienne
**ping** commence une partie (si aucune partie n'est en cours)
**ping help** affiche cette liste
**ping highscores** affiche les meilleurs scores des joueurs`)
  }
  if (contenu.match(/^ping option /)) {
    if (contenu.includes('+')) {
      plus = true
    }
    else {
      plus = false
    }
    if (contenu.includes('-')) {
      moins = true
    }
    else {
      moins = false
    }
    if (contenu.includes('x') || contenu.includes('*')) {
      multiplie = true
    }
    else {
      multiplie = false
    }
    message.reply(plus + ' ' + moins + ' ' + multiplie)
    message.reply(`Opérations: 
` + (plus = true ? 'plus, ':'') + ' ' + (moins = true ? 'moins, ':'') + ' ' + (multiplie = true ? 'multiplications, ':''))
  }
  if (contenu === 'ping highscores') {
    message.reply(contenuHighscores(highscores));
  }
  if (contenu === 'ping trie') {
    message.reply(trieHighscores(highscores));
  }
});