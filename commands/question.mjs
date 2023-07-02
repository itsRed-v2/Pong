import { SlashCommandBuilder } from '@discordjs/builders';

export default {
	data: new SlashCommandBuilder()
		.setName('question')
		.setDescription('Repose la question en cours'),

	async execute(interaction, PONG_DATA) {
		const joueur = PONG_DATA.JOUEURS[interaction.user.id];
		const partie = joueur?.partie;

		if (partie) {
			interaction.reply(`pong ${partie.question()} ! (${partie.printScore()}, ${partie.printMode()})`);
		}
		else {
			interaction.reply('Aucune partie en cours. Tape `ping` pour lancer une partie');
		}

	},
};