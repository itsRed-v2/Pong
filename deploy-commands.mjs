import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.mjs';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.mjs'));

for (const fileName of commandFiles) {
    try {
        const command = (await import(`./commands/${fileName}`)).default;
        commands.push(command.data.toJSON());
    } catch (error) {
        console.error(`Erreur lors du chargement du fichier commande ${fileName} :`)
        throw error;
    }
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);