const fs = require('fs');
const Discord = require('discord.js')
const exitHook = require('exit-hook');
const bot = new Discord.Client()
const allHighscores = require('./highscores.js');
console.log(allHighscores);

const MODES = {
  mode_plus: 'Mode Addition',
  mode_moins: 'Mode Soustraction',
  mode_double: 'Mode Double'
};

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`);
})

bot.login(require('./token.js'))

function printMode(mode) {
  return MODES[mode];
}

function printHighscores(allHighscores) {
  var contenu = '\n';
  for (var mode in allHighscores) {
    contenu += '`**' + printMode(mode) + '**\n`';
    var highscoresTriees = trieHighscores(allHighscores[mode]);
    for (var index in highscoresTriees) {
      var highscore = highscoresTriees[index];
      var position = parseInt(index) + 1;
      contenu += position + ") " +  highscore[1]  + " : " + highscore[0] +"\n";
    }
  }
  return '`' + contenu + '`';
}

function contenuHighscores(highscores) {
  var contenu = '';
  var highscoresTriees = trieHighscores(highscores);
  for (var position in highscoresTriees) {
    var highscore = highscoresTriees[position];
    contenu += "'" + highscore[0] + "' : " + highscore[1] +",\n";
  }
  return contenu;
}

function enregistreHighScore(allHighscores) {
  var contenu = "module.exports = {\n";
  for (var mode in allHighscores) {
    contenu += mode + ': {\n'
    contenu += contenuHighscores(allHighscores[mode]);
    contenu += "},\n";
  }
  contenu += "};";

  fs.writeFile("./highscores.js", contenu, function (err) {
    if (err) return console.log(err);
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
  constructor(mode) {
    this.N1;
    this.N2;
    this.points = 0;
    this.mode = mode
  }
  
  tireAuSortDeuxNombres() {
    var possibilites = 10 + this.points
    this.N1 = Math.floor(Math.random() * possibilites) + this.points;
    this.N2 = Math.floor(Math.random() * possibilites) + this.points;
    var signeAuHasard = Math.floor(Math.random() * 2) == 1 ? '+':'-';
    this.operation = (this.mode == "mode_plus" ? '+':(this.mode == "mode_moins" ? '-':signeAuHasard));
  }

  question() {
    return this.N1 + this.operation + this.N2;
  }

  reponse() {
    if (this.operation == '+') return this.N1 + this.N2;
    else return this.N1 - this.N2;
  }

  score () {
    return this.points + ' point' + (this.points > 1 ? 's':'')
  }

  marqueUnPoint() {
    this.points++;
  }
}
//=========================

class Joueur {
  constructor() {
    this.mode = 'mode_plus';
  }

  demarrerPartie(message) {
    message.reply("Démarrage d'une nouvelle partie en **" + printMode(this.mode) + "** !");
    this.partie = new Partie(this.mode);
    pauseQuestion(message, this.partie);
  }
}

//=========================

var joueurs = {};

function pauseQuestion (message, partie) {
  partie.tireAuSortDeuxNombres();
  message.reply('pong ' + partie.question() + ' !'); 
}

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase()
  var joueur = joueurs[message.author.username];
  if (joueur == undefined) {
    joueur = new Joueur();
    joueurs[message.author.username] = joueur;
  }
  var partie = joueur.partie;
  var highscore = allHighscores[joueur.mode][message.author.username] || 0;
  
  if(contenu.includes('ping')) {

    if (contenu.match(/^ping mode/)) {
      var plus = true;
      var moins = false;
      plus = contenu.includes('+');
      moins = contenu.includes('-');
      joueur.mode = (plus && moins ? 'mode_double':(moins ? 'mode_moins':'mode_plus'))
      message.reply(printMode(joueur.mode));
    }

    if (contenu === 'ping') {                                            // ping
      if (partie) {                                                      // ping déja une partie
        message.reply('Une partie est déjà en cours, tu as ' + partie.score() + ` et la question est: ` + partie.question() + `
Pour commencer une nouvelle partie, tape "ping nouveau"`)
      }
      else {  
        joueur.demarrerPartie(message);
      }
    }
    else if (partie) {
      if (contenu === 'ping ' + partie.reponse()) {                    // test bonne réponse
        partie.marqueUnPoint();
        message.reply('Correct ! Tu as ' + partie.score() + (partie.points > highscore ? ' **Meilleur score!**':''));
        pauseQuestion(message, partie);
        if (partie.points > highscore) {                               // maj highscore
          allHighscores[joueur.mode][message.author.username] = partie.points;
          enregistreHighScore(allHighscores);
        }
      }
      else if (contenu.match(/^ping -?\d+$/)) {                          // test mauvaise réponse
        message.reply("pong : Faux ! Ton score final est de " + partie.score() + (partie.points > highscore ? ", c'est ton **meilleur score!**":''));
        joueur.partie = undefined;
      }

      else if (contenu === 'ping ?') {                                 // ping ?
        message.reply('pong ' + partie.question() + ' ! (' + printMode(partie.mode) + ')')
      }

      else if (contenu === 'ping nouveau') {                           // ping nouveau
        joueur.demarrerPartie(message);
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
Une partie commence avec un mode, et elle garde ce mode jusqu'a la fin de cette partie.
C'est évident, la calculette est interdite ^^
Écris "ping help" pour la liste des commandes`)
  }
  if (contenu === 'ping help') {                                         // ping help
    message.reply(`Liste des commandes:
**ping règles** donne les règles du jeu
**ping ?** repose la question en cours
**ping nouveau** recommence une nouvelle partie et abandonne l'ancienne
**ping** commence une partie (si aucune partie n'est en cours)
**ping help** affiche cette liste
**ping highscores** affiche les meilleurs scores des joueurs
**ping mode <signe(s)>** choisir le mode de jeu parmi +, -, ou double (+ et -)`)
  }
  if (contenu === 'ping highscores') {
    message.reply(printHighscores(allHighscores));
  }
});
