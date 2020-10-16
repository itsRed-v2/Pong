var expect = require('chai').expect;
var { newJoueur } = require('../src/joueur')
var { newPartie } = require('../src/partie')
var {
  code,
  decode,
  afficheliste,
  matchTp,
  changeScore,
  matchHs,
  matchRmHs,
  changeHs,
  ajouteHs,
  removeHs,
  listeJoueursActifs
} = require('../src/pong')

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
    it("affiche une liste de 1 joueur", function () {
      var liste = ['`joueurAvecPartie` - 0 point, Mode Addition'];
      expect(afficheliste(liste)).to.eql([
        '1 partie est en cours:', 
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
    
    it("affiche si aucune partie en cours", function () {
      expect(afficheliste([])).to.eql(["Aucune partie n'est en cours"]);
    });

    it("affiche plusieurs parties en cours", function () {
      var liste = [
        '`joueurAvecPartie2` - 0 point, Mode Addition',
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ];
      expect(afficheliste(liste)).to.eql([
        '2 parties sont en cours:', 
        '`joueurAvecPartie2` - 0 point, Mode Addition',
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
  });

  describe('#listeJoueursActifs()', function () {
    it("liste les joueurs qui ont une partie en cours", function () {
      var joueurAvecPartie = newJoueur();
      joueurAvecPartie.partie = newPartie('mode_plus');
      var joueurs = {
        'id1': newJoueur(),
        'id2': joueurAvecPartie,
      };
      expect(listeJoueursActifs(joueurs, (id)=> {
        expect(id).to.eql('id2')
        return 'joueurAvecPartie'
      })).to.eql([
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
    
    it("affiche si aucune partie en cours", function () {
      expect(listeJoueursActifs({})).to.eql([]);
    });

    it("affiche la liste de plusieurs joueurs qui ont une partie en cours", function () {
      var joueurAvecPartie = newJoueur();
      joueurAvecPartie.partie = newPartie('mode_plus');
      var joueurs = {
        'id1': joueurAvecPartie,
        'id2': joueurAvecPartie
      };
      const noms = {
        'id1': 'joueurAvecPartie2',
        'id2': 'joueurAvecPartie'
      }
      expect(listeJoueursActifs(joueurs, (id)=> {
        return noms[id]
      })).to.eql([
        '`joueurAvecPartie2` - 0 point, Mode Addition',
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
  });

  describe('#matchTp()', function () {
    it("extraire informations", function () {
      expect(matchTp('ping tp Nokari 56')).to.eql(['ping tp Nokari 56','Nokari','56']);
    });
    it("renvoie null si matche pas", function () {
      expect(matchTp('ping tp Nokari d56')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchTp('PinG tp Nokari 56')).not.to.eql(null);
    });
  });

  describe('#changeScore()', function () {
    it("change le score d'un joueur si présent dans la liste", function () {
      var Nokari = newJoueur();
      Nokari.partie = newPartie('mode_plus');
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'Nokari': Nokari,
      };
      expect(changeScore('Nokari',56,joueurs)).to.eql(true);
    });
    it("message erreur si aucun joueur correspond", function () {
      var Joueur1 = newJoueur();
      Joueur1.partie = newPartie('mode_plus');
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'Joueur1': Joueur1,
      };
      expect(changeScore('Nokari',56,joueurs)).to.eql(false);
    });
  });

  describe('#matchHs()', function () {
    it("extraire informations", function () {
      expect(matchHs('ping seths Nokari 56 plus')).to.eql(['ping seths Nokari 56 plus','seths','Nokari','56','plus']);
    });
    it("renvoie null si matche pas", function () {
      expect(matchHs('ping seths Nokari d56 plus')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchHs('PinG seths Nokari 56 plUs')).not.to.eql(null);
    });
  });

  describe('#matchRmHs()', function () {
    it("extraire informations", function () {
      expect(matchRmHs('ping rmhs Nokari plus')).to.eql(['ping rmhs Nokari plus','Nokari','plus']);
    });
    it("renvoie null si matche pas", function () {
      expect(matchRmHs('ping rmhs Nokari eplus')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchRmHs('PinG rMHs Nokari plUs')).not.to.eql(null);
    });
  });

  describe('#changeHs()', function () {
    it("change le score d'un joueur si présent dans la liste", function () {
      allHighscores = {
        mode_plus: {
        'itsRed_v2' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(changeHs('itsRed_v2',20,'plus',allHighscores)).to.eql(true);
    });
    it("message erreur si aucun joueur correspond", function () {
      allHighscores = {
        mode_plus: {
        'itsRed_v2' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(changeHs('Nokari',20,'plus',allHighscores)).to.eql(false);
    });
    it("message erreur si aucun joueur correspond dans le mode séléctionné", function () {
      allHighscores = {
        mode_plus: {
        'itsRed_v2' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(changeHs('itsRed_v2',20,'moins',allHighscores)).to.eql(false);
    });
  });

  describe('#ajouteHs()', function () {
    it("ajoute un joueur à la liste si il n'y est pas", function () {
      allHighscores = {
        mode_plus: {
        '364820614990528522' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(ajouteHs('384139959059087362',20,'plus',allHighscores)).to.eql(true);
    });
    it("message erreur si le joueur est déja dans la liste", function () {
      allHighscores = {
        mode_plus: {
        '364820614990528522' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(ajouteHs('364820614990528522',20,'plus',allHighscores)).to.eql(false);
    });
  });

  describe('#removeHs()', function () {
    it("supprime un joueur de la liste si il y est", function () {
      allHighscores = {
        mode_plus: {
        '364820614990528522' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(removeHs('364820614990528522','plus',allHighscores)).to.eql(true);
    });
    it("message erreur si le joueur n'est pas dans la liste", function () {
      allHighscores = {
        mode_plus: {
        '364820614990528522' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(removeHs('384139959059087362','plus',allHighscores)).to.eql(false);
    });
  });

});