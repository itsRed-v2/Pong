function newJoueur(pseudo, discriminator) {
  return {
    "pseudo": pseudo,
    "discriminator": discriminator,
    "mode": "mode_plus"
  }
}

function createJoueurIfNeeded(id, pseudo, discriminator, joueurs, newJoueur) {
  var joueur = joueurs[id];
  if (joueur == undefined) {
      joueur = newJoueur(pseudo, discriminator);
      joueurs[id] = joueur;
      return true;
  }
  return false;
}

function updateJoueur(id, pseudo, discriminator, joueurs) {
  var joueur = joueurs[id];
  if (pseudo !== joueur["pseudo"] || discriminator !== joueur["discriminator"]) {
    joueur["pseudo"] = pseudo;
    joueur["discriminator"] = discriminator;
    return true;
  }
  return false;
}

module.exports = {
  newJoueur,
  createJoueurIfNeeded,
  updateJoueur
}