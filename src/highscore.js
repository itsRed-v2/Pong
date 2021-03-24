const { printMode } = require('./partie')

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
    const clemode = 'mode_'+mode
    if (allHighscores[clemode][id]) {
        delete allHighscores[clemode][id]
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
        var highscore = highscoresTriees[index]
        pseudo = getUsername(highscore[0])
        discriminator = getDiscriminator(highscore[0])
        var position = parseInt(index) + 1
        contenu += `\`${position}) ${highscore[1]} : ${pseudo}${printInfo ? '#'+discriminator : ''}\`${printInfo ? `  \`${highscore[0]}\``:''}\n`
      }
    }
    return contenu
}

module.exports = {
    changeHs,
    ajouteHs,
    removeHs,
    trieHighscores,
    printHighscores
}