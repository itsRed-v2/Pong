function newJoueur(pseudo, discriminator) {
  return {
    "mode": "mode_plus",
    "pseudo": pseudo,
    "discriminator": discriminator
  }
}

function findOrCreateJoueur(id, pseudo, discriminator, joueurs, newJoueur) {
  var joueur = joueurs[id]
  if (joueur == undefined) {
      joueur = newJoueur(pseudo, discriminator)
      joueurs[id] = joueur
      return true
  } else if (pseudo !== joueur["pseudo"] || discriminator !== joueur["discriminator"]) {
      joueur["pseudo"] = pseudo
      joueur["discriminator"] = discriminator
      return true
  }
  return false
}

module.exports = {
  newJoueur,
  findOrCreateJoueur
}