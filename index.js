const fs = require('fs')
const Discord = require('discord.js')
const exitHook = require('exit-hook')
const bot = new Discord.Client()
const allHighscores = require('./highscores.js')
console.log(allHighscores)

const AIDE_UTILISATEUR = `**Liste des commandes**
**Jeu:**
\`ping règles\` donne les règles du jeu
\`ping ?\` repose la question en cours
\`ping\` commence une partie (si aucune partie n'est en cours)
\`ping help\` affiche cette liste
\`ping highscores\` / \`ping hs\` affiche les meilleurs scores des joueurs
\`ping mode <signe(s)>\` choisir le mode de jeu parmi \`+\`, \`-\`, ou double (\`+-\`)
\`ping list\` liste toutes les parties en cours

**Cryptage:**
\`\`\`
ping (code|decode) <clé (1er ligne)>
<message (a partir de la 2e ligne)>
\`\`\`permet de crypter/décripter un message à partir d'une clé de cryptage`

const AIDE_ADMIN = `**Admin:**
\`ping reload\` recharge le code de pong (nécéssite de stopper toutes les parties)
\`ping tp <pseudo> <score>\` set le score du joueur spécifié
\`ping seths <id> <highscore> <plus|moins|double>\` set le highscore du joueur spécifié dans le mode spécifié
\`ping addhs <id> <highscore> <plus|moins|double>\` ajoute le joueur à la liste dans le mode spécifié avec le score spécifié
\`ping rmhs <id> <plus|moins|double>\` supprime le joueur de la liste dans le mode spécifié
\`ping highscore info\` / \`ping hs info\` affiche les meilleurs scores et l'id des joueurs`

bot.on('ready', function () {
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.login(require('./token.js'))

exitHook(() => {
  bot.destroy()
})

//================================ fonctions VV

var { newJoueur } = require('./src/joueur')
var {
  code,
  decode,
  listeJoueursActifs,
  afficheliste,
  printMode,
  pauseQuestion,
  matchTp,
  changeScore,
  matchHs,
  matchRmHs,
  changeHs,
  ajouteHs,
  removeHs,
  matchPing
} = require('./src/pong')

function printHighscores(allHighscores,afficheId) {
  var contenu = ''
  for (var mode in allHighscores) {
    contenu += '**' + printMode(mode) + '**\n'
    var highscoresTriees = trieHighscores(allHighscores[mode])
    for (var index in highscoresTriees) {
      var highscore = highscoresTriees[index]
      if (bot.users.cache.get(highscore[0])) {
        highscore[2] = bot.users.cache.get(highscore[0]).username
      } else {
        highscore[2] = 'PLAYER_NOT_FOUND'
      }
      var position = parseInt(index) + 1
      contenu += `\`${position}) ${highscore[1]} : ${highscore[2]}\`${afficheId ? `  \`${highscore[0]}\``:''}\n`
    }
  }
  return contenu
}

function contenuHighscores(highscores) {
  var contenu = ''
  var highscoresTriees = trieHighscores(highscores)
  for (var position in highscoresTriees) {
    var highscore = highscoresTriees[position]
    contenu += "'" + highscore[0] + "' : " + highscore[1] +",\n"
  }
  return contenu
}

function enregistreHighScore(allHighscores) {
  var contenu = "module.exports = {\n"
  for (var mode in allHighscores) {
    contenu += mode + ': {\n'
    contenu += contenuHighscores(allHighscores[mode])
    contenu += "},\n"
  }
  contenu += "};"

  fs.writeFile("./highscores.js", contenu, function (err) {
    if (err) return console.log(err)
  });
}

function trieHighscores(highscores) {
  var sortable = []
  for (var id in highscores) {
    sortable.push([id, highscores[id]])
  }
  sortable.sort(function(a, b) {
    return b[1] - a[1]
  });
  return sortable
}

function getUsername(id) {
  return bot.users.cache.get(id).username
}

//================================

var joueurs = {}

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase()
  var arguments = matchPing(contenu)
  if (arguments === null) {
    return
  }

  var joueur = joueurs[message.author.id]
  if (joueur == undefined) {
    joueur = newJoueur()
    joueurs[message.author.id] = joueur
  }
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
      message.reply('Une partie en ' + printMode(partie.mode) + ' est déjà en cours, tu as ' + partie.score() + ` et la question est: ` + partie.question() + `\nPour commencer une nouvelle partie, tu dois d'abord perdre celle là!`)
    }
    else {
      partie = joueur.demarrerPartie(message)
      bot.channels.cache.get('763372739238559774').send(':white_check_mark:  **' + message.author.username + '** a commencé une partie en **' + printMode(partie.mode) + '**')
    }
  }

  else if (partie) {
    // test bonne réponse
    if (arguments == partie.reponse()) {
      var highscore = allHighscores[partie.mode][message.author.id] || 0
      partie.marqueUnPoint()
      message.reply(`Correct ! Tu as ${partie.score()}${partie.points > highscore ? ' **Meilleur score!**' : ''}`)
      pauseQuestion(message, partie)
      // maj highscore
      if (partie.points > highscore) {
        allHighscores[partie.mode][message.author.id] = partie.points
        enregistreHighScore(allHighscores)
      }
    }

    // test mauvaise réponse
    else if (arguments.match(/^-?\d+$/)) {
      message.reply(`Faux ! La réponse était ${partie.reponse()}. Ton score final est de ${partie.score()}${partie.points > highscore ? ", c'est ton **meilleur score!**" : ''}`)
      bot.channels.cache.get('763372739238559774').send(':x:  **' + message.author.username + '** a perdu une partie à **' + partie.score() + '** (' + printMode(partie.mode) + ')')
      joueur.partie = undefined
    }

    // ping ?
    else if (arguments === '?') {
      message.reply('pong ' + partie.question() + ' ! (' + printMode(partie.mode) + ')')
    }
  }
   
  // réponse ou  "ping ?" mais aucune partie en cours
  else if (arguments.match(/^-?\d+$/) || arguments === '?') {
    message.reply('Aucune partie en cours. Tape "ping" pour lancer une partie')
  }

  // ping list
  if (arguments === 'list') {
    message.channel.send(afficheliste(listeJoueursActifs(joueurs, getUsername)))
  }

});

bot.on('message', message => {

  if (message.author.bot) {
    return
  }

  var contenu = message.content.toLowerCase()
  var arguments = matchPing(contenu)
  if (arguments === null) {
    return
  }

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

  if (arguments === 'help') {
    if (message.author.id == 364820614990528522) {
      message.channel.send(AIDE_UTILISATEUR + '\n\n' + AIDE_ADMIN)
    } else {
      message.channel.send(AIDE_UTILISATEUR)
    }
  }
  if (arguments === 'highscores' || arguments === 'hs') {
    message.channel.send(printHighscores(allHighscores,false))
  }
  if ((arguments === 'highscores info' || arguments === 'hs info') && message.author.id == 364820614990528522) {
    message.channel.send(printHighscores(allHighscores,true))
  }
  // if (arguments === 'test') {
  //   console.log(joueurs)
  // }
});

bot.on('message', message => {

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

bot.on('message', commandesAdmin);
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
    if (!listeJoueursActifs(joueurs, getUsername)[0]) {
      message.channel.send('Reloading!').then(() => {
        process.exit()
      })
    } else {
      var msg = afficheliste(listeJoueursActifs(joueurs, getUsername))
      msg.push('Forcer le reload: `ping reload force`')
      message.channel.send(msg)
      console.log(message.id)
    }
  }
  // ping reload force
  if (arguments === 'reload force') {
    message.channel.send('Reloading!').then(() => {
      process.exit()
    })
  }

  // ping tp
  if (matchTp(arguments)) {
    var msg = matchTp(arguments)
    if (changeScore(msg[1],msg[2],joueurs)) {
      var pseudo = bot.users.cache.get(msg[1]).username
      message.channel.send(`Le score du joueur \`${pseudo}\` (\`${msg[1]}\`) est maintenant ${msg[2]}`)
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
    enregistreHighScore(allHighscores)
  }
  // ping rmhs
  if (matchRmHs(arguments)) {
    var msg = matchRmHs(arguments)
    if (bot.users.cache.get(msg[1])) {
      var pseudo = bot.users.cache.get(msg[1]).username
      if (removeHs(msg[1], msg[2], allHighscores)) {
        message.channel.send(`Le highscore du joueur \`${pseudo}\` (\`${msg[1]}\`) en ${printMode('mode_'+msg[2])} a été supprimé`)
      } else {
        message.channel.send(`Le joueur \`${pseudo}\` (\`${msg[1]}\`) n'est pas présent dans la liste du ${printMode('mode_'+msg[2])}`)
      }
      enregistreHighScore(allHighscores)
    } else {
      message.channel.send(`Personne n'a été trouvé avec l'id \`${msg[1]}\``)
    }
  }
};