import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import { adminIds } from "../config.mjs";

export default {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Donne la liste des commandes'),

	async execute(interaction) {

		if (adminIds.has(interaction.user.id)) {
			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('user_help_' + interaction.id)
						.setLabel('Aide utilisateur')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('admin_help_' + interaction.id)
						.setLabel('Aide admisistrateur')
						.setStyle('PRIMARY'),
				)
			
			await interaction.reply({
				content: "Séléctionnez l'aide à afficher",
				components: [row],
				ephemeral: true
			})

			const filter = buttonInteract => buttonInteract.customId === 'user_help_' + interaction.id || buttonInteract.customId === 'admin_help_' + interaction.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

			collector.on('collect', async buttonInteract => {
				if (buttonInteract.customId.startsWith('user_help')) {
					await buttonInteract.update({ content: AIDE_UTILISATEUR, components: [] });
				}
				else if (buttonInteract.customId.startsWith('admin_help')) {
					await buttonInteract.update({ content: AIDE_ADMIN, components: [] });
				}
			});

		} else {
			interaction.reply(AIDE_UTILISATEUR);
		}
		
	}
}

const AIDE_UTILISATEUR = `**Commandes texte**
Écris \`ping\` pour commencer une partie.

**Commandes slash**
\`/help\` affiche cette liste.
\`/regles\` donne les règles du jeu.
\`/highscores\` affiche les highscores des meilleurs joueurs.
\`/mode\` change de mode de jeu.
\`/abandon\` termine la partie en cours.
\`/question\` repose la question en cours.`

const AIDE_ADMIN = `**Commandes Admin**
\`ping reload\` redémarre l'application
\`ping tp <id> <score>\` set le score du joueur spécifié
\`ping seths <id> <highscore> <plus|moins|double>\` set le highscore du joueur spécifié dans le mode spécifié
\`ping addhs <id> <highscore> <plus|moins|double>\` ajoute le joueur à la liste dans le mode spécifié avec le score spécifié
\`ping rmhs <id> <plus|moins|double>\` supprime le joueur de la liste dans le mode spécifié
\`ping rmplayer <id>\` supprime le joueur (**toutes** ses données seront supprimées)
\`ping highscore info\` / \`ping hs info\` affiche les meilleurs scores et l'id des joueurs
\`ping log\` upload les fichiers de données de pong
\`ping listall\` donne la liste des joueurs enregistrés`