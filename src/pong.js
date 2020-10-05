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

module.exports = { code, decode }