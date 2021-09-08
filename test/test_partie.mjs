import chai from 'chai';
const expect = chai.expect;
import Partie from '../src/partie.mjs'

describe('Partie', function () {
    const mode_plus = "mode_plus";
    const mode_moins = "mode_moins";
    const mode_double = "mode_double";

    describe('#question()', function () {
        it('renvoie la question', function () {
            let partie = new Partie(mode_plus);
            partie.n1 = 5;
            partie.signe = '+';
            partie.n2 = 10;
            expect(partie.question()).to.eql('5+10');
            partie.signe = '-';
            expect(partie.question()).to.eql('5-10');
        });
    });

    describe('#poseQuestion()', function () {
        it('génère et renvoie la question bien présentée (mode_plus)', function () {
            let partie = new Partie(mode_plus);
            expect(partie.poseQuestion()).to.match(/^pong \d+\+\d+ !$/);
            expect(partie.n1).to.match(/^\d+$/);
            expect(partie.signe).to.eql('+');
            expect(partie.n2).to.match(/^\d+$/);
        });
        it('génère et renvoie la question bien présentée (mode_moins)', function () {
            let partie = new Partie(mode_moins);
            expect(partie.poseQuestion()).to.match(/^pong \d+-\d+ !$/);
            expect(partie.n1).to.match(/^\d+$/);
            expect(partie.signe,).to.eql('-');
            expect(partie.n2).to.match(/^\d+$/);
        });
    });

    describe('#reponse()', function () {
        it("renvoie la réponse de la partie (opération: +)", function () {
            let partie = new Partie(mode_plus);
            partie.n1 = 16;
            partie.signe = '+';
            partie.n2 = 5;
            expect(partie.reponse()).to.eql(21);
        });
        it("renvoie la réponse de la partie (opération: -)", function () {
            let partie = new Partie(mode_moins);
            partie.n1 = 16;
            partie.signe = '-';
            partie.n2 = 5;
            expect(partie.reponse()).to.eql(11);
        });
    });

    describe('#printScore()', function () {
        it("renvoie le score avec le 'point' au singulier", function () {
            let partie = new Partie(mode_moins);
            expect(partie.printScore()).to.eql('0 point');
            partie.points = 1;
            expect(partie.printScore()).to.eql('1 point');
        });
        it("renvoie le score avec le 'points' au pluriel", function () {
            let partie = new Partie(mode_moins);
            partie.points = 2;
            expect(partie.printScore()).to.eql('2 points');
        });
    });
});