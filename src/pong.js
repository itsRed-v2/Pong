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

function listeJoueursActifs(joueurs, info) {
    var liste = []
    Object.keys(joueurs).forEach(id => {
        if (joueurs[id].partie) {
            liste.push(`\`${joueurs[id].pseudo}${info ? '#'+joueurs[id].discriminator:''}\`${info ? ' \`'+id+'\`' : ''} - ${score(joueurs[id].partie)}, ${printMode(joueurs[id].partie.mode)}`)
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
}

function reload(message, channel, joueurs, fs, PLAYERS_PATH) {
    message.channel.send(':repeat: Reloading!')
    fs.writeFile(PLAYERS_PATH, stringifyForExport(joueurs), function (err) {
        if (err) return console.log(err)
    });
    channel.send(':repeat: Reloading').then(() => {
        process.exit()
    })
}

function stringifyForExport(object) {
    return "module.exports = " + JSON.stringify(object, null, "  ") + ";"
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
    matchPing, //==> match
    reload,
    stringifyForExport
}