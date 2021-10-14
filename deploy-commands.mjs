import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.mjs';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.mjs'));

for (const fileName of commandFiles) {
    try {
        console.log("Loading: " + fileName)
        const command = (await import(`./commands/${fileName}`)).default;
        commands.push(command.data.toJSON());
    } catch (error) {
        console.error(`Erreur lors du chargement du fichier commande ${fileName} :`)
        throw error;
    }
}

const rest = new REST({ version: '9' }).setToken(token);

if (process.argv[2] === 'global') {
    console.log('Started refreshing application GLOBAL commands.')
    rest.put(Routes.applicationCommands(clientId), { body: commands })
        .then(() => console.log("Successfully reloaded application GLOBAL commands."))
        .catch(console.error);
} else {
    console.log('Started refreshing application guild commands.')
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log("Successfully reloaded application guild commands."))
        .catch(console.error);
}