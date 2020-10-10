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

function liste(joueurs) {
    var liste = []
    Object.keys(joueurs).forEach(nom => {
        if (joueurs[nom].partie) {
            liste.push(`\`${nom}\` - ${joueurs[nom].partie.score()}, ${printMode(joueurs[nom].partie.mode)}`)
        }
    });
    if (liste.length > 1) {
        liste.unshift(`${liste.length} parties sont en cours:`)
    } else if (liste.length == 1) {
        liste.unshift(`1 partie est en cours:`)
    } else {
        liste.unshift(`Aucune partie n'est en cours`)
    }
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
  
module.exports = { code, decode, liste, printMode, pauseQuestion }