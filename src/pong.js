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

//console.log(String.fromCharCode(messagecodeAscii));

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

function enTexte(nombres) {
    // const { Readable } = require("stream")
    // const readable = Readable.from(nombres)
    
    // return new Promise((resolve, reject) => {
    //     var resultat = ""
    //     readable
    //         .pipe(new uuencode({encoder: true}))
    //         .on("data", (nombre_encode) => {
    //             resultat += nombre_encode
    //         })
    //     readable.on('end', function(){
    //         resolve(resultat)
    //     })
    // })
}

function litCode() {
    
}

module.exports = { code, decode, litCode }