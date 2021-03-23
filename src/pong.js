const {
    score,
    printMode
} = require('./partie')

function code(message, cle) {
    var messageCode = []
    for (var index = 0, icle = 0; index < message.length; index++, icle++) {
        var messageAscii = message.charCodeAt(index)
        icle = icle % cle.length
        var cleAscii = cle.charCodeAt(icle)
        var messageCodeAscii = messageAscii ^ cleAscii
        messageCode.push(messageCodeAscii)
    }
    return messageCode
}

function decode(messagecode, cle) {
    var messageDecode = ""
    for (var index = 0, icle = 0; index < messagecode.length; index++, icle++) {
        icle = icle % cle.length
        var cleAscii = cle.charCodeAt(icle)
        var lettre = messagecode[index] ^ cleAscii
        messageDecode += String.fromCharCode(lettre)
    }
    
    return messageDecode
}

function afficheliste(liste) {
    if (liste.length > 1) {
        liste.unshift(`${liste.length} parties sont en cours:`)
    } else if (liste.length == 1) {
        liste.unshift(`1 partie est en cours:`)
    } else {
        liste.unshift(`Aucune partie n'est en cours`)
    }
    return liste
}

function listeJoueursActifs(joueurs, getUsername, info, getDiscriminator) {
    var liste = []
    Object.keys(joueurs).forEach(id => {
        if (joueurs[id].partie) {
            var nom = getUsername(id)
            liste.push(`\`${nom}${info ? '#'+getDiscriminator(id):''}\`${info ? ' \`'+id+'\`' : ''} - ${score(joueurs[id].partie)}, ${printMode(joueurs[id].partie.mode)}`)
        }
    });
    return liste
}



function matchTp(arguments) {
    return arguments.match(/^tp (.+) (\d*)$/i)
}

function changeScore(id, score, joueurs) {
    if (joueurs[id] && joueurs[id].partie) {
        var oldpts = joueurs[id].partie.points
        joueurs[id].partie.points = score
        return oldpts
    } else {
        return false
    }
}

function matchHs(arguments) {
    return arguments.match(/^(seths|addhs) (.+) (\d*) (plus|moins|double)$/i)
}

function matchRmHs(arguments) {
    return arguments.match(/^rmhs (.+) (plus|moins|double)$/i)
}

function changeHs(id, score, mode, allHighscores) {
    const clemode = 'mode_'+mode
    if (allHighscores[clemode][id]) {
        allHighscores[clemode][id] = parseInt(score)
        return true
    } else {
        return false
    }
}

function ajouteHs(id, score, mode, allHighscores) {
    const clemode = 'mode_'+mode
    if (!allHighscores[clemode][id]) {
        allHighscores[clemode][id] = parseInt(score)
        return true
    } else {
        return false
    }
}

function removeHs(id, mode, allHighscores) {
    const clemode = 'mode_'+mode
    if (allHighscores[clemode][id]) {
        delete allHighscores[clemode][id]
        return true
    } else {
        return false
    }
}

function matchPing(contenu) {
    lignes = contenu.split('\n')
    match = lignes[0].match(/^(ping|p)( (.+))?/i)
    if (!match) return null
    if (match[3]) {
        lignes.shift()
        lignes.unshift(match[3])
        return lignes.join('\n')
    }
    return ''
    // pas de else car return termine la fonction
}

function reload(message, channel, getUsername, joueurs, fs) {
    message.channel.send(':repeat: Reloading!')
    fs.writeFile("./data/players.js", stringifyForExport(joueurs), function (err) {
        if (err) return console.log(err)
    });
    msg = msgReload(joueurs, getUsername)
    channel.send(msg).then(() => {
        process.exit()
    })
}

function msgReload(joueurs, getUsername) {
    var liste = []
    Object.keys(joueurs).forEach(id => {
        if (joueurs[id].partie) {
            var nom = getUsername(id)
            liste.push(`:small_orange_diamond: La partie de \`${nom}\` (${score(joueurs[id].partie)}, ${printMode(joueurs[id].partie.mode)}) a été stoppée par le reload`)
        }
    })
    liste.unshift(':repeat: Reloading')
    return liste
}

function trieHighscores(highscores) {
    var sortable = []
    for (var id in highscores) {
        sortable.push([id, highscores[id]])
    }

    sortable.sort((hs1, hs2) => { return hs2[1] - hs1[1] });
    return sortable
}

function stringifyForExport(object) {
    return "module.exports = " + JSON.stringify(object, null, "  ") + ";"
}

function printHighscores(allHighscores, printInfo, getUsername, getDiscriminator) {
    var contenu = ''
    for (var mode in allHighscores) {
      contenu += '**' + printMode(mode) + '**\n'
      var highscoresTriees = trieHighscores(allHighscores[mode])
      for (var index in highscoresTriees) {
        var highscore = highscoresTriees[index]
        pseudo = getUsername(highscore[0])
        discriminator = getDiscriminator(highscore[0])
        var position = parseInt(index) + 1
        contenu += `\`${position}) ${highscore[1]} : ${pseudo}${printInfo ? '#'+discriminator : ''}\`${printInfo ? `  \`${highscore[0]}\``:''}\n`
      }
    }
    return contenu
}





module.exports = {
    code,
    decode,
    listeJoueursActifs, // ==> partie? joueur?
    afficheliste, // ==> partie? joueur?
    matchTp, //==> match
    changeScore,
    matchHs, //==> match
    matchRmHs, //==> match
    changeHs, // ==> hsfunctions
    ajouteHs, // ==> hsfunctions
    removeHs, // ==> hsfunctions
    matchPing, //==> match
    reload,
    msgReload,
    trieHighscores, // ==> hsfunctions
    stringifyForExport,
    printHighscores
}