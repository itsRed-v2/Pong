export default class Partie {

    constructor(mode) {
        this.points = 0;
        this.mode = mode;
        this.n1;
        this.n2;
        this.signe;
    }

    question() {
        return this.n1 + this.signe + this.n2;
    }

    poseQuestion() {
        var possibilites = 10 + this.points
        this.n1 = Math.floor(Math.random() * possibilites) + this.points;
        this.n2 = Math.floor(Math.random() * possibilites) + this.points;
        if (this.mode == "mode_plus") this.signe = '+';
        else if (this.mode == "mode_moins") this.signe = '-';
        else if (this.mode == "mode_double") this.signe = Math.floor(Math.random() * 2) == 1 ? '+':'-';

        return 'pong ' + this.question() + ' !';
    }

    reponse() {
        if (this.signe === '+') return this.n1 + this.n2;
        else return this.n1 - this.n2;
    }

    printScore() {
        return this.points + ' point' + (this.points > 1 ? 's':'')
    }
    
    printMode() {
        const MODES = {
            mode_plus: 'Mode Addition',
            mode_moins: 'Mode Soustraction',
            mode_double: 'Mode Double'
        }
        return MODES[this.mode];
    }
}