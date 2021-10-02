import fs from 'fs';
import { Client, Collection, Intents } from 'discord.js';
import { token } from'./config.mjs';
import exitHook from 'exit-hook';

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['CHANNEL']
})

var logChannel;
client.once('ready', function () {
  console.log(`Logged in as ${client.user.tag}!`)
  logChannel = client.channels.cache.get('763372739238559774');
})

exitHook(() => {
  client.destroy()
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

const REGLES = `Écris \`ping\` pour commencer une partie.
Je vais alors te poser une opération. Réponds par \`ping <réponse>\`
Si ta réponse est correcte, tu gagne un point et je te pose une nouvelle opération.
Si elle est fausse, tu perds et la partie se termine.
- Plus tu as de points, plus les opérations sont difficiles.
- Pas de stress! Tu as tout le temps que tu veux pour répondre.
- Envie de faire une pause? Aucun problème! Tu peux laisser ta partie en plan, et la reprendre plus tard.
- Écris \`ping help\` pour la liste des commandes. Certaines pourraient t'êtres utiles!`

const PONG_DATA = {
  JOUEURS: {},
  HIGHSCORES: {}
};
const JOUEURS = PONG_DATA.JOUEURS;
const allHighscores = PONG_DATA.HIGHSCORES;

const load_promises = [];

// loading data

load_promises.push(import(PLAYERS_PATH).then((importedObject) => {
  const joueursJs = importedObject.data;
  Object.keys(joueursJs).forEach(id => {
    JOUEURS[id] = Joueur.fromJsObject(joueursJs[id]);
  });
}));

load_promises.push(import(HIGHSCORE_PATH).then((importedObject) => {
  const highscoresJs = importedObject.data;
  Object.keys(highscoresJs).forEach(mode => {
    allHighscores[mode] = highscoresJs[mode];
  });
}));

// loading commands

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.mjs'));

for (const fileName of commandFiles) {
  const promise = import(`./commands/${fileName}`).then((file) => {
    const command = file.default
    client.commands.set(command.data.name, command);
  }).catch((error) => {
    console.error(`Erreur lors du chargement du fichier commande ${fileName} :`)
    throw error;
  });
  load_promises.push(promise);
}

//================================ logging in when everything is loaded

Promise.all(load_promises).then(() => {
  client.login(token);
});

//================================ fonctions

import Joueur from './src/joueur.mjs';
import {
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
} from './src/highscore.mjs';

function saveHighScores(allHighscores) {
  fs.writeFile(HIGHSCORE_PATH, stringifyForExport(allHighscores), function (err) {
    if (err) return console.log(err)
  });
}

function saveJoueurs(JOUEURS) {
  fs.writeFile(PLAYERS_PATH, stringifyForExport(JOUEURS), function (err) {
    if (err) return console.log(err)
  });
}

function getUsername(id) {
  if (client.users.cache.get(id)) {
    return client.users.cache.get(id).username
  } else if (JOUEURS[id]) {
    return JOUEURS[id].pseudo;
  } else {
    return 'UNKNOWN'
  }
}

function getDiscriminator(id) {
  if (client.users.cache.get(id)) {
    return client.users.cache.get(id).discriminator
  } else if (JOUEURS[id]) {
    return JOUEURS[id].discriminator;
  } else {
    return '----'
  }
}

function isPlayerCached(id) {
  if (client.users.cache.get(id)) return true;
  else return false;
}

//================================

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, PONG_DATA);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: ":x: Une erreur est survenue durant l'execution de cette commande!", ephemeral: true })
  }
});

client.on('messageCreate', message => {

  if (message.author.bot) return

  var contenu = message.content.toLowerCase()
  var args = matchPing(contenu)
  if (args === null) return

  var id = message.author.id;
  var joueur = JOUEURS[id]
  if (joueur) {
    if (joueur.update(getUsername(id), getDiscriminator(id))) {
      saveJoueurs(JOUEURS);
    }
    var partie = joueur.partie
  }

  // ping mode
  if (args[0] === 'mode') {
    if(createJoueurIfNeeded(id, getUsername(id), getDiscriminator(id), JOUEURS)) {
      saveJoueurs(JOUEURS);
      joueur = JOUEURS[id];
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
      if(createJoueurIfNeeded(id, getUsername(id), getDiscriminator(id), JOUEURS)) {
        joueur = JOUEURS[id];
      }
      partie = joueur.demarrerPartie(message);
      saveJoueurs(JOUEURS);
      sendAsLog(logChannel, ':white_check_mark:  `' + message.author.username + '` a commencé une partie en **' + printMode(partie.mode) + '**')
    }
  }

  else if (partie) {
    // test bonne réponse
    if (args[0] == partie.reponse()) {
      var highscore = allHighscores[partie.mode][id] || 0
      partie.points++
      message.reply(`Correct ! Tu as ${partie.printScore()}.${partie.points > highscore ? ' **C\'est ton Meilleur score!**' : ''}\n${partie.poseQuestion()}`)
      saveJoueurs(JOUEURS)
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
      saveJoueurs(JOUEURS)
    }

    // ping ?
    else if (args[0] === '?') {
      message.reply(`pong ${partie.question()} ! (${partie.printScore()}, ${printMode(partie.mode)})`)
    }

    // ping stop
    else if (args[0] === 'stop') {
      joueur.partie = undefined
      saveJoueurs(JOUEURS)
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
    message.channel.send(REGLES);
  }

  // ping help
  if (args[0] === 'help') {
    if (id == 364820614990528522 && args[1] === 'admin') message.channel.send(AIDE_ADMIN);
    else message.channel.send(AIDE_UTILISATEUR);
  }
});

// ***********************
// *** COMMANDES ADMIN ***
// ***********************

client.on('messageCreate', message => {
  
  if (message.author.bot) return;
  if (message.author.id != "364820614990528522") return;
  
  var contenu = message.content
  var args = matchPing(contenu);
  if (args === null) return;

  //ping reload
  if (args[0] === 'reload') {
    reload(message, logChannel, JOUEURS, fs, PLAYERS_PATH)
  }

  // ping tp
  if (matchTp(args)) {
    var newScore = args[2];
    var id = args[1]
    var oldScore = changeScore(id, newScore, JOUEURS)
    if (oldScore || oldScore === 0) {
      var pseudo = getUsername(id);
      saveJoueurs(JOUEURS);
      message.channel.send(`Score du joueur \`${pseudo}\` (\`${id}\`) modifié: ${oldScore} ==> **${newScore}**`)
      sendAsLog(logChannel, `:arrow_right: Score de \`${pseudo}\` (\`${id}\`) modifié: ${oldScore} ==> **${newScore}**`)
    } else {
      message.channel.send(`Le joueur d'id \`${id}\` n'existe pas ou n'a pas de partie en cours.`)
    }
  }
  
  // modération highscores
  if (matchHs(args)) {
    var pseudo = getUsername(args[1]);
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
    message.channel.send(listeJoueurs(JOUEURS, allHighscores));
  }

  // ping rmplayer
  if (args[0] === "rmplayer") {
    if (args[1]) {
      if (JOUEURS[args[1]]) {
        message.channel.send(`Joueur \`${args[1]}\` supprimé
\`\`\`json
${JSON.stringify(JOUEURS[args[1]], null, "   ")}
\`\`\``);
        delete JOUEURS[args[1]]
        saveJoueurs(JOUEURS);
      } else {
        message.channel.send(`Aucun joueur enregistré ne correspond à l'id \`${args[1]}\``);
      }
    } else {
      message.channel.send('Vous devez spécifier un id!');
    }
  }
});