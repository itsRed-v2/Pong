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

//================================ fonctions VV

var { newJoueur } = require('./src/joueur')
var { code, decode, liste, printMode, pauseQuestion } = require('./src/pong')

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

var joueurs = {};

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase()
  var joueur = joueurs[message.author.username];
  if (joueur == undefined) {
    joueur = newJoueur();
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
        bot.channels.cache.get('763372739238559774').send(':white_check_mark:  **' + message.author.username + '** a commencé une partie en **' + printMode(partie.mode) + '**')
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
        message.reply("Faux ! Ton score final est de " + partie.score() + (partie.points > highscore ? ", c'est ton **meilleur score!**":''));
        bot.channels.cache.get('763372739238559774').send(':x:  **' + message.author.username + '** a perdu une partie à **' + partie.score() + '** (' + printMode(partie.mode) + ')')
        joueur.partie = undefined;
      }
      else if (contenu === 'ping ?') {                                   // ping ?
        message.reply('pong ' + partie.question() + ' ! (' + printMode(partie.mode) + ')')
      }
    }

    else if (contenu.match(/^ping \d+$/) || contenu === 'ping ?') {      // réponse ou  "ping ?" mais aucune partie en cours
      message.reply('Aucune partie en cours. Tape "ping" pour lancer une partie')
    }
    if (contenu === 'ping list') {
      message.channel.send(liste(joueurs))
    }
  }
});

bot.on('message', message => {
  var contenu = message.content.toLowerCase()
  if (contenu == 'ping règles' || contenu == 'ping regles') {            // ping règles
    message.channel.send(`Écris \`ping\` pour commencer une partie.
Je vais alors te poser une question. Réponds par \`ping <reponse>\`
Si ta réponse est correcte tu gagne un point et je te pose une nouvelle question.
Si c'est faux, je te donne ton score et la partie se termine.
La difficulté augmente en fonction du nombre de points.
Une partie commence avec un mode, et elle garde ce mode jusqu'a la fin.
Écris "ping help" pour la liste des commandes`)
  }
  if (contenu === 'ping help') {
    message.channel.send(`**Liste des commandes**
  **Jeu:**
\`ping règles\` donne les règles du jeu
\`ping ?\` repose la question en cours
\`ping\` commence une partie (si aucune partie n'est en cours)
\`ping help\` affiche cette liste
\`ping highscores\` affiche les meilleurs scores des joueurs
\`ping mode <signe(s)>\` choisir le mode de jeu parmi \`+\`, \`-\`, ou double (\`+-\`)
\`ping list\` liste toutes les parties en cours

  **Cryptage:**
\`\`\`
ping (code|decode) <clé (1er ligne)>
<message (a partir de la 2e ligne)>
\`\`\` permet de crypter/décripter un message à partir d'une clé de cryptage`)
  }
  if (contenu === 'ping highscores') {
    message.channel.send(printHighscores(allHighscores));
  }
  // if (contenu === 'test') {
  //   //let membreItsRedV2 = Array.from(message.guild.members.cache.values()).find(member => member.user.username == 'itsRed_v2');
  //   //console.log(membreItsRedV2);
  // }
});

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.split('\n')
  var match = contenu[0].match(/^ping (code|decode) (.+)/i)
  if (match && contenu[1]) {
    var cle = match[2]
    contenu.shift()
    var msg = contenu.join('\n')
    var action = match[1].toLowerCase()
    message.channel.send(`clé:\n\`${cle}\`\nmessage:`)

    if (action === "code") {
      var nombres = code(msg, cle)
      message.channel.send("```\n" + Buffer.from(nombres).toString('base64') + "\n```")
    } else {
      message.channel.send("```\n" + decode(Buffer.from(msg, 'base64'), cle) + "\n```")
    }
  } else if (contenu[0].match(/^ping (code|decode)/)) {
    message.channel.send(`Commande mal formée. Syntaxe:
\`\`\`
ping (code|decode) <clé (1er ligne)>
<message (a partir de la 2e ligne)>
\`\`\``)
  }
});