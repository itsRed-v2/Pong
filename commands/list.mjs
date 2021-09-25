import { SlashCommandBuilder } from "@discordjs/builders";
import {
	afficheliste,
	listeJoueursActifs
} from '../src/pong.mjs';

export default {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Donne la liste des gens qui ont une partie en cours'),
	async execute(interaction, pong) {
		let joueurs = pong.joueurs;
		interaction.reply(afficheliste(listeJoueursActifs(joueurs, false)));
	}
}