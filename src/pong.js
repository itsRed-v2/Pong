
const CODES = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    ' ',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]
  CODES_LENGTH = CODES.length;

function toNumber(lettres) {
    var nombres = [];
    for (index = 0; index < lettres.length; index++) {
        nombres[index] = CODES.indexOf(lettres[index])
    }
    return nombres
}


function toString(nombres) {
    var output = ''
    for (index = 0; index < nombres.length; index++) {
        output += CODES[nombres[index]]
    }
    return output
}

function code(message, cle) {
    var messageCode = ''
    var index = 0
    for (index = 0; index < 5; index++) {
        var messageAscii = message.charCodeAt(index)
        var cleAscii = cle.charCodeAt(index)
        var messageCodeAscii = messageAscii ^ cleAscii
        var Code = String.fromCharCode(messageCodeAscii)
        messageCode += Code
    }

    

    console.log(messageCode)
    return messageCode
}

//console.log(String.fromCharCode(messagecodeAscii));

function decode(messagecode,cle) {
    
    return message
}

module.exports = { toNumber, toString, code, decode, CODES_LENGTH }
/*
var ch = 'A';
var index = 0;
 
var i = ch.charCodeAt(index);
console.log(i);
*/