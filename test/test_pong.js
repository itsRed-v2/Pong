var expect = require('chai').expect;
var {
  newJoueur,
  findOrCreateJoueur
} = require('../src/joueur')
var {
  newPartie,
  demarrerPartie,
  reponse,
  score,
  question,
  tireAuSortDeuxNombres
} = require('../src/partie')
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
  listeJoueursActifs,
  matchPing,
  msgReload,
  trieHighscores,
  stringifyForExport,
  printHighscores
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
      }, false)).to.eql([
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });
    
    it("affiche si aucune partie en cours", function () {
      var joueurs = {
        'id1': newJoueur(),
        'id2': newJoueur(),
      };
      expect(listeJoueursActifs(joueurs, () => {}, false)).to.eql([]);
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
      }, false)).to.eql([
        '`joueurAvecPartie2` - 0 point, Mode Addition',
        '`joueurAvecPartie` - 0 point, Mode Addition'
      ]);
    });

    it("affiche la liste en mode info", function () {
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
      const discrims = {
        'id1': '1234',
        'id2': '5678'
      }
      expect(listeJoueursActifs(joueurs, (id)=> {
        return noms[id]
      }, true, (id)=> {
        return discrims[id]
      })).to.eql([
        '`joueurAvecPartie2#1234` `id1` - 0 point, Mode Addition',
        '`joueurAvecPartie#5678` `id2` - 0 point, Mode Addition'
      ]);
    });
  });

  describe('#matchTp()', function () {
    it("extraire informations", function () {
      expect(matchTp('tp Nokari 56')).to.eql([
        'tp Nokari 56',
        'Nokari',
        '56'
      ]);
    });
    it("renvoie null si matche pas", function () {
      expect(matchTp('tp Nokari d56')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchTp('tp Nokari 56')).not.to.eql(null);
    });
  });

  describe('#changeScore()', function () {
    it("retourne l'ancien score si joueur dans la liste avec une partie", function () {
      var Nokari = newJoueur();
      Nokari.partie = newPartie('mode_plus');
      Nokari.partie.points = 5
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'Nokari': Nokari,
      };
      expect(changeScore('Nokari',56,joueurs)).to.eql(5);
    });
    it("retourne false si joueur dans la liste mais sans partie", function () {
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'Nokari': newJoueur(),
      };
      expect(changeScore('Nokari',56,joueurs)).to.eql(false);
    });
    it("retourne false si aucun joueur correspond", function () {
      var Joueur1 = newJoueur();
      Joueur1.partie = newPartie('mode_plus');
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'Joueur1': Joueur1,
      };
      expect(changeScore('Nokari',56,joueurs)).to.eql(false);
    });
    it("change le score si joueur dans la liste avec une partie", function () {
      var Nokari = newJoueur();
      Nokari.partie = newPartie('mode_plus');
      var joueurs = {
        'joueurSansPartie': newJoueur(),
        'Nokari': Nokari,
      };
      changeScore('Nokari',56,joueurs)
      expect(joueurs['Nokari'].partie.points).to.eql(56);
    });
  });

  describe('#matchHs()', function () {
    it("extraire informations", function () {
      expect(matchHs('seths Nokari 56 plus')).to.eql([
        'seths Nokari 56 plus',
        'seths',
        'Nokari',
        '56',
        'plus'
      ]);
    });
    it("renvoie null si matche pas", function () {
      expect(matchHs('seths Nokari d56 plus')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchHs('seths Nokari 56 plUs')).not.to.eql(null);
    });
  });

  describe('#matchRmHs()', function () {
    it("extraire informations", function () {
      expect(matchRmHs('rmhs Nokari plus')).to.eql([
        'rmhs Nokari plus',
        'Nokari',
        'plus'
      ]);
    });
    it("renvoie null si matche pas", function () {
      expect(matchRmHs('rmhs Nokari eplus')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchRmHs('rMHs Nokari plUs')).not.to.eql(null);
    });
  });

  describe('#changeHs()', function () {
    it("retourne true si score changé", function () {
      allHighscores = {
        mode_plus: {
        'itsRed_v2' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(changeHs('itsRed_v2','20','plus',allHighscores)).to.eql(true);
    });
    it("message erreur si aucun joueur correspond", function () {
      allHighscores = {
        mode_plus: {
        'itsRed_v2' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(changeHs('Nokari','20','plus',allHighscores)).to.eql(false);
    });
    it("message erreur si aucun joueur correspond dans le mode séléctionné", function () {
      allHighscores = {
        mode_plus: {
        'itsRed_v2' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(changeHs('itsRed_v2','20','moins',allHighscores)).to.eql(false);
    });
    it("change le score d'un joueur si présent dans la liste", function () {
      allHighscores = {
        "mode_plus": {
          'itsRed_v2' : 10,
        },
        "mode_moins": {},
        "mode_double": {},
      }
      changeHs('itsRed_v2','20','plus',allHighscores)
      expect(allHighscores).to.eql({
        mode_plus: {
        'itsRed_v2' : 20,
        },
        mode_moins: {},
        mode_double: {},
      });
    });
  });

  describe('#ajouteHs()', function () {
    it("ajoute un joueur à la liste si il n'y est pas", function () {
      allHighscores = {
        mode_plus: {
        'id1' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      ajouteHs('id2','20','plus',allHighscores)
      expect(allHighscores).to.eql({
        mode_plus: {
        'id1' : 10,
        'id2' : 20,
        },
        mode_moins: {},
        mode_double: {},
      });
    });
    it("retourne true si le joueur est ajouté", function () {
      allHighscores = {
        mode_plus: {
        'id1' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(ajouteHs('id2','20','plus',allHighscores)).to.eql(true);
    });
    it("message erreur si le joueur est déja dans la liste", function () {
      allHighscores = {
        mode_plus: {
        'id1' : 10,
        },
        mode_moins: {},
        mode_double: {},
      }
      expect(ajouteHs('id1','20','plus',allHighscores)).to.eql(false);
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

  describe('#matchPing()', function () {
    it("extraire les arguments", function () {
      expect(matchPing('ping <argument> <avec des espaces>'))
      .to.eql('<argument> <avec des espaces>');
    });

    it("extraire les arguments plus les autres lignes", function () {
      expect(matchPing(`ping code cle
message
ligne2 du message`))
      .to.eql('code cle\nmessage\nligne2 du message');
    });

    it("renvoie null si matche pas", function () {
      expect(matchPing('hey salut')).to.eql(null);
    });
    it("fonctionne avec des maj", function () {
      expect(matchPing('PinG <argument> <avec des espaces>'))
      .to.eql('<argument> <avec des espaces>');
    });
    it("fonctionne avec que ping", function () {
      expect(matchPing('ping')).to.eql('');
    });
    it("fonctionne avec le prefix p", function () {
      expect(matchPing('p <argument> <avec des espaces>'))
      .to.eql('<argument> <avec des espaces>');
    });
  });

  describe('#msgReload()', function () {
    it("liste les joueurs qui ont une partie en cours", function () {
      var joueurAvecPartie = newJoueur();
      joueurAvecPartie.partie = newPartie('mode_plus');
      var joueurs = {
        'id1': newJoueur(),
        'id2': joueurAvecPartie,
      };
      expect(msgReload(joueurs, (id)=> {
        expect(id).to.eql('id2')
        return 'joueurAvecPartie'
      })).to.eql([
        ':repeat: Reloading',
        ':small_orange_diamond: La partie de `joueurAvecPartie` (0 point, Mode Addition) a été stoppée par le reload'
      ]);
    });
    it("affiche si aucune partie en cours", function () {
      expect(msgReload({})).to.eql([':repeat: Reloading']);
    });
    it("liste plusieurs joueurs qui ont une partie en cours", function () {
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
      expect(msgReload(joueurs, (id)=> {
        return noms[id]
      })).to.eql([
        ':repeat: Reloading',
        ':small_orange_diamond: La partie de `joueurAvecPartie2` (0 point, Mode Addition) a été stoppée par le reload',
        ':small_orange_diamond: La partie de `joueurAvecPartie` (0 point, Mode Addition) a été stoppée par le reload'
      ]);
    });
  });

  describe('#trieHighscores()', function () {
    it("trie les highscores d'un mode", function () {
      var highscores = {
        'id1' : 10,
        'id2' : 34,
        'id3' : 83,
        'id4' : 20,
        }
      expect(trieHighscores(highscores)).to.eql([
        ['id3', 83],
        ['id2', 34],
        ['id4', 20],
        ['id1', 10]
      ]);
    });
  });

  describe('#stringifyForExport()', function () {
    it("convertis objet en string JSON", function () {
      var allhighscores = {
        mode_1: {
        'id1' : 155,
        'id2' : 120,
        'id3' : 83,
        },
        mode_2: {
        'id1' : 50,
        'id2' : 27,
        },
        }
      expect(stringifyForExport(allhighscores)).to.eql(`module.exports = {
  "mode_1": {
    "id1": 155,
    "id2": 120,
    "id3": 83
  },
  "mode_2": {
    "id1": 50,
    "id2": 27
  }
};`);
    });
  });

  describe('#trieHighscores()', function () {
    it("trie les highscores d'un mode", function () {
      var highscores = {
        'id1' : 10,
        'id2' : 34,
        'id3' : 83,
        'id4' : 20,
        }
      expect(trieHighscores(highscores)).to.eql([
        ['id3', 83],
        ['id2', 34],
        ['id4', 20],
        ['id1', 10]
      ]);
    });
  });

  describe('#printHighscores()', function () {
    it("affiche le scoreboard", function () {
      var allhighscores = {
        mode_plus: {
        'id1' : 155,
        'id2' : 120,
        'id3' : 83,
        },
        mode_moins: {
        'id1' : 50,
        'id2' : 27,
        },
        }
      expect(printHighscores(allhighscores, false, (id) => {return 'name_'+id}, () => {} )).to.eql(`**Mode Addition**
\`1) 155 : name_id1\`
\`2) 120 : name_id2\`
\`3) 83 : name_id3\`
**Mode Soustraction**
\`1) 50 : name_id1\`
\`2) 27 : name_id2\`
`);
    });
    it("affiche le scoreboard en mode info", function () {
      var allhighscores = {
        mode_plus: {
        'id1' : 155,
        'id2' : 120,
        'id3' : 83,
        },
        mode_moins: {
        'id1' : 50,
        'id2' : 27,
        },
        }
      expect(printHighscores(allhighscores, true, (id) => {return 'name_'+id}, (id) => {return id+'000'} )).to.eql(`**Mode Addition**
\`1) 155 : name_id1#id1000\`  \`id1\`
\`2) 120 : name_id2#id2000\`  \`id2\`
\`3) 83 : name_id3#id3000\`  \`id3\`
**Mode Soustraction**
\`1) 50 : name_id1#id1000\`  \`id1\`
\`2) 27 : name_id2#id2000\`  \`id2\`
`);
    });
  });

  describe('#findOrCreateJoueur()', function () {
    it("ajoute le joueur si il est inconnu", function () {
      var joueurs = {
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        }
      }
      findOrCreateJoueur('id2', 'name2', '2222', joueurs, (pseudo, discriminator) => {
        return {
          "mode": "mode_plus",
          "pseudo": pseudo,
          "discriminator": discriminator
      }})
      expect(joueurs).to.eql({
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        },
        "id2": {
          "mode": "mode_plus",
          "pseudo": "name2",
          "discriminator": "2222"
        }
      });
    });
    it("modifie le nom du joueur s'il ne correspond plus", function () {
      var joueurs = {
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        }
      }
      findOrCreateJoueur('id1', 'name1_v2', '1111', joueurs, (pseudo, discriminator) => {
        return {
          "mode": "mode_plus",
          "pseudo": pseudo,
          "discriminator": discriminator
      }})
      expect(joueurs).to.eql({
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1_v2",
          "discriminator": "1111"
        }
      });
    });
    it("modifie le tag du joueur s'il ne correspond plus", function () {
      var joueurs = {
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        }
      }
      findOrCreateJoueur('id1', 'name1', '1122', joueurs, (pseudo, discriminator) => {
        return {
          "mode": "mode_plus",
          "pseudo": pseudo,
          "discriminator": discriminator
      }})
      expect(joueurs).to.eql({
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1122"
        }
      });
    });
    it("renvoie false si aucune modification n'a eu lieu", function () {
      var joueurs = {
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        }
      }
      expect(findOrCreateJoueur('id1', 'name1', '1111', joueurs, (pseudo, discriminator) => {
        return {
          "mode": "mode_plus",
          "pseudo": pseudo,
          "discriminator": discriminator
        }
      })).to.eql(false);
    });
    it("renvoie true si une modification a eu lieu", function () {
      var joueurs = {
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        }
      }
      expect(findOrCreateJoueur('id1', 'name1_v2', '1111', joueurs, (pseudo, discriminator) => {
        return {
          "mode": "mode_plus",
          "pseudo": pseudo,
          "discriminator": discriminator
        }
      })).to.eql(true);
    });
    it("renvoie true si un joueur a été ajouté", function () {
      var joueurs = {
        "id1": {
          "mode": "mode_plus",
          "pseudo": "name1",
          "discriminator": "1111"
        }
      }
      expect(findOrCreateJoueur('id2', 'name2', '2222', joueurs, (pseudo, discriminator) => {
        return {
          "mode": "mode_plus",
          "pseudo": pseudo,
          "discriminator": discriminator
        }
      })).to.eql(true);
    });
  });

  // describe('#demarrerPartie()', function () {
  //   it("démarre une partie la renvoie", function () {
  //     var joueur = {
  //       "364820614990528522": {
  //         "mode": "mode_plus",
  //         "pseudo": "itsRed_v2",
  //         "discriminator": "3793"
  //       }
  //     }
  //     expect(demarrerPartie({}, joueur, (mode) => {
  //       return {
  //         "points": 0,
  //         "mode": mode,
  //         "N1": 4,
  //         "N2": 7,
  //         "operation": "+"
  //       }
  //     })).to.eql();
  //   });
  // });

  describe('#reponse()', function () {
    it("renvoie la réponse de la partie (opération: +)", function () {
      var partie ={ 
        "points": 0,
        "mode": "mode_plus",
        "N1": 2,
        "N2": 9,
        "operation": "+"
      }
      expect(reponse(partie)).to.eql(11);
    });
    it("renvoie la réponse de la partie (opération: -)", function () {
      var partie ={ 
        "points": 0,
        "mode": "mode_plus",
        "N1": 2,
        "N2": 9,
        "operation": "-"
      }
      expect(reponse(partie)).to.eql(-7);
    });
  });

  describe('#score()', function () {
    it("renvoie le score avec 'point' au singulier", function () {
      var partie ={ 
        "points": 1,
        "mode": "mode_plus",
        "N1": 2,
        "N2": 9,
        "operation": "+"
      }
      expect(score(partie)).to.eql('1 point');
    });
    it("renvoie le score avec 'points' au pluriel", function () {
      var partie ={ 
        "points": 5,
        "mode": "mode_plus",
        "N1": 2,
        "N2": 9,
        "operation": "+"
      }
      expect(score(partie)).to.eql('5 points');
    });
  });

  describe('#question()', function () {
    it("renvoie la question en cours", function () {
      var partie ={ 
        "points": 1,
        "mode": "mode_plus",
        "N1": 2,
        "N2": 9,
        "operation": "+"
      }
      expect(question(partie)).to.eql('2+9');
    });
  });

  describe('#tireAuSortDeuxNombres()', function () {
    it("choisit la bonne opération (mode_plus)", function () {
      var partie ={ 
        "points": 1,
        "mode": "mode_plus",
        "N1": 2,
        "N2": 9,
        "operation": "+"
      }
      tireAuSortDeuxNombres(partie)
      expect(partie.operation).to.eql('+');
    });
    it("choisit la bonne opération (mode_moins)", function () {
      var partie ={ 
        "points": 1,
        "mode": "mode_moins",
        "N1": 2,
        "N2": 9,
        "operation": "+"
      }
      tireAuSortDeuxNombres(partie)
      expect(partie.operation).to.eql('-');
    });
  });

});