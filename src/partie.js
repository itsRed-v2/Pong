class Partie {
    constructor(mode) {
      this.N1;
      this.N2;
      this.points = 0;
      this.mode = mode
    }
    
    tireAuSortDeuxNombres() {
      var possibilites = 10 + this.points
      this.N1 = Math.floor(Math.random() * possibilites) + this.points;
      this.N2 = Math.floor(Math.random() * possibilites) + this.points;
      var signeAuHasard = Math.floor(Math.random() * 2) == 1 ? '+':'-';
      this.operation = (this.mode == "mode_plus" ? '+':(this.mode == "mode_moins" ? '-':signeAuHasard));
    }
  
    question() {
      return this.N1 + this.operation + this.N2;
    }
  
    reponse() {
      if (this.operation == '+') return this.N1 + this.N2;
      else return this.N1 - this.N2;
    }
  
    score () {
      return this.points + ' point' + (this.points > 1 ? 's':'')
    }
  
    marqueUnPoint() {
      this.points++;
    }
}

function newPartie(mode) {
    return new Partie(mode)
  }

module.exports = { 
    newPartie
  }