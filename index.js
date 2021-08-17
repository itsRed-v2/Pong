const fs = require('fs')
const { Client, Intents } = require('discord.js')
const exitHook = require('exit-hook')
const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['CHANNEL']
})

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.login(require('./token'))

exitHook(() => {
  bot.destroy()
})

//================================ constantes

const DATA_PATH = process.env.PONG_DATA_PATH;
const HIGHSCORE_PATH = DATA_PATH + '/highscores.js';
const PLAYERS_PATH = DATA_PATH + '/players.js';
const allHighscores = require(HIGHSCORE_PATH);

const AIDE_UTILISATEUR = `**Liste des commandes**
**Jeu:**
\`ping règles\` donne les règles du jeu
\`ping ?\` repose la question en cours
\`ping\` commence une partie
\`ping help\` affiche cette liste
\`ping highscores\` / \`ping hs\` affiche les meilleurs scores des joueurs
\`ping mode <mode>\` choisir le mode de jeu parmi \`plus\`, \`moins\`, ou \`double\`
\`ping list\` liste toutes les parties en cours
\`ping stop\` termine la partie en cours`

// **Cryptage:**
// \`\`\`
// ping (code|decode) <clé (1er ligne)>
// <message (a partir de la 2e ligne)>
// \`\`\`permet de crypter/décripter un message à partir d'une clé de cryptage`

const AIDE_ADMIN = `**Admin:**
\`ping reload\` redémarre l'application
\`ping tp <id> <score>\` set le score du joueur spécifié
\`ping seths <id> <highscore> <plus|moins|double>\` set le highscore du joueur spécifié dans le mode spécifié
\`ping addhs <id> <highscore> <plus|moins|double>\` ajoute le joueur à la liste dans le mode spécifié avec le score spécifié
\`ping rmhs <id> <plus|moins|double>\` supprime le joueur de la liste dans le mode spécifié
\`ping highscore info\` / \`ping hs info\` affiche les meilleurs scores et l'id des joueurs`

//================================ fonctions

const {
  newJoueur,
  findOrCreateJoueur
} = require('./src/joueur')
const {
  newPartie,
  demarrerPartie,
  reponse,
  score,
  question,
  pauseQuestion,
  printMode
} = require('./src/partie.js')
const {
  code,
  decode,
  listeJoueursActifs,
  afficheliste,
  matchTp,
  changeScore,
  matchHs,
  matchRmHs,
  matchPing,
  reload,
  stringifyForExport,
} = require('./src/pong')
const {
  changeHs,
  ajouteHs,
  removeHs,
  printHighscores
} = require('./src/highscore')

function saveHighScores(allHighscores) {
  fs.writeFile(HIGHSCORE_PATH, stringifyForExport(allHighscores), function (err) {
    if (err) return console.log(err)
  });
}

function saveJoueurs(joueurs) {
  fs.writeFile(PLAYERS_PATH, stringifyForExport(joueurs), function (err) {
    if (err) return console.log(err)
  });
}

function getUsername(id) {
  if (bot.users.cache.get(id)) {
    return bot.users.cache.get(id).username
  } else {
    return 'UNKNOWN'
  }
}

function getDiscriminator(id) {
  if (bot.users.cache.get(id)) {
    return bot.users.cache.get(id).discriminator
  } else {
    return '----'
  }
}

//================================

var joueurs = require(PLAYERS_PATH);

bot.on('messageCreate', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase()
  var arguments = matchPing(contenu)
  if (arguments === null) {
    return
  }
  
  if(findOrCreateJoueur(message.author.id, getUsername(message.author.id), getDiscriminator(message.author.id), joueurs, newJoueur)) {
    saveJoueurs(joueurs)
  }
  var joueur = joueurs[message.author.id]

  var partie = joueur.partie

  // ping mode
  if (arguments.match(/^mode/)) {
    var plus = true
    var moins = false
    plus = arguments.includes('+')
    moins = arguments.includes('-')
    joueur.mode = (plus && moins ? 'mode_double' : (moins ? 'mode_moins' : 'mode_plus'))
    message.reply(printMode(joueur.mode))
  }

  // ping
  if (contenu === 'ping') {
    if (partie) {
      message.reply('Une partie en ' + printMode(partie.mode) + ' est déjà en cours, tu as ' + score(partie) + ` et la question est: ` + question(partie) + `\nTu ne peux pas avoir plusieurs parties en même temps. Arrêter une partie en cours: \`ping stop\``)
    }
    else {
      partie = demarrerPartie(message, joueur, newPartie)
      bot.channels.cache.get('763372739238559774').send(':white_check_mark:  `' + message.author.username + '` a commencé une partie en **' + printMode(partie.mode) + '**')
    }
  }

  else if (partie) {
    // test bonne réponse
    if (arguments == reponse(partie)) {
      var highscore = allHighscores[partie.mode][message.author.id] || 0
      partie.points++
      saveJoueurs(joueurs)
      message.reply(`Correct ! Tu as ${score(partie)}${partie.points > highscore ? ' **Meilleur score!**' : ''}`)
      pauseQuestion(message, partie)
      // maj highscore
      if (partie.points > highscore) {
        allHighscores[partie.mode][message.author.id] = partie.points
        saveHighScores(allHighscores)
      }
    }

    // test mauvaise réponse
    else if (arguments.match(/^-?\d+$/)) {
      message.reply(`Faux ! La réponse était ${reponse(partie)}. Ton score final est de ${score(partie)}${partie.points > highscore ? ", c'est ton **meilleur score!**" : ''}`)
      bot.channels.cache.get('763372739238559774').send(':x:  `' + message.author.username + '` a perdu une partie à **' + score(partie) + '** (' + printMode(partie.mode) + ')')
      joueur.partie = undefined
      saveJoueurs(joueurs)
    }

    // ping ?
    else if (arguments === '?') {
      message.reply(`pong ${question(partie)} ! (${score(partie)}, ${printMode(partie.mode)})`)
    }

    // ping stop
    else if (arguments === 'stop') {
      joueur.partie = undefined
      saveJoueurs(joueurs)
      message.channel.send('Partie terminée')
      bot.channels.cache.get('763372739238559774').send(`:orange_circle:  \`${message.author.username}\` a arrêté une partie à **${score(partie)}** (${printMode(partie.mode)})`)
    }
  }
   
  // réponse, "ping ?" ou "ping stop" mais aucune partie en cours
  else if (arguments.match(/^-?\d+$/) || arguments === '?' || arguments === 'stop') {
    message.reply('Aucune partie en cours. Tape `ping` pour lancer une partie')
  }

  // ******************************
  // *** COMMANDES INFORMATIVES ***
  // ******************************

  // ping règles
  if (arguments == 'règles' || arguments == 'regles') {
    message.channel.send(`Écris \`ping\` pour commencer une partie.
Je vais alors te poser une question. Réponds par \`ping <reponse>\`
Si ta réponse est correcte tu gagne un point et je te pose une nouvelle question.
Si c'est faux, je te donne ton score et la partie se termine.
La difficulté augmente en fonction du nombre de points.
Une partie commence avec un mode, et elle garde ce mode jusqu'a la fin.
Écris "ping help" pour la liste des commandes`)
  }

  // ping help
  if (arguments === 'help') {
    if (message.author.id == 364820614990528522) {
      message.channel.send(AIDE_UTILISATEUR + '\n\n' + AIDE_ADMIN)
    } else {
      message.channel.send(AIDE_UTILISATEUR)
    }
  }

  // ping highscores
  if (arguments === 'highscores' || arguments === 'hs') {
    message.channel.send(printHighscores(allHighscores, joueurs, false, getUsername, getDiscriminator))
  } else if ((arguments === 'highscores info' || arguments === 'hs info')) {
    message.channel.send(printHighscores(allHighscores, joueurs, true, getUsername, getDiscriminator))
  }

  // ping list
  if (arguments === 'list') {
    message.channel.send(afficheliste(listeJoueursActifs(joueurs, false)))
  } else if (arguments === 'list info') {
    message.channel.send(afficheliste(listeJoueursActifs(joueurs, true)))
  }
});


// PING CODE/DECODE
bot.on('messageCreate', message => {

  if (message.author.bot) {
    return
  }
  var arguments = matchPing(message.content)
  if (arguments === null) {
    return
  }

  var lignes = arguments.split('\n')
  var match = lignes[0].match(/^(code|decode) (.+)/i)
  if (match && lignes[1]) {
    var cle = match[2]
    lignes.shift()
    var msg = lignes.join('\n')
    var action = match[1].toLowerCase()
    message.channel.send(`clé:\n\`${cle}\`\nmessage:`)

    if (action === "code") {
      var nombres = code(msg, cle)
      message.channel.send("```\n" + Buffer.from(nombres).toString('base64') + "\n```")
    } else {
      message.channel.send("```\n" + decode(Buffer.from(msg, 'base64'), cle) + "\n```")
    }
  } else if (lignes[0].match(/^(code|decode)/)) {
    message.channel.send(`Commande mal formée. Syntaxe:
\`\`\`
ping (code|decode) <clé (1er ligne)>
<message (a partir de la 2e ligne)>
\`\`\``)
  }
});



// COMMANDES ADMIN
bot.on('messageCreate', commandesAdmin);
function commandesAdmin (message) {
  
  if (message.author.bot) {
    return
  }
  if (message.author.id != 364820614990528522) {
    return
  }
  
  var contenu = message.content
  var arguments = matchPing(contenu)
  if (arguments === null) {
    return
  }

  //ping reload
  if (arguments === 'reload') {
    reload(message, bot.channels.cache.get('763372739238559774'), joueurs, fs, PLAYERS_PATH)
  }

  // ping tp
  if (matchTp(arguments)) {
    var msg = matchTp(arguments)
    var oldpts = changeScore(msg[1],parseInt(msg[2]),joueurs)
    if (oldpts || oldpts == 0) {
      var pseudo = bot.users.cache.get(msg[1]).username
      message.channel.send(`Score du joueur \`${pseudo}\` (\`${msg[1]}\`) modifié: ${oldpts} ==> **${msg[2]}**`)
      bot.channels.cache.get('763372739238559774').send(`:arrow_right: Score de \`${pseudo}\` (\`${msg[1]}\`) modifié: ${oldpts} ==> **${msg[2]}**`)
    } else {
      message.channel.send(`Le joueur d'id \`${msg[1]}\` n'existe pas ou n'a pas de partie en cours.`)
    }
  }
  
  // modération highscores
  if (matchHs(arguments)) {
    var msg = matchHs(arguments)
    if (bot.users.cache.get(msg[2])) {
      var pseudo = bot.users.cache.get(msg[2]).username
    }
    if (msg[1] == 'seths') {
      // ping seths
      if (changeHs(msg[2], msg[3], msg[4], allHighscores)) {
        message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${msg[2]}\`) en ${printMode('mode_'+msg[4])} est maintenant ${msg[3]}`)
      } else {
        message.channel.send(`L'id \`${msg[2]}\` ne correspond à aucun joueur dans le mode spécifié`)
      }
    } else {
      // ping addhs
      if (bot.users.cache.get(msg[2])) {
        if (ajouteHs(msg[2], msg[3], msg[4], allHighscores)) {
          message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${msg[2]}\`) en ${printMode('mode_'+msg[4])} a été ajouté et sa valeur est ${msg[3]}`)
        } else {
          message.channel.send(`Un joueur d'id \`${msg[2]}\` (\`${pseudo}\`) est déja présent dans la liste`)
        }
      } else {
        message.channel.send(`Personne n'a été trouvé avec l'id \`${msg[2]}\``)
      }
    }
    saveHighScores(allHighscores)
  }
  // ping rmhs
  if (matchRmHs(arguments)) {
    var msg = matchRmHs(arguments)
    
    var id = msg[1]
    var mode = 'mode_' + msg[2];
    var pseudo = getUsername(id)
    
    if (removeHs(id, mode, allHighscores)) {
      message.channel.send(`Le highscore du joueur \`${pseudo}\` (id: \`${id}\`) en ${printMode(mode)} a été supprimé`);
      saveHighScores(allHighscores);
    } else {
      message.channel.send(`Le joueur \`${pseudo}\` (id :\`${id}\`) n'est pas présent dans la liste du ${printMode(mode)}`);
    }
  }

  // log joueurs
  if (arguments === 'log') {
    message.channel.send({
      files: [
        {
          attachment: PLAYERS_PATH,
          name: 'players.js'
        },
        {
          attachment: HIGHSCORE_PATH,
          name: 'highscores.js' 
        }
      ]
    })
  }

  if (arguments === 'listall') {
    var msg = "";
    Object.keys(joueurs).forEach(id =>{
      msg += `**${joueurs[id].pseudo}**\n`;

      if (joueurs[id].partie) {
        msg += ' => partie en cours\n';
      }
      var played = false;
      for (var key in allHighscores){
        if (allHighscores[key][id]) played = true;
      }
      if (!played) msg += ' => :x: jamais joué!\n'
    })
    message.channel.send(msg);
  }

  var splitargs = arguments.split(" ");

  if (splitargs[0] === "rmPlayer") {
    if (splitargs[1]) {
      if (joueurs[splitargs[1]]) {
        message.channel.send(`Joueur \`${splitargs[1]}\` supprimé
\`\`\`json
${JSON.stringify(joueurs[splitargs[1]], null, "   ")}
\`\`\``);
        delete joueurs[splitargs[1]]
        saveJoueurs(joueurs);
      } else {
        message.channel.send(`Aucun joueur enregistré ne correspond à l'id \`${splitargs[1]}\``);
      }
    } else {
      message.channel.send('Vous devez spécifier un id!');
    }
  }
};