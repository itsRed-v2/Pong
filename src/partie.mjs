import { printMode as importedPrintMode } from './pong.mjs';

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
        return importedPrintMode(this.mode);
    }

    static fromJsObject(object) {
        const AvailableModes = new Set([
            'mode_plus',
            'mode_moins',
            'mode_double'
        ]);
        if (typeof object['n1'] === 'number'
            && typeof object['n2'] === 'number'
            && (object['signe'] === '+' || object['signe'] === '-')
            && typeof object['points'] === 'number' && object['points'] >= 0
            && AvailableModes.has(object['mode'])) {
                let partie = new Partie(object['mode']);
                partie.n1 = object['n1'];
                partie.n2 = object['n2'];
                partie.signe = object['signe'];
                partie.points = object['points'];
                return partie;
        } else {
            return undefined;
        }
    }
}