import { SlashCommandBuilder } from "@discordjs/builders";

export default {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Donne la liste des commandes'),
	async execute(interaction, _PONG_DATA) {

		interaction.reply(AIDE_UTILISATEUR);
		
	}
}

const AIDE_UTILISATEUR = `**Commandes texte**
\`ping ?\` repose la question en cours.
\`ping\` commence une partie.
\`ping mode <mode>\` choisir le mode de jeu parmi \`plus\`, \`moins\`, ou \`double\`.
\`ping list\` liste toutes les parties en cours.
\`ping stop\` termine la partie en cours.
Conseil de pro: tu peux écrire \`p\` à la place de \`ping\` au début des commandes pour faire plus rapide!

**Commandes slash**
\`/regles\` donne les règles du jeu.
\`/highscores\` affiche les highscores des meilleurs joueurs.
\`/help\` affiche cette liste.`