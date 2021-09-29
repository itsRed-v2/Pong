import chai from 'chai';
const expect = chai.expect;
import Partie from '../../src/partie.mjs';
import Joueur from '../../src/joueur.mjs';
import {
	listeJoueursActifs,
    afficheliste
} from '../../commands/list.mjs'

describe('Command_list', function () {

	describe('#afficheliste()', function () {
		it("affiche une liste de 1 joueur", function () {
		  var liste = ['`joueurAvecPartie` - 0 point, Mode Addition'];
		  expect(afficheliste(liste)).to.eql(
`1 partie est en cours:
\`joueurAvecPartie\` - 0 point, Mode Addition`);
		});
		
		it("affiche si aucune partie en cours", function () {
		  expect(afficheliste([])).to.eql("Aucune partie n'est en cours");
		});
	
		it("affiche plusieurs parties en cours", function () {
		  var liste = [
			'`joueurAvecPartie2` - 0 point, Mode Addition',
			'`joueurAvecPartie` - 0 point, Mode Addition'
		  ];
		  expect(afficheliste(liste)).to.eql(
`2 parties sont en cours:
\`joueurAvecPartie2\` - 0 point, Mode Addition
\`joueurAvecPartie\` - 0 point, Mode Addition`
		  );
		});
	  });
	
	  describe('#listeJoueursActifs()', function () {
		it("liste les joueurs qui ont une partie en cours", function () {
		  var joueurs = {
			'id1': new Joueur('name1', '1111'),
			'id2': new Joueur('name2', '2222')
		  };
		  joueurs['id2'].partie = new Partie('mode_plus');
		  joueurs['id2'].partie.points = 1;
		  expect(listeJoueursActifs(joueurs, false)).to.eql([
			'`name2` - 1 point, Mode Addition'
		  ]);
		});
		
		it("affiche si aucune partie en cours", function () {
		  var joueurs = {
			'id1': new Joueur('name1', '1111'),
			'id2': new Joueur('name2', '2222')
		  };
		  expect(listeJoueursActifs(joueurs, false)).to.eql([]);
		});
	
		it("affiche la liste de plusieurs joueurs qui ont une partie en cours", function () {
		  var joueurs = {
			'id1': new Joueur('name1', '1111'),
			'id2': new Joueur('name2', '2222')
		  };
		  joueurs['id1'].partie = new Partie('mode_moins');
		  joueurs['id1'].partie.points = 3;
		  joueurs['id2'].partie = new Partie('mode_plus');
		  joueurs['id2'].partie.points = 1;
		  expect(listeJoueursActifs(joueurs, false)).to.eql([
			'`name1` - 3 points, Mode Soustraction',
			'`name2` - 1 point, Mode Addition'
		  ]);
		});
	
		it("affiche la liste en mode info", function () {
		  var joueurs = {
			'id1': new Joueur('name1', '1111'),
			'id2': new Joueur('name2', '2222')
		  };
		  joueurs['id1'].partie = new Partie('mode_plus');
		  joueurs['id2'].partie = new Partie('mode_plus');
		  expect(listeJoueursActifs(joueurs, true)).to.eql([
			'`name1#1111` `id1` - 0 point, Mode Addition',
			'`name2#2222` `id2` - 0 point, Mode Addition'
		  ]);
		});
	  });
})