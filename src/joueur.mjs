import Partie from './partie.mjs';

export default class Joueur {
    constructor(pseudo, discriminator) {
        this.pseudo = pseudo;
        this.discriminator = discriminator;
        this.mode = "mode_plus";
    }

    demarrerPartie(message) {
        this.partie = new Partie(this.mode);
        message.reply("Démarrage d'une nouvelle partie en **" + this.partie.printMode() + "** !\n" + this.partie.poseQuestion(this.partie));
        return this.partie;
    }

    update(pseudo, discriminator) {
        if (pseudo !== this.pseudo || discriminator !== this.discriminator) {
            this.pseudo = pseudo;
            this.discriminator = discriminator;
            return true;
        }
        return false;
    }

    static fromJsObject(object) {
        const AvailableModes = new Set([
            'mode_plus',
            'mode_moins',
            'mode_double'
        ]);
        if (typeof object['pseudo'] === 'string'
            && typeof object['discriminator'] === 'string'
            && AvailableModes.has(object['mode'])) {
                let joueur = new Joueur(object['pseudo'], object['discriminator']);
                joueur.mode = object['mode'];
                if (object['partie']) {
                    let partie = Partie.fromJsObject(object['partie']);
                    if (partie) joueur.partie = partie;
                    else return undefined;
                }
                return joueur;
        } else {
            return undefined;
        }
    }
}