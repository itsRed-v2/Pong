import fs from 'fs';
import { Client, Intents } from 'discord.js';
import exitHook from 'exit-hook';
const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['CHANNEL']
})

var logChannel;
bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`)
  logChannel = bot.channels.cache.get('763372739238559774');
})

import('./token.mjs').then(token => {
  bot.login(token.default);
});

exitHook(() => {
  bot.destroy()
})

//================================ constantes

const DATA_PATH = process.env.PONG_DATA_PATH;
const HIGHSCORE_PATH = DATA_PATH + '/highscores.mjs';
const PLAYERS_PATH = DATA_PATH + '/players.mjs';

const AIDE_UTILISATEUR = `**Liste des commandes**
\`ping règles\` donne les règles du jeu
\`ping ?\` repose la question en cours
\`ping\` commence une partie
\`ping help\` affiche cette liste
\`ping highscores\` / \`ping hs\` affiche les meilleurs scores des joueurs
\`ping mode <mode>\` choisir le mode de jeu parmi \`plus\`, \`moins\`, ou \`double\`
\`ping list\` liste toutes les parties en cours
\`ping stop\` termine la partie en cours
Tu peux écrire \`p\` à la place de \`ping\` au début des commandes pour faire plus rapide!`

// **Cryptage:**
// \`\`\`
// ping (code|decode) <clé (1er ligne)>
// <message (a partir de la 2e ligne)>
// \`\`\`permet de crypter/décripter un message à partir d'une clé de cryptage`

const AIDE_ADMIN = `**Commandes Admin**
\`ping reload\` redémarre l'application
\`ping tp <id> <score>\` set le score du joueur spécifié
\`ping seths <id> <highscore> <plus|moins|double>\` set le highscore du joueur spécifié dans le mode spécifié
\`ping addhs <id> <highscore> <plus|moins|double>\` ajoute le joueur à la liste dans le mode spécifié avec le score spécifié
\`ping rmhs <id> <plus|moins|double>\` supprime le joueur de la liste dans le mode spécifié
\`ping rmplayer <id>\` supprime le joueur (**toutes** ses données seront supprimées)
\`ping highscore info\` / \`ping hs info\` affiche les meilleurs scores et l'id des joueurs
\`ping log\` upload les fichiers de données de pong
\`ping listall\` donne la liste des joueurs enregistrés`

//================================ fonctions

import Joueur from './src/joueur.mjs';
import Partie from './src/partie.mjs';
import {
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
  sendAsLog,
  listeJoueurs,
  isInteger,
  createJoueurIfNeeded,
  printMode
} from './src/pong.mjs';
import {
  changeHs,
  ajouteHs,
  removeHs,
  printHighscores
} from './src/highscore.mjs';

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

function isPlayerCached(id) {
  if (bot.users.cache.get(id)) return true;
  else return false;
}

//================================

const joueurs = {};
import(PLAYERS_PATH).then((importedObject) => {
  let joueursJs = importedObject.data;
  Object.keys(joueursJs).forEach(id => {
    joueurs[id] = Joueur.fromJsObject(joueursJs[id]);
  });
});
let allHighscores;
import(HIGHSCORE_PATH).then((importedObject) => {
  allHighscores = importedObject.data;
});

bot.on('messageCreate', message => {

  if (message.author.bot) return

  var contenu = message.content.toLowerCase()
  var args = matchPing(contenu)
  if (args === null) return

  var id = message.author.id;
  var joueur = joueurs[id]
  if (joueur) {
    joueur.update(getUsername(id), getDiscriminator(id));
    var partie = joueur.partie
  }

  // ping mode
  if (args[0] === 'mode') {
    if(createJoueurIfNeeded(id, getUsername(id), getDiscriminator(id), joueurs)) {
      saveJoueurs(joueurs);
      joueur = joueurs[id];
    }
    var plus = true
    var moins = false
    plus = args[1].includes('+')
    moins = args[1].includes('-')
    joueur.mode = (plus && moins ? 'mode_double' : (moins ? 'mode_moins' : 'mode_plus'))
    message.reply(printMode(joueur.mode))
  }

  // ping
  if (contenu === 'ping') {
    if (partie) {
      message.reply(`Une partie en ${printMode(partie.mode)} est déjà en cours, tu as ${partie.printScore()} et la question est ${partie.question()}
Tu ne peux pas avoir plusieurs parties en même temps. Pour arrêter une partie en cours, utilise \`ping stop\``)
    }
    else {
      if(createJoueurIfNeeded(id, getUsername(id), getDiscriminator(id), joueurs)) {
        joueur = joueurs[id];
      }
      partie = joueur.demarrerPartie(message);
      saveJoueurs(joueurs);
      sendAsLog(logChannel, ':white_check_mark:  `' + message.author.username + '` a commencé une partie en **' + printMode(partie.mode) + '**')
    }
  }

  else if (partie) {
    // test bonne réponse
    if (args[0] == partie.reponse()) {
      var highscore = allHighscores[partie.mode][id] || 0
      partie.points++
      message.reply(`Correct ! Tu as ${partie.printScore()}.${partie.points > highscore ? ' **C\'est ton Meilleur score!**' : ''}\n${partie.poseQuestion()}`)
      saveJoueurs(joueurs)
      // maj highscore
      if (partie.points > highscore) {
        allHighscores[partie.mode][id] = partie.points
        saveHighScores(allHighscores)
      }
    }

    // test mauvaise réponse
    else if (isInteger(args[0])) {
      message.reply(`Faux ! La réponse était ${partie.reponse()}. Ton score final est de ${partie.printScore()}${partie.points > highscore ? ", c'est ton **meilleur score!**" : ''}`)
      sendAsLog(logChannel, ':x:  `' + message.author.username + '` a perdu une partie à **' + partie.printScore() + '** (' + printMode(partie.mode) + ')')
      joueur.partie = undefined
      saveJoueurs(joueurs)
    }

    // ping ?
    else if (args[0] === '?') {
      message.reply(`pong ${partie.question()} ! (${partie.printScore()}, ${printMode(partie.mode)})`)
    }

    // ping stop
    else if (args[0] === 'stop') {
      joueur.partie = undefined
      saveJoueurs(joueurs)
      message.reply('Partie terminée');
      sendAsLog(logChannel, `:orange_circle:  \`${message.author.username}\` a arrêté une partie à **${partie.printScore()}** (${printMode(partie.mode)})`)
    }
  }
   
  // réponse, "ping ?" ou "ping stop" mais aucune partie en cours
  else if (isInteger(args[0]) || args[0] === '?' || args[0] === 'stop') {
    message.reply('Aucune partie en cours. Tape `ping` pour lancer une partie')
  }

  // ******************************
  // *** COMMANDES INFORMATIVES ***
  // ******************************

  // ping règles
  if (args[0] == 'règles' || args[0] == 'regles') {
    message.channel.send(`Écris \`ping\` pour commencer une partie.
Je vais alors te poser une opération. Réponds par \`ping <réponse>\`
Si ta réponse est correcte, tu gagne un point et je te pose une nouvelle opération.
Si elle est fausse, tu perds et la partie se termine.
- Plus tu as de points, plus les opérations sont difficiles.
- Pas de stress! Tu as tout le temps que tu veux pour répondre.
- Envie de faire une pause? Aucun problème! Tu peux laisser ta partie en plan, et la reprendre plus tard.
- Écris \`ping help\` pour la liste des commandes. Certaines pourraient t'êtres utiles!`)
  }

  // ping help
  if (args[0] === 'help') {
    if (id == 364820614990528522 && args[1] === 'admin') message.channel.send(AIDE_ADMIN);
    else message.channel.send(AIDE_UTILISATEUR);
  }

  // ping highscores
  if (args[0] === 'highscores' || args[0] === 'hs') {
    message.channel.send(printHighscores(allHighscores, joueurs, args[1] === 'info', getUsername, getDiscriminator));
  }

  // ping list
  if (args[0] === 'list') {
    message.channel.send(afficheliste(listeJoueursActifs(joueurs, args[1] === 'info')));
  }
});

/*
// PING CODE/DECODE
bot.on('messageCreate', message => {

  if (message.author.bot) return
  
  var arguments = matchPing(message.content)
  if (arguments === null) return

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
*/

// ***********************
// *** COMMANDES ADMIN ***
// ***********************

bot.on('messageCreate', message => {
  
  if (message.author.bot) return;
  if (message.author.id != 364820614990528522) return;
  
  var contenu = message.content
  var args = matchPing(contenu);
  if (args === null) return;

  //ping reload
  if (args[0] === 'reload') {
    reload(message, logChannel, joueurs, fs, PLAYERS_PATH)
  }

  // ping tp
  if (matchTp(args)) {
    var newScore = args[2];
    var id = args[1]
    var oldScore = changeScore(id, newScore, joueurs)
    if (oldScore || oldScore === 0) {
      var pseudo = getUsername(id);
      saveJoueurs(joueurs);
      message.channel.send(`Score du joueur \`${pseudo}\` (\`${id}\`) modifié: ${oldScore} ==> **${newScore}**`)
      sendAsLog(logChannel, `:arrow_right: Score de \`${pseudo}\` (\`${id}\`) modifié: ${oldScore} ==> **${newScore}**`)
    } else {
      message.channel.send(`Le joueur d'id \`${id}\` n'existe pas ou n'a pas de partie en cours.`)
    }
  }
  
  // modération highscores
  if (matchHs(args)) {
    if (isPlayerCached(args[1])) {
      var pseudo = getUsername(args[1]);
    }
    if (args[0] == 'seths') {
      // ping seths
      if (changeHs(args[1], args[2], args[3], allHighscores)) {
        message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${args[1]}\`) en ${printMode('mode_'+args[3])} est maintenant ${args[2]}`)
      } else {
        message.channel.send(`L'id \`${args[1]}\` ne correspond à aucun joueur dans le mode spécifié`)
      }
    } else {
      // ping addhs
      if (isPlayerCached(args[1])) {
        if (ajouteHs(args[1], args[2], args[3], allHighscores)) {
          message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${args[1]}\`) en ${printMode('mode_'+args[3])} a été ajouté et sa valeur est ${args[2]}`)
        } else {
          message.channel.send(`Un joueur d'id \`${args[1]}\` (\`${pseudo}\`) est déja présent dans la liste`)
        }
      } else {
        message.channel.send(`Personne n'a été trouvé avec l'id \`${args[1]}\``)
      }
    }
    saveHighScores(allHighscores)
  }
  // ping rmhs
  if (matchRmHs(args)) {
    var id = args[1];
    var mode = 'mode_' + args[2];
    var pseudo = getUsername(id);
    
    if (removeHs(id, mode, allHighscores)) {
      message.channel.send(`Le highscore du joueur \`${pseudo}\` (id: \`${id}\`) en ${printMode(mode)} a été supprimé`);
      saveHighScores(allHighscores);
    } else {
      message.channel.send(`Le joueur \`${pseudo}\` (id :\`${id}\`) n'est pas présent dans la liste du ${printMode(mode)}`);
    }
  }

  // ping log
  if (args[0] === 'log') {
    message.channel.send({
      content: 'Voici les fichiers des joueurs et des highscores:',
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

  // ping listall
  if (args[0] === 'listall') {
    message.channel.send(listeJoueurs(joueurs, allHighscores));
  }

  // ping rmplayer
  if (args[0] === "rmplayer") {
    if (args[1]) {
      if (joueurs[args[1]]) {
        message.channel.send(`Joueur \`${args[1]}\` supprimé
\`\`\`json
${JSON.stringify(joueurs[args[1]], null, "   ")}
\`\`\``);
        delete joueurs[args[1]]
        saveJoueurs(joueurs);
      } else {
        message.channel.send(`Aucun joueur enregistré ne correspond à l'id \`${args[1]}\``);
      }
    } else {
      message.channel.send('Vous devez spécifier un id!');
    }
  }
});