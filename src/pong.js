
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
        if (CODES.indexOf(lettres[index]) != -1) {
            nombres[index] = CODES.indexOf(lettres[index])
        }
        else {
            nombres[index] = lettres[index]
        }
    }
    return nombres
}


function toString(nombres) {
    var output = ''
    for (index = 0; index < nombres.length; index++) {
      if (!isNaN(nombres[index])) {
        output += CODES[nombres[index]]
      } 
      else {
        output += nombres[index];
      }
    }
    return output
}

function code(nombres, cle) {
    var nombres_codes = []
    var precedent = -1
    var premier_chiffre_trouve = false;
    for (var i = 0; !premier_chiffre_trouve && i < nombres.length; i++, precedent++){
        if (isNaN(nombres[i])) {
            nombres_codes[i] = nombres[i];
        }
        else {
            nombres_codes[i] = ((nombres[i] + 1) * cle) % CODES_LENGTH
            premier_chiffre_trouve = true
        }
    }
    for (i = precedent + 1; i < nombres.length; i++) {
        if (!isNaN(nombres[i])) {
            nombres_codes[i] = ((nombres[i] + 1) * (nombres_codes[precedent]+1)) % CODES_LENGTH
            precedent = i
        }
        else {
            nombres_codes[i] = nombres[i]
        }
    }
    return nombres_codes
}

function decode(nombres,cle) {
    var nombres_decodes = []
    for (index = nombres.length - 1; index >= 0; index -= 1) {
        if (nombres[index-1] === undefined) {
            for (i = 1; i<100;i++) {
                //console.log((nombres[index]+CODES_LENGTH*i)/cle)
                if (Number.isInteger((nombres[index]+CODES_LENGTH*i)/cle)%CODES_LENGTH) {
                    nombres[index] = ((nombres[index]+CODES_LENGTH*i)/cle)%CODES_LENGTH
                    i = 100
                    //console.log("found")
                }
                //console.log(i)
                if (i == 99) {
                    //console.log("not found")
                }
            }
        } else {
            if (!isNaN(nombres[index])) {
                for (i = 1; i < 100; i++) {
                    if (Number.isInteger((nombres[index]+CODES_LENGTH*i)/nombres[index-1])) {
                        nombres[index] = (nombres[index]+CODES_LENGTH*i)/nombres[index-1]
                        nombres[index] = nombres[index]%CODES_LENGTH
                        i = 100
                        //console.log("1found")
                        //console.log(nombres[index])
                    }
                    if (i == 99) {
                        //console.log("not found")
                    }
                }
            }
        }
    }
    return nombres_decodes
}

module.exports = { toNumber, toString, code, decode, CODES_LENGTH }