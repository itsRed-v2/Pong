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

function decode(messagecode,cle) {
    var messageDecode = ""
    for (var index = 0, icle = 0; index < messagecode.length; index++, icle++) {
        icle = icle % cle.length
        var cleAscii = cle.charCodeAt(icle)
        var lettre = messagecode[index] ^ cleAscii
        messageDecode += String.fromCharCode(lettre)
    }
    
    return messageDecode
}

function afficheliste(joueurs,bot) {
    var liste = listeJoueursActifs(joueurs,bot)
    if (liste.length > 1) {
        liste.unshift(`${liste.length} parties sont en cours:`)
    } else if (liste.length == 1) {
        liste.unshift(`1 partie est en cours:`)
    } else {
        liste.unshift(`Aucune partie n'est en cours`)
    }
    return liste
}

function listeJoueursActifs(joueurs,bot) {
    var liste = []
    Object.keys(joueurs).forEach(id => {
        if (joueurs[id].partie) {
            var nom = bot.users.cache.get(id).username
            liste.push(`\`${nom}\` - ${joueurs[id].partie.score()}, ${printMode(joueurs[id].partie.mode)}`)
        }
    });
    return liste
}

function printMode(mode) {
    return MODES[mode];
}
  
const MODES = {
    mode_plus: 'Mode Addition',
    mode_moins: 'Mode Soustraction',
    mode_double: 'Mode Double'
};

function pauseQuestion (message, partie) {
    partie.tireAuSortDeuxNombres();
    message.reply('pong ' + partie.question() + ' !'); 
}

function matchTp(commande) {
    return commande.match(/^ping tp (.+) (\d*)$/i)
}

function changeScore(id, score, joueurs) {
    if (joueurs[id] && joueurs[id].partie) {
        joueurs[id].partie.points = score
        return true
    } else {
        return false
    }
}

function matchHs(commande) {
    return commande.match(/^ping (seths|addhs) (.+) (\d*) (plus|moins|double)$/i)
}

function matchRmHs(commande) {
    return commande.match(/^ping rmhs (.+) (plus|moins|double)$/i)
}

function changeHs(id, score, mode, allHighscores) {
    const clemode = 'mode_'+mode
    if (allHighscores[clemode][id]) {
        allHighscores[clemode][id] = score
        return true
    } else {
        return false
    }
}

function ajouteHs(id, score, mode, allHighscores) {
    const clemode = 'mode_'+mode
    if (!allHighscores[clemode][id]) {
        allHighscores[clemode][id] = score
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

module.exports = {
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
    removeHs
}