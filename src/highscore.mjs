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

const MODES = {
    mode_plus: 'Mode Addition',
    mode_moins: 'Mode Soustraction',
    mode_double: 'Mode Double'
}

function printMode(mode) {
    return MODES[mode];
}

function printHighscores(allHighscores, joueurs, printInfo, getUsername, getDiscriminator) {
    var contenu = ''
    for (var mode in allHighscores) {
      contenu += '**' + printMode(mode) + '**\n'
      var highscoresTriees = trieHighscores(allHighscores[mode])
      for (var index in highscoresTriees) {
        var highscore = highscoresTriees[index]
        var pseudo = getUsername(highscore[0]);
        var discriminator = getDiscriminator(highscore[0]);
        var checked = false
        if (pseudo == 'UNKNOWN' && joueurs[highscore[0]]) {
            pseudo = joueurs[highscore[0]].pseudo
            discriminator = joueurs[highscore[0]].discriminator
        } else if (pseudo !== 'UNKNOWN') {
            checked = true
        }
        var position = parseInt(index) + 1
        contenu += `\`${position}) ${highscore[1]} : ${pseudo}${printInfo ? '#'+discriminator : ''}\`${printInfo ? `    \`${highscore[0]}\``:''}${checked && printInfo ? '  ✓':''}\n`
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