import { SlashCommandBuilder } from "@discordjs/builders";

export default {
	data: new SlashCommandBuilder()
		.setName('regles')
		.setDescription('Donne les règles du jeu'),
	async execute(interaction, _PONG_DATA) {

		interaction.reply(REGLES);
		
	}
}

const REGLES = `Écris \`ping\` pour commencer une partie.
Je vais alors te poser une opération. Réponds par \`ping <réponse>\`
Si ta réponse est correcte, tu gagne un point et je te pose une nouvelle opération.
Si elle est fausse, tu perds et la partie se termine.
- Plus tu as de points, plus les opérations sont difficiles.
- Pas de stress! Tu as tout le temps que tu veux pour répondre.
- Envie de faire une pause? Aucun problème! Tu peux laisser ta partie en plan, et la reprendre plus tard.
- Utilise \`/help\` pour avoir la liste des commandes.`