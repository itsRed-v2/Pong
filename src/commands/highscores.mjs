import { SlashCommandBuilder } from '@discordjs/builders';
import { printMode } from '../pong.mjs';

export default {
	data: new SlashCommandBuilder()
		.setName('highscores')
		.setDescription('Affiche le scoreboard')
		.addBooleanOption(option =>
			option.setName('info')
				.setDescription('Donne des informations supplémentaires sur les joueurs')),
	async execute(interaction, PONG_DATA) {
		const ALLHIGHSCORES = PONG_DATA.HIGHSCORES;
		const JOUEURS = PONG_DATA.JOUEURS;

		let info = interaction.options.getBoolean('info');
		if (!info) info = false;

		interaction.reply(printHighscores(ALLHIGHSCORES, JOUEURS, info));
	},
};

function printHighscores(ALLHIGHSCORES, JOUEURS, printInfo) {
	let contenu = '';
	for (const mode in ALLHIGHSCORES) {
		contenu += '**' + printMode(mode) + '**\n';
		const highscoresTriees = trieHighscores(ALLHIGHSCORES[mode]);
		for (const index in highscoresTriees) {
			const pair = highscoresTriees[index];
			const id = pair[0];
			const score = pair[1];
			const pseudo = JOUEURS[id].pseudo;
			const discriminator = JOUEURS[id].discriminator;
			const position = parseInt(index) + 1;
			contenu += `\`${position}) ${score} : ${pseudo}${printInfo ? '#' + discriminator : ''}\`${printInfo ? `    \`${id}\`` : ''}\n`;
		}
	}
	return contenu;
}

function trieHighscores(highscores) {
	const sortable = [];
	for (const id in highscores) {
		sortable.push([id, highscores[id]]);
	}

	sortable.sort((hs1, hs2) => hs2[1] - hs1[1]);
	return sortable;
}

export {
	printHighscores,
	trieHighscores,
};