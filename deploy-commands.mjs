import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.mjs';

const commands = [
    new SlashCommandBuilder().setName("server").setDescription("replies with server info!"),
    new SlashCommandBuilder().setName("user").setDescription("replies with user info!")
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log("Successfully registered application commands.")
    } catch (error) {
        console.error(error);
    }
})();