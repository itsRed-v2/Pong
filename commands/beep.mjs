import { SlashCommandBuilder } from "@discordjs/builders";

export default {
	data: new SlashCommandBuilder()
		.setName('beep')
		.setDescription('Replies with boop!'),
	async execute(interaction) {
		await interaction.reply('boop!');
	}
}