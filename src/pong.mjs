import Joueur from './joueur.mjs';
import DiscordLogger from './discordLogger.mjs';
import { saveJoueurs } from './file-tools.mjs';

const MODES_SUFFIXES = new Set([
	'plus',
	'moins',
	'double',
]);

function changeScore(id, score, joueurs) {
	if (joueurs[id] && joueurs[id].partie) {
		const oldpts = joueurs[id].partie.points;
		joueurs[id].partie.points = score;
		return oldpts;
	}
	else {
		return false;
	}
}

function matchTp(args) {
	if (args[0] !== 'tp') return false;
	if (!isPositiveInteger(args[2])) return false;
	return true;
}

function matchHs(args) {
	if (!(args[0] === 'seths' || args[0] === 'addhs')) return false;
	if (!isPositiveInteger(args[2])) return false;
	if (!MODES_SUFFIXES.has(args[3])) return false;
	return true;
}

function matchRmHs(args) {
	if (args[0] !== 'rmhs') return false;
	if (!MODES_SUFFIXES.has(args[2])) return false;
	return true;
}

function matchPing(contenu) {
	if (!(contenu.startsWith('ping') || contenu.startsWith('p'))) return null;
	const lignes = contenu.split('\n');
	const args = lignes[0].split(' ');
	args.shift();
	return args;
}

async function reload(message, joueurs) {
	saveJoueurs(joueurs);
	await message.channel.send(':repeat: Reloading!');
	await DiscordLogger.instance.logReloadMessage();
	process.exit();
}

function listeJoueurs(joueurs) {
	const msg = ['**Liste des joueurs enregistrés:**'];
	Object.keys(joueurs).forEach(id => {
		msg.push(joueurs[id].pseudo);
		if (joueurs[id].partie)
			msg.push('> partie en cours');
	});
	return msg.join('\n');
}

function isInteger(string) {
	if (typeof string !== 'string') return false;
	if (string.match(/^-?\d+$/)) return +string;
	else return false;
}

function isPositiveInteger(string) {
	if (typeof string !== 'string') return false;
	if (string.match(/^\d+$/)) return +string;
	else return false;
}

function createJoueurIfNeeded(id, pseudo, discriminator, joueurs) {
	let joueur = joueurs[id];
	if (joueur == undefined) {
		joueur = new Joueur(pseudo, discriminator);
		joueurs[id] = joueur;
		return true;
	}
	return false;
}

function printMode(mode) {
	const MODES = {
		mode_plus: 'Mode Addition',
		mode_moins: 'Mode Soustraction',
		mode_double: 'Mode Double',
	};
	return MODES[mode];
}

export {
	changeScore,
	matchTp, // ==> match
	matchHs, // ==> match
	matchRmHs, // ==> match
	matchPing, // ==> match
	reload,
	listeJoueurs,
	isInteger,
	isPositiveInteger,
	createJoueurIfNeeded,
	printMode,
};