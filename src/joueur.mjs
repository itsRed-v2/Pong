import Partie from './partie.mjs';

export default class Joueur {
    constructor(pseudo, discriminator) {
        this.pseudo = pseudo;
        this.discriminator = discriminator;
        this.mode = "mode_plus";
    }

    demarrerPartie(message) {
        this.partie = new Partie(this.mode);
        message.reply("Démarrage d'une nouvelle partie en **" + this.partie.printMode(this.mode) + "** !\n" + this.partie.poseQuestion(this.partie));
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
}