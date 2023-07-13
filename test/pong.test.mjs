import chai from 'chai';
const expect = chai.expect;
import Partie from '../src/partie.mjs';
import Joueur from '../src/joueur.mjs';
import {
	matchTp,
	changeScore,
	matchHs,
	matchRmHs,
	matchPing,
	listeJoueurs,
	isInteger,
	isPositiveInteger,
	createJoueurIfNeeded,
	printMode,
} from '../src/pong.mjs';
import {
	changeHs,
	ajouteHs,
	removeHs,
} from '../src/highscore.mjs';

describe('Pong', function() {

	describe('#changeScore()', function() {
		it("retourne l'ancien score si joueur dans la liste avec une partie", function() {
			const Nokari = new Joueur('Nokari', '0450');
			Nokari.partie = new Partie('mode_plus');
			Nokari.partie.points = 5;
			const joueurs = {
				'joueurSansPartie': new Joueur('J1', '0001'),
				'Nokari': Nokari,
			};
			expect(changeScore('Nokari', 56, joueurs)).to.eql(5);
		});
		it('retourne false si joueur dans la liste mais sans partie', function() {
			const joueurs = {
				'joueurSansPartie': new Joueur('J1', '0001'),
				'Nokari': new Joueur('Nokari', '0450'),
			};
			expect(changeScore('Nokari', 56, joueurs)).to.eql(false);
		});
		it('retourne false si aucun joueur correspond', function() {
			const Joueur1 = new Joueur('J1', '0001');
			Joueur1.partie = new Partie('mode_plus');
			const joueurs = {
				'joueurSansPartie': new Joueur('J2', '0002'),
				'Joueur1': Joueur1,
			};
			expect(changeScore('Nokari', 56, joueurs)).to.eql(false);
		});
		it('change le score si joueur dans la liste avec une partie', function() {
			const Nokari = new Joueur('Nokari', '0450');
			Nokari.partie = new Partie('mode_plus');
			const joueurs = {
				'joueurSansPartie': new Joueur('J1', '0001'),
				'Nokari': Nokari,
			};
			changeScore('Nokari', 56, joueurs);
			expect(joueurs['Nokari'].partie.points).to.eql(56);
		});
	});

	describe('#matchTp()', function() {
		it('renvoie true si la syntaxe est correcte', function() {
			expect(matchTp(['tp', 'id1', '56'])).to.eql(true);
		});
		it('renvoie false si la syntaxe est incorrecte', function() {
			expect(matchTp(['tp', 'id1', 'd56'])).to.eql(false);
			expect(matchTp(['tp', 'id1', '-56'])).to.eql(false);
			expect(matchTp(['truc', 'id1', '56'])).to.eql(false);
		});
		it('renvoie false si la syntaxe est incomplète', function() {
			expect(matchTp(['tp', 'id1'])).to.eql(false);
		});
	});

	describe('#matchHs()', function() {
		it('renvoie true si la syntaxe est correcte', function() {
			expect(matchHs(['seths', 'Nokari', '56', 'plus'])).to.eql(true);
			expect(matchHs(['seths', 'Nokari', '56', 'moins'])).to.eql(true);
			expect(matchHs(['addhs', 'Nokari', '56', 'plus'])).to.eql(true);
		});
		it('renvoie false la syntaxe est incorrecte', function() {
			expect(matchHs(['seths', 'Nokari', 'd56', 'plus'])).to.eql(false);
			expect(matchHs(['seths', 'Nokari', '56', 'pldes'])).to.eql(false);
			expect(matchHs(['addss', 'Nokari', '56', 'plus'])).to.eql(false);
		});
		it('renvoie false la syntaxe est incomplète', function() {
			expect(matchHs(['seths', 'Nokari', '56'])).to.eql(false);
		});
	});

	describe('#matchRmHs()', function() {
		it('renvoie true si la syntaxe est correcte', function() {
			expect(matchRmHs(['rmhs', 'Nokari', 'plus'])).to.eql(true);
		});
		it('renvoie false la syntaxe est incorrecte', function() {
			expect(matchRmHs(['rmhs', 'Nokari', 'dlus'])).to.eql(false);
			expect(matchRmHs(['rdhs', 'Nokari', 'plus'])).to.eql(false);
		});
		it('renvoie false la syntaxe est incomplète', function() {
			expect(matchHs(['rmhs', 'Nokari'])).to.eql(false);
		});
	});

	describe('#changeHs()', function() {
		it('retourne true si score changé', function() {
			const allHighscores = {
				mode_plus: {
					'itsRed_v2' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(changeHs('itsRed_v2', '20', 'plus', allHighscores)).to.eql(true);
		});
		it('message erreur si aucun joueur correspond', function() {
			const allHighscores = {
				mode_plus: {
					'itsRed_v2' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(changeHs('Nokari', '20', 'plus', allHighscores)).to.eql(false);
		});
		it('message erreur si aucun joueur correspond dans le mode séléctionné', function() {
			const allHighscores = {
				mode_plus: {
					'itsRed_v2' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(changeHs('itsRed_v2', '20', 'moins', allHighscores)).to.eql(false);
		});
		it("change le score d'un joueur si présent dans la liste", function() {
			const allHighscores = {
				'mode_plus': {
					'itsRed_v2' : 10,
				},
				'mode_moins': {},
				'mode_double': {},
			};
			changeHs('itsRed_v2', '20', 'plus', allHighscores);
			expect(allHighscores).to.eql({
				mode_plus: {
					'itsRed_v2' : 20,
				},
				mode_moins: {},
				mode_double: {},
			});
		});
	});

	describe('#ajouteHs()', function() {
		it("ajoute un joueur à la liste si il n'y est pas", function() {
			const allHighscores = {
				mode_plus: {
					'id1' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			ajouteHs('id2', '20', 'plus', allHighscores);
			expect(allHighscores).to.eql({
				mode_plus: {
					'id1' : 10,
					'id2' : 20,
				},
				mode_moins: {},
				mode_double: {},
			});
		});
		it('retourne true si le joueur est ajouté', function() {
			const allHighscores = {
				mode_plus: {
					'id1' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(ajouteHs('id2', '20', 'plus', allHighscores)).to.eql(true);
		});
		it('message erreur si le joueur est déja dans la liste', function() {
			const allHighscores = {
				mode_plus: {
					'id1' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(ajouteHs('id1', '20', 'plus', allHighscores)).to.eql(false);
		});
	});

	describe('#removeHs()', function() {
		it('supprime un joueur de la liste si il y est', function() {
			const allHighscores = {
				mode_plus: {
					'364820614990528522' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(removeHs('364820614990528522', 'mode_plus', allHighscores)).to.eql(true);
		});
		it("message erreur si le joueur n'est pas dans la liste", function() {
			const allHighscores = {
				mode_plus: {
					'364820614990528522' : 10,
				},
				mode_moins: {},
				mode_double: {},
			};
			expect(removeHs('384139959059087362', 'mode_plus', allHighscores)).to.eql(false);
		});
	});

	describe('#matchPing()', function() {
		it('extraire les arguments', function() {
			expect(matchPing('ping arg1 arg2 arg3'))
				.to.eql(['arg1', 'arg2', 'arg3']);
		});
		it('ne prend en compte que la première ligne', function() {
			expect(matchPing(`ping code cle
2e ligne`))
				.to.eql(['code', 'cle']);
		});
		it('renvoie null si matche pas', function() {
			expect(matchPing('hey salut')).to.eql(null);
		});
		it('fonctionne avec que ping', function() {
			expect(matchPing('ping')).to.eql([]);
		});
		it('fonctionne avec le prefix p', function() {
			expect(matchPing('p arg1 arg2 arg3'))
				.to.eql(['arg1', 'arg2', 'arg3']);
		});
	});

	describe('#createJoueurIfNeeded()', function() {
		it("ajoute le joueur si il n'est pas enregistré", function() {
			const joueurs = {
				'id1': {
					'mode': 'mode_plus',
					'pseudo': 'name1',
					'discriminator': '1111',
				},
			};
			createJoueurIfNeeded('id2', 'name2', '2222', joueurs);
			expect(joueurs).to.eql({
				'id1': {
					'mode': 'mode_plus',
					'pseudo': 'name1',
					'discriminator': '1111',
				},
				'id2': {
					'mode': 'mode_plus',
					'pseudo': 'name2',
					'discriminator': '2222',
				},
			});
		});
		it("renvoie false si aucune modification n'a eu lieu", function() {
			const joueurs = {
				'id1': {
					'mode': 'mode_plus',
					'pseudo': 'name1',
					'discriminator': '1111',
				},
			};
			expect(createJoueurIfNeeded('id1', 'name1', '1111', joueurs))
				.to.eql(false);
		});
		it('renvoie true si un joueur a été ajouté', function() {
			const joueurs = {
				'id1': {
					'mode': 'mode_plus',
					'pseudo': 'name1',
					'discriminator': '1111',
				},
			};
			expect(createJoueurIfNeeded('id2', 'name2', '2222', joueurs))
				.to.eql(true);
		});
	});

	describe('#listeJoueurs()', function() {
		it('liste les joueurs', function() {
			const joueurs = {
				'id1': {
					'mode': 'mode_plus',
					'pseudo': 'name1',
					'discriminator': '1111',
				},
				'id2': {
					'mode': 'mode_plus',
					'pseudo': 'name2',
					'discriminator': '2222',
				},
			};
			expect(listeJoueurs(joueurs)).to.eql(
				`**Liste des joueurs enregistrés:**
name1
name2`
			);
		});
		it('affiche si un joueur a une partie en cours', function() {
			const joueurs = {
				'id1': {
					'mode': 'mode_plus',
					'pseudo': 'name1',
					'discriminator': '1111',
					'partie': {
						'points': 1,
						'mode': 'mode_plus',
					},
				},
				'id2': {
					'mode': 'mode_plus',
					'pseudo': 'name2',
					'discriminator': '2222',
				},
			};
			expect(listeJoueurs(joueurs)).to.eql(
				`**Liste des joueurs enregistrés:**
name1
> partie en cours
name2`
			);
		});
	});

	describe('#isInteger()', function() {
		it('renvoie le nombre correspondant au string', function() {
			expect(isInteger('463')).to.eql(463);
			expect(isInteger('-23')).to.eql(-23);
		});
		it("renvoie false si le string n'est pas un nombre", function() {
			expect(isInteger('542d')).to.eql(false);
			expect(isInteger('h234')).to.eql(false);
			expect(isInteger('-')).to.eql(false);
		});
		it('renvoie false si le string est un nombre décimal', function() {
			expect(isInteger('12.5')).to.eql(false);
		});
		it("renvoie false si l'objet n'est pas un string", function() {
			expect(isInteger(4)).to.eql(false);
			expect(isInteger(['lol', 'truc'])).to.eql(false);
		});
	});

	describe('#isPositiveInteger()', function() {
		it('renvoie le nombre correspondant au string', function() {
			expect(isPositiveInteger('463')).to.eql(463);
		});
		it("renvoie false si le string n'est pas un nombre", function() {
			expect(isPositiveInteger('542d')).to.eql(false);
			expect(isPositiveInteger('h234')).to.eql(false);
			expect(isPositiveInteger('-')).to.eql(false);
		});
		it('renvoie false si le string est un nombre négatif', function() {
			expect(isPositiveInteger('-23')).to.eql(false);
		});
		it('renvoie false si le string est un nombre décimal', function() {
			expect(isPositiveInteger('12.5')).to.eql(false);
		});
		it("renvoie false si l'objet n'est pas un string", function() {
			expect(isPositiveInteger(4)).to.eql(false);
			expect(isPositiveInteger(['lol', 'truc'])).to.eql(false);
		});
	});

	describe('#printMode()', function() {
		it('renvoie le string correspondant au mode', function() {
			expect(printMode('mode_plus')).to.eql('Mode Addition');
			expect(printMode('mode_moins')).to.eql('Mode Soustraction');
			expect(printMode('mode_double')).to.eql('Mode Double');
		});
	});
});