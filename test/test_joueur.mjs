import chai from 'chai';
import chai_match from 'chai-match';
chai.use(chai_match);
const expect = chai.expect;
import Joueur from '../src/joueur.mjs'

describe('Joueur', function () {
    it('a les propriétés pseudo et discriminator', function() {
        let joueur = new Joueur('Nokari', '0450');
        expect(joueur.pseudo).to.eql('Nokari');
        expect(joueur.discriminator).to.eql('0450');
    });

    describe('#demarrerPartie()', function () {
        it('envoie un message de début de partie', function() {
            let joueur = new Joueur('Nokari', '0450');
            let message = {
                reply: (s) => {
                    let lignes = s.split('\n');
                    expect(lignes[0]).to.eql("Démarrage d'une nouvelle partie en **Mode Addition** !");
                    expect(lignes[1]).to.match(/^pong (\d+)(\+)(\d+) !$/);
                }
            }
            joueur.demarrerPartie(message);
        });
        it('crée une nouvelle partie dans le bon mode', function() {
            let joueur = new Joueur('Nokari', '0450');
            let message = {
                reply: (s) => {}
            }
            joueur.demarrerPartie(message);
            expect(joueur.partie.mode).to.eql("mode_plus");
            expect(joueur.partie.signe).to.eql("+");

            joueur.mode = "mode_moins";
            joueur.demarrerPartie(message);
            expect(joueur.partie.mode).to.eql("mode_moins");
            expect(joueur.partie.signe).to.eql("-");
        });
    });

    describe('#update()', function () {
        it('update les informations du joueur', function() {
            let joueur = new Joueur('Nokari', '0450');
            joueur.update('Nokari_v2', '3793');
            expect(joueur.pseudo).to.eql('Nokari_v2');
            expect(joueur.discriminator).to.eql('3793');
        });
        it('renvoie true si une modification a eu lieu', function() {
            let joueur = new Joueur('Nokari', '0450');
            expect(joueur.update('Nokari_v2', '0450')).to.eql(true);
            expect(joueur.update('Nokari_v2', '3793')).to.eql(true);
        });
        it('renvoie false si aucune modification n\'a eu lieu', function() {
            let joueur = new Joueur('Nokari', '0450');
            expect(joueur.update('Nokari', '0450')).to.eql(false);
        });
    });
});