import fs from 'fs';
import { Client, Collection, Intents } from 'discord.js';
import { token, adminIds, logChannelId } from'./config.mjs';
import exitHook from 'exit-hook';
import DiscordLogger from './src/discordLogger.mjs';

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['CHANNEL']
})

client.once('ready', function () {
  console.log(`Logged in as ${client.user.tag}!`)
  DiscordLogger.instance.setLogChannel(client.channels.cache.get(logChannelId));
})

exitHook(() => {
  client.destroy()
})

//================================ constantes

const DATA_PATH = process.env.PONG_DATA_PATH;
const HIGHSCORE_PATH = DATA_PATH + '/highscores.mjs';
const PLAYERS_PATH = DATA_PATH + '/players.mjs';

console.log('Dossier data: ' + DATA_PATH);

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
import {
  saveHighScores,
  saveJoueurs,
} from './src/file-tools.mjs'

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
    await interaction.reply({
      content: ":x: Une erreur est survenue durant l'execution de cette commande!",
      ephemeral: true
    });
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

  // ping
  if (contenu === 'ping') {
    if (partie) {
      message.reply(`Une partie en ${partie.printMode()} est d??j?? en cours, tu as ${partie.printScore()} et la question est ${partie.question()}
Tu ne peux pas avoir plusieurs parties en m??me temps. Pour arr??ter une partie en cours, utilise \`ping stop\``)
    }
    else {
      if(createJoueurIfNeeded(id, getUsername(id), getDiscriminator(id), JOUEURS)) {
        joueur = JOUEURS[id];
      }
      partie = joueur.demarrerPartie(message);
      saveJoueurs(JOUEURS);
      DiscordLogger.instance.sendAsLog(':white_check_mark:  `' + message.author.username + '` a commenc?? une partie en **' + partie.printMode() + '**')
    }
  }

  else if (partie) {
    // test bonne r??ponse
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

    // test mauvaise r??ponse
    else if (isInteger(args[0])) {
      message.reply(`Faux ! La r??ponse ??tait ${partie.reponse()}. Ton score final est de ${partie.printScore()}${partie.points > highscore ? ", c'est ton **meilleur score!**" : ''}`)
      DiscordLogger.instance.sendAsLog(':x:  `' + message.author.username + '` a perdu une partie ?? **' + partie.printScore() + '** (' + partie.printMode() + ')')
      joueur.partie = undefined
      saveJoueurs(JOUEURS)
    }
  }
   
  // r??ponse mais aucune partie en cours
  else if (isInteger(args[0])) {
    message.reply('Aucune partie en cours. Tape `ping` pour lancer une partie')
  }
});

// ***********************
// *** COMMANDES ADMIN ***
// ***********************

client.on('messageCreate', message => {
  
  if (message.author.bot) return;
  if (!adminIds.has(message.author.id)) return;
  
  var contenu = message.content
  var args = matchPing(contenu);
  if (args === null) return;

  //ping reload
  if (args[0] === 'reload') {
    reload(message, JOUEURS);
  }

  // ping tp
  if (matchTp(args)) {
    var newScore = args[2];
    var id = args[1]
    var oldScore = changeScore(id, newScore, JOUEURS)
    if (oldScore || oldScore === 0) {
      var pseudo = getUsername(id);
      saveJoueurs(JOUEURS);
      message.channel.send(`Score du joueur \`${pseudo}\` (\`${id}\`) modifi??: ${oldScore} ==> **${newScore}**`)
      DiscordLogger.instance.sendAsLog(`:arrow_right: Score de \`${pseudo}\` (\`${id}\`) modifi??: ${oldScore} ==> **${newScore}**`)
    } else {
      message.channel.send(`Le joueur d'id \`${id}\` n'existe pas ou n'a pas de partie en cours.`)
    }
  }
  
  // mod??ration highscores
  if (matchHs(args)) {
    var pseudo = getUsername(args[1]);
    if (args[0] == 'seths') {
      // ping seths
      if (changeHs(args[1], args[2], args[3], allHighscores)) {
        message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${args[1]}\`) en ${printMode('mode_'+args[3])} est maintenant ${args[2]}`)
      } else {
        message.channel.send(`L'id \`${args[1]}\` ne correspond ?? aucun joueur dans le mode sp??cifi??`)
      }
    } else {
      // ping addhs
      if (isPlayerCached(args[1])) {
        if (ajouteHs(args[1], args[2], args[3], allHighscores)) {
          message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${args[1]}\`) en ${printMode('mode_'+args[3])} a ??t?? ajout?? et sa valeur est ${args[2]}`)
        } else {
          message.channel.send(`Un joueur d'id \`${args[1]}\` (\`${pseudo}\`) est d??ja pr??sent dans la liste`)
        }
      } else {
        message.channel.send(`Personne n'a ??t?? trouv?? avec l'id \`${args[1]}\``)
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
      message.channel.send(`Le highscore du joueur \`${pseudo}\` (id: \`${id}\`) en ${printMode(mode)} a ??t?? supprim??`);
      saveHighScores(allHighscores);
    } else {
      message.channel.send(`Le joueur \`${pseudo}\` (id :\`${id}\`) n'est pas pr??sent dans la liste du ${printMode(mode)}`);
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
        message.channel.send(`Joueur \`${args[1]}\` supprim??
\`\`\`json
${JSON.stringify(JOUEURS[args[1]], null, "   ")}
\`\`\``);
        delete JOUEURS[args[1]]
        saveJoueurs(JOUEURS);
      } else {
        message.channel.send(`Aucun joueur enregistr?? ne correspond ?? l'id \`${args[1]}\``);
      }
    } else {
      message.channel.send('Vous devez sp??cifier un id!');
    }
  }
});