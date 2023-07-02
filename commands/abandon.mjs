import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton } from 'discord.js';

import { saveJoueurs } from '../src/file-tools.mjs';
import DiscordLogger from '../src/discordLogger.mjs';

export default {
	data: new SlashCommandBuilder()
		.setName('abandon')
		.setDescription('Termine la partie en cours'),

	async execute(interaction, PONG_DATA) {
		const JOUEURS = PONG_DATA.JOUEURS;
		const joueur = JOUEURS[interaction.user.id];
		const partie = joueur?.partie;

		if (partie) {

			if (partie.points > 20) {

				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('cancel_abandon' + interaction.id)
							.setLabel('Annuler')
							.setStyle('PRIMARY'),
						new MessageButton()
							.setCustomId('confirm_abandon' + interaction.id)
							.setLabel('Abandonner')
							.setStyle('DANGER'),
					);

				await interaction.reply({
					content: `Veux tu vraiment abandonner cette partie? Tu as ${partie.printScore()} en ${partie.printMode()}`,
					components: [row],
					ephemeral: true,
				});

				const filter = buttonInteract => buttonInteract.customId.endsWith(interaction.id);
				const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

				collector.on('collect', async buttonInteract => {
					if (buttonInteract.customId.startsWith('cancel_abandon')) {
						buttonInteract.update({
							content: 'Abandon annulé',
							components : [],
						});
					}
					if (buttonInteract.customId.startsWith('confirm_abandon')) {
						deletePartie(joueur, JOUEURS);
						buttonInteract.update({
							content: 'Partie terminée',
							components: [],
						});
					}
				});

			}
			else { // if partie.points < 20
				deletePartie(joueur, JOUEURS);
				interaction.reply({
					content: 'Partie terminée',
					ephemeral: true,
				});
			}
		}
		else { // if !partie
			interaction.reply({
				content: 'Aucune partie en cours. Tape `ping` pour lancer une partie',
				ephemeral: true,
			});
		}

	},
};

function deletePartie(joueur, JOUEURS) {
	const partie = joueur.partie;
	DiscordLogger.instance.sendAsLog(`:orange_circle:  \`${joueur.pseudo}\` a arrêté une partie à **${partie.printScore()}** (${partie.printMode()})`);

	delete joueur.partie;
	saveJoueurs(JOUEURS);
}
