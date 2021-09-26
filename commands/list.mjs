import { SlashCommandBuilder } from "@discordjs/builders";
import {
	afficheliste,
	listeJoueursActifs
} from '../src/pong.mjs';

export default {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Donne la liste des gens qui ont une partie en cours')
		.addBooleanOption(option =>
			option.setName('info')
				.setDescription('Donne des informations supplémentaires sur les joueurs')),
	async execute(interaction, pong) {
		const JOUEURS = pong.joueurs;

		let info = interaction.options.getBoolean('info');
		if (!info) info = false;

		interaction.reply(afficheliste(listeJoueursActifs(JOUEURS, info)));
	}
}