function newPartie(mode) {
  return {
    "points": 0,
    "mode": mode,
    "N1": 0,
    "N2": 0,
    "operation": "+"
  }
}

// NON TESTÉ (à cause de l'objet message)
function demarrerPartie(message, joueur, newPartie) {
  joueur.partie = newPartie(joueur.mode);
  message.reply("Démarrage d'une nouvelle partie en **" + printMode(joueur.mode) + "** !");
  pauseQuestion(message, joueur.partie);
  return joueur.partie;
}

function reponse(partie) {
  if (partie.operation == '+') return partie.N1 + partie.N2;
  else return partie.N1 - partie.N2;
}

function score(partie) {
  return partie.points + ' point' + (partie.points > 1 ? 's':'')
}

function question(partie) {
  return partie.N1 + partie.operation + partie.N2;
}

// PAS COMPLÈTEMENT TESTÉ (à cause du facteur aléatoire)
function tireAuSortDeuxNombres(partie) {
  var possibilites = 10 + partie.points
  partie.N1 = Math.floor(Math.random() * possibilites) + partie.points;
  partie.N2 = Math.floor(Math.random() * possibilites) + partie.points;
  var signeAuHasard = Math.floor(Math.random() * 2) == 1 ? '+':'-';
  partie.operation = (partie.mode == "mode_plus" ? '+':(partie.mode == "mode_moins" ? '-':signeAuHasard));
}

// NON TESTÉ
function pauseQuestion (message, partie) {
  tireAuSortDeuxNombres(partie);
  message.reply('pong ' + question(partie) + ' !'); 
}

function printMode(mode) {
  return MODES[mode];
}
const MODES = {
  mode_plus: 'Mode Addition',
  mode_moins: 'Mode Soustraction',
  mode_double: 'Mode Double'
}

module.exports = {
  newPartie,
  demarrerPartie,
  reponse,
  score,
  question,
  tireAuSortDeuxNombres,
  pauseQuestion,
  printMode
}