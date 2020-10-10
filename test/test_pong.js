var expect = require('chai').expect;
var { newJoueur } = require('../src/joueur')
var { newPartie } = require('../src/partie')
var { code, decode, afficheliste} = require('../src/pong')

describe('Pong', function () {
  
  describe('#code()', function () {
    it("crypter une lettre", function () {
      expect(code('a', 'b')).to.eql([3]);
    });
    it("crypter plusieurs lettres", function () {
      expect(code('abcd', 'b')).to.eql([3, 0, 1, 6]);
    });
    it("crypter avec une clé de plusieurs lettres", function () {
      expect(code('abcd', 'ab')).to.eql([0, 0, 2, 6]);
    });
  });

  describe('#decode()', function () {
    it("decrypter une lettre", function () {
      expect(decode([3], 'b')).to.eql('a');
    });
    it("décrypter plusieurs lettres", function () {
      expect(decode([3, 0, 1, 6], 'b')).to.eql('abcd');
    });
  });

  describe('#afficheliste()', function () {
    it("affiche la liste des joueurs qui ont une partie en cours", function () {
      var joueurAvecPartie = newJoueur();
      joueurAvecPartie.partie = newPartie('mode_plus');
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'joueurAvecPartie': joueurAvecPartie,
      };
      expect(afficheliste(joueurs)).to.eql([
        '1 partie est en cours:', 
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
    
    it("affiche si aucune partie en cours", function () {
      var joueurs = {}
      expect(afficheliste(joueurs)).to.eql(["Aucune partie n'est en cours"]);
    });

    it("affiche la liste des joueurs qui ont une partie en cours", function () {
      var joueurAvecPartie = newJoueur();
      joueurAvecPartie.partie = newPartie('mode_plus');
      var joueurs = {
        'joueurAvecPartie2': joueurAvecPartie,
        'joueurAvecPartie': joueurAvecPartie,
      };
      expect(afficheliste(joueurs)).to.eql([
        '2 parties sont en cours:', 
        '`joueurAvecPartie2` - 0 point, Mode Addition',
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
  });

});