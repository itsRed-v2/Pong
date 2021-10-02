import chai from 'chai';
const expect = chai.expect;
import Joueur from '../../src/joueur.mjs';
import {
	printHighscores,
	trieHighscores
} from '../../commands/highscores.mjs'

describe('/highscores', function () {
	
	describe('#trieHighscores()', function () {
		it("trie les highscores d'un mode", function () {
			let highscores = {
				'id1': 10,
				'id2': 34,
				'id3': 83,
				'id4': 20,
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
		const joueurs = {
			'id1': new Joueur('name1', '0001'),
			'id2': new Joueur('name2', '0002'),
			'id3': new Joueur('name3', '0003'),
			'id4': new Joueur('name4', '0004'),
		}
		it("affiche le scoreboard", function () {
			const allhighscores = {
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
		expect(printHighscores(allhighscores, joueurs, false)).to.eql(
`**Mode Addition**
\`1) 155 : name1\`
\`2) 120 : name2\`
\`3) 83 : name3\`
**Mode Soustraction**
\`1) 50 : name1\`
\`2) 27 : name2\`
`);
		});
		it("affiche le scoreboard en mode info", function () {
			const allhighscores = {
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
			expect(printHighscores(allhighscores, joueurs, true)).to.eql(
`**Mode Addition**
\`1) 155 : name1#0001\`    \`id1\`
\`2) 120 : name2#0002\`    \`id2\`
\`3) 83 : name3#0003\`    \`id3\`
**Mode Soustraction**
\`1) 50 : name1#0001\`    \`id1\`
\`2) 27 : name2#0002\`    \`id2\`
`);
		});
	});
});