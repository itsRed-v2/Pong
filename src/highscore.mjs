import { printMode } from './pong.mjs';

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
    if (allHighscores[mode][id]) {
        delete allHighscores[mode][id]
        return true
    } else {
        return false
    }
}

function trieHighscores(highscores) {
    var sortable = []
    for (var id in highscores) {
        sortable.push([id, highscores[id]])
    }

    sortable.sort((hs1, hs2) => { return hs2[1] - hs1[1] });
    return sortable
}

function printHighscores(allHighscores, printInfo, getUsername, getDiscriminator) {
    var contenu = ''
    for (var mode in allHighscores) {
      contenu += '**' + printMode(mode) + '**\n'
      var highscoresTriees = trieHighscores(allHighscores[mode])
      for (var index in highscoresTriees) {
        var pair = highscoresTriees[index];
        var id = pair[0];
        var score = pair[1];
        var pseudo = getUsername(id);
        var discriminator = getDiscriminator(id);
        var position = parseInt(index) + 1
        contenu += `\`${position}) ${score} : ${pseudo}${printInfo ? '#'+discriminator : ''}\`${printInfo ? `    \`${id}\``:''}\n`
      }
    }
    return contenu
}

export {
    changeHs,
    ajouteHs,
    removeHs,
    trieHighscores,
    printHighscores
};