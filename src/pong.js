const joueur = require("./joueur")

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

function afficheliste(joueurs) {
    var liste = listeJoueursActifs(joueurs)
    if (liste.length > 1) {
        liste.unshift(`${liste.length} parties sont en cours:`)
    } else if (liste.length == 1) {
        liste.unshift(`1 partie est en cours:`)
    } else {
        liste.unshift(`Aucune partie n'est en cours`)
    }
    return liste
}

function listeJoueursActifs(joueurs) {
    var liste = []
    Object.keys(joueurs).forEach(nom => {
        if (joueurs[nom].partie) {
            liste.push(`\`${nom}\` - ${joueurs[nom].partie.score()}, ${printMode(joueurs[nom].partie.mode)}`)
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

function changeScore(nom, score, joueurs) {
    if (joueurs[nom] && joueurs[nom].partie) {
        joueurs[nom].partie.points = score
        return true
    } else {
        return false
    }
}

function matchHs(commande) {
    return commande.match(/^ping seths (.+) (\d*) (plus|moins|double)$/i)
}

function changeHs(nom, score, mode, allHighscores) {
    const clemode = 'mode_'+mode
    if (allHighscores[clemode][nom]) {
        allHighscores[clemode][nom] = score
        return true
    } else {
        return false
    }
    //allHighscores[partie.mode][message.author.username] = partie.points
    //enregistreHighScore(allHighscores)
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
    changeHs
}