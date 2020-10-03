const fs = require('fs');
const Discord = require('discord.js')
const exitHook = require('exit-hook');
const bot = new Discord.Client()
const allHighscores = require('./highscores.js');
console.log(allHighscores);

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`);
})

bot.login(require('./token.js'))

exitHook(() => {
  bot.destroy();
});

const MODES = {
  mode_plus: 'Mode Addition',
  mode_moins: 'Mode Soustraction',
  mode_double: 'Mode Double'
};

//================================ fonctions VV

function pauseQuestion (message, partie) {
  partie.tireAuSortDeuxNombres();
  message.reply('pong ' + partie.question() + ' !'); 
}

function printMode(mode) {
  return MODES[mode];
}

function printHighscores(allHighscores) {
  var contenu = '';
  for (var mode in allHighscores) {
    contenu += '**' + printMode(mode) + '**\n';
    var highscoresTriees = trieHighscores(allHighscores[mode]);
    for (var index in highscoresTriees) {
      var highscore = highscoresTriees[index];
      var position = parseInt(index) + 1;
      contenu += '`' + position + ") " +  highscore[1]  + " : " + highscore[0] + '`' +"\n";
    }
  }
  return contenu;
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

//================================ classes VV
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
//===========

class Joueur {
  constructor() {
    this.mode = 'mode_plus';
  }

  demarrerPartie(message) {
    message.reply("Démarrage d'une nouvelle partie en **" + printMode(this.mode) + "** !");
    this.partie = new Partie(this.mode);
    pauseQuestion(message, this.partie);
    return this.partie;
  }
}
//================================

var joueurs = {};

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
  
  if(contenu.includes('ping')) {

    if (contenu.match(/^ping mode/)) {                                   // ping mode
      var plus = true;
      var moins = false;
      plus = contenu.includes('+');
      moins = contenu.includes('-');
      joueur.mode = (plus && moins ? 'mode_double':(moins ? 'mode_moins':'mode_plus'))
      message.reply(printMode(joueur.mode));
    }

    if (contenu === 'ping') {                                            // ping
      if (partie) {                                                      // ping déja une partie
        message.reply('Une partie en ' + printMode(partie.mode) + ' est déjà en cours, tu as ' + partie.score() + ` et la question est: ` + partie.question() + `
Pour commencer une nouvelle partie, tu dois d'abord perdre celle là!`)
      }
      else {
        partie = joueur.demarrerPartie(message);
      }
    }

    else if (partie) {
      if (contenu === 'ping ' + partie.reponse()) {                      // test bonne réponse
        var highscore = allHighscores[partie.mode][message.author.username] || 0;
        partie.marqueUnPoint();
        message.reply('Correct ! Tu as ' + partie.score() + (partie.points > highscore ? ' **Meilleur score!**':''));
        pauseQuestion(message, partie);
        if (partie.points > highscore) {                                 // maj highscore
          allHighscores[partie.mode][message.author.username] = partie.points;
          enregistreHighScore(allHighscores);
        }
      }
      else if (contenu.match(/^ping -?\d+$/)) {                          // test mauvaise réponse
        message.reply("pong : Faux ! Ton score final est de " + partie.score() + (partie.points > highscore ? ", c'est ton **meilleur score!**":''));
        joueur.partie = undefined;
      }
      else if (contenu === 'ping ?') {                                   // ping ?
        message.reply('pong ' + partie.question() + ' ! (' + printMode(partie.mode) + ')')
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
    message.channel.send(`Écris "ping" pour commencer une partie.
Je vais alors te poser une question. Réponds par 'ping <reponse>'
Si ta réponse est correcte tu gagne un point et je te pose une nouvelle question.
Si c'est faux, je te donne ton score et la partie se termine.
La difficulté augmente en fonction du nombre de points.
Une partie commence avec un mode, et elle garde ce mode jusqu'a la fin.
Écris "ping help" pour la liste des commandes`)
  }
  if (contenu === 'ping help') {                                         // ping help
    message.channel.send(`Liste des commandes:
**ping règles** donne les règles du jeu
**ping ?** repose la question en cours
**ping** commence une partie (si aucune partie n'est en cours)
**ping help** affiche cette liste
**ping highscores** affiche les meilleurs scores des joueurs
**ping mode <signe(s)>** choisir le mode de jeu parmi +, -, ou double (+ et -)`)
  }
  if (contenu === 'ping highscores') {
    message.channel.send(printHighscores(allHighscores));
  }
  if (contenu === 'test') {
    //let membreItsRedV2 = Array.from(message.guild.members.cache.values()).find(member => member.user.username == 'itsRed_v2');
    //console.log(membreItsRedV2);
  }
});

const CODES = [
  undefined,
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ' ',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z'
]

function toNumber(lettres) {
  for (index = 0; index < lettres.length; index++) {
    if (CODES.indexOf(lettres[index])==-1) {} else {
      lettres[index] = CODES.indexOf(lettres[index])
    }
  }
}

function toString(lettres) {
  var output = ''
  for (index = 0; index < lettres.length; index++) {
    if (!isNaN(lettres[index])) {
      lettres[index] = CODES[lettres[index]]
    }
    output = (output + lettres[index])
  }
  return output
}

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content
  var Codelength = CODES.length-1
  var match = contenu.match(/^ping (code|decode) (\d*) (.*)/)
  if(match) {
    var cle = parseInt(match[2])
    var msg = match[3]
    var action = match[1]
    var lettres = msg.split('')
    message.channel.send("clé: " + cle + "\naction: " + action + "\nCODES.length: " + CODES.length)
    toNumber(lettres)
    console.log(lettres)


    if (action === "code") {
      for (index = 0; index < lettres.length; index++) {
        if (lettres[index-1] === undefined) {
          lettres[index] = (lettres[index]*cle)%CODES.length
        } else {
          if (!isNaN(lettres[index])) {
            lettres[index] = (lettres[index]*lettres[index-1]+cle)%CODES.length
          }
        }
      }


    } else {
      for (index = lettres.length-1; index >= 0; index = index-1) {
        if (lettres[index-1] === undefined) {
          for (i = 1; i<100;i++) {
            //console.log((lettres[index]+CODES.length*i)/cle)
            if (Number.isInteger((lettres[index]+CODES.length*i)/cle)%CODES.length) {
              lettres[index] = ((lettres[index]+CODES.length*i)/cle)%CODES.length
              i = 100
              console.log("found")
            }
            //console.log(i)
            if (i == 99) {
              console.log("not found")
            }
          }
        } else {
          if (!isNaN(lettres[index])) {
            var indexScle = (((lettres[index]-cle)%CODES.length)+CODES.length)%CODES.length
            for (i = 1; i<100;i++) {
              if (Number.isInteger((indexScle+CODES.length*i)/lettres[index-1])) {
                lettres[index] = (indexScle+CODES.length*i)/lettres[index-1]
                lettres[index] = lettres[index]%CODES.length
                i = 100
                console.log("1found")
                console.log(lettres[index])
              }
              if (i == 99) {
                console.log("not found")
              }
            }
          }
        }
      }
    }
    console.log(lettres)
    var output = toString(lettres)
    message.channel.send("`"+output+"`")
  }
});