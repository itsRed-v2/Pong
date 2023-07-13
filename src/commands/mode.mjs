import { SlashCommandBuilder } from '@discordjs/builders';

import { createJoueurIfNeeded, printMode } from '../pong.mjs';
import { saveJoueurs } from '../file-tools.mjs';

export default {
	data: new SlashCommandBuilder()
		.setName('mode')
		.setDescription('Change le mode de jeu')
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('Le mode choisi')
				.setRequired(true)
				.addChoice('Addition', 'mode_plus')
				.addChoice('Soustraction', 'mode_moins')
				.addChoice('Double', 'mode_double')),

	async execute(interaction, PONG_DATA) {
		const JOUEURS = PONG_DATA.JOUEURS;
		const user = interaction.user;
		let joueur = JOUEURS[user.id];

		if (createJoueurIfNeeded(user.id, user.username, user.discriminator, JOUEURS)) {
			joueur = JOUEURS[user.id];
		}

		joueur.mode = interaction.options.getString('mode');
		saveJoueurs(JOUEURS);

		interaction.reply('Tu joues maintenant en ' + printMode(joueur.mode));
	},
};