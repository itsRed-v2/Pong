import Joueur from './joueur.mjs';

const MODES_SUFFIXES = new Set([
    'plus',
    'moins',
    'double'
]);

function afficheliste(liste) {
    if (liste.length > 1) {
        liste.unshift(`${liste.length} parties sont en cours:`)
    } else if (liste.length == 1) {
        liste.unshift(`1 partie est en cours:`)
    } else {
        liste.unshift(`Aucune partie n'est en cours`)
    }
    return liste.join('\n');
}

function listeJoueursActifs(joueurs, info) {
    var liste = []
    Object.keys(joueurs).forEach(id => {
        if (joueurs[id].partie) {
            liste.push(`\`${joueurs[id].pseudo}${info ? '#'+joueurs[id].discriminator:''}\`${info ? ' \`'+id+'\`' : ''} - ${joueurs[id].partie.printScore()}, ${printMode(joueurs[id].partie.mode)}`)
        }
    });
    return liste
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

function matchTp(args) {
    if (args[0] !== 'tp') return false;
    if (!isPositiveInteger(args[2])) return false;
    return true;
}

function matchHs(args) {
    if (!(args[0] === 'seths' || args[0] === 'addhs')) return false;
    if (!isPositiveInteger(args[2])) return false;
    if (!MODES_SUFFIXES.has(args[3])) return false;
    return true;
}

function matchRmHs(args) {
    if (args[0] !== 'rmhs') return false;
    if (!MODES_SUFFIXES.has(args[2])) return false;
    return true;
}

function matchPing(contenu) {
    if (!(contenu.startsWith('ping') || contenu.startsWith('p'))) return null;
    var lignes = contenu.split('\n')
    var args = lignes[0].split(' ');
    args.shift();
    return args;
}

function reload(message, logChannel, joueurs, fs, PLAYERS_PATH) {
    fs.writeFile(PLAYERS_PATH, stringifyForExport(joueurs), function (err) {
        if (err) return console.log(err)
    });
    Promise.all([
        message.channel.send(':repeat: Reloading!'),
        sendAsLog(logChannel, ':repeat: Reloading')
    ]).then(() => {
        process.exit();
    });
}

function stringifyForExport(object) {
    return "export let data = " + JSON.stringify(object, null, "  ") + ";"
}

function sendAsLog(logChannel, string) { // non testé
    if (string === ':repeat: Reloading') {
        return logChannel.messages.fetch({ limit: 1 }).then(messages => {
            return logReloadMessage(messages, logChannel);
        });
    } else {
        return logChannel.send(string);
    }
}

function logReloadMessage(messages, logChannel) {
    var lastMessage = messages.first();
    var content = lastMessage.content;
    if (content.match(/^:repeat: Reloading/)) {
        var match = content.match(/(\d*)\)$/);
        if (match) return lastMessage.edit(`:repeat: Reloading (x${parseInt(10, match[1]) + 1})`);
        else return lastMessage.edit(':repeat: Reloading (x2)');
    } else {
        return logChannel.send(':repeat: Reloading');
    }
}

function listeJoueurs(joueurs) {
    var msg = ["**Liste des joueurs enregistrés:**"];
    Object.keys(joueurs).forEach(id =>{
      msg.push(joueurs[id].pseudo);
      if (joueurs[id].partie) msg.push('> partie en cours');
    })
    return msg.join('\n');
}

function isInteger(string) {
    if (typeof string !== 'string') return false;
    if (string.match(/^-?\d+$/)) return +string;
    else return false;
}

function isPositiveInteger(string) {
    if (typeof string !== 'string') return false;
    if (string.match(/^\d+$/)) return +string;
    else return false;
}

function createJoueurIfNeeded(id, pseudo, discriminator, joueurs) {
    var joueur = joueurs[id];
    if (joueur == undefined) {
        joueur = new Joueur(pseudo, discriminator);
        joueurs[id] = joueur;
        return true;
    }
    return false;
}

function printMode(mode) {
    const MODES = {
        mode_plus: 'Mode Addition',
        mode_moins: 'Mode Soustraction',
        mode_double: 'Mode Double'
    }
    return MODES[mode];
}

export {
    listeJoueursActifs,
    afficheliste,
    changeScore,
    matchTp, //==> match
    matchHs, //==> match
    matchRmHs, //==> match
    matchPing, //==> match
    reload,
    stringifyForExport,
    sendAsLog,
    logReloadMessage,
    listeJoueurs,
    isInteger,
    isPositiveInteger,
    createJoueurIfNeeded,
    printMode
}