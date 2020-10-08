var { printMode, pauseQuestion } = require('./pong')
var { newPartie } = require('./partie')

class Joueur {
  constructor() {
    this.mode = 'mode_plus';
  }
  
  demarrerPartie(message) {
    message.reply("Démarrage d'une nouvelle partie en **" + printMode(this.mode) + "** !");
    this.partie = newPartie(this.mode);
    pauseQuestion(message, this.partie);
    return this.partie;
  }
}
  
function newJoueur(){
  return new Joueur()
}

module.exports = { 
  newJoueur
}