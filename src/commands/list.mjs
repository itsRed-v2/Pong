import { SlashCommandBuilder } from '@discordjs/builders';

export default {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Donne la liste des gens qui ont une partie en cours')
		.addBooleanOption(option =>
			option.setName('info')
				.setDescription('Donne des informations supplémentaires sur les joueurs')),
	async execute(interaction, PONG_DATA) {
		const JOUEURS = PONG_DATA.JOUEURS;

		let info = interaction.options.getBoolean('info');
		if (!info) info = false;

		interaction.reply(afficheliste(listeJoueursActifs(JOUEURS, info)));
	},
};

function afficheliste(liste) {
	if (liste.length > 1) {
		liste.unshift(`${liste.length} parties sont en cours:`);
	}
	else if (liste.length == 1) {
		liste.unshift('1 partie est en cours:');
	}
	else {
		liste.unshift('Aucune partie n\'est en cours');
	}
	return liste.join('\n');
}

function listeJoueursActifs(joueurs, info) {
	const liste = [];
	Object.keys(joueurs).forEach(id => {
		const joueur = joueurs[id];
		const partie = joueur.partie;
		if (partie) {
			liste.push(`\`${joueur.pseudo}${info ? '#' + joueur.discriminator : ''}\`${info ? ' `' + id + '`' : ''} - ${partie.printScore()}, ${partie.printMode()}`);
		}
	});
	return liste;
}

export {
	listeJoueursActifs,
	afficheliste,
};