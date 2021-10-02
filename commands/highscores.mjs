import { SlashCommandBuilder } from "@discordjs/builders";
import { printMode } from '../src/pong.mjs'

export default {
    data: new SlashCommandBuilder()
        .setName('highscores')
        .setDescription('Affiche le scoreboard')
        .addBooleanOption(option =>
            option.setName('info')
                .setDescription('Donne des informations supplémentaires sur les joueurs')),
    async execute(interaction, pong) {
        const ALLHIGHSCORES = pong.highscores;
        const JOUEURS = pong.joueurs;

        let info = interaction.options.getBoolean('info');
        if (!info) info = false;

        interaction.reply(printHighscores(ALLHIGHSCORES, JOUEURS, info));
    }
}

function printHighscores(ALLHIGHSCORES, JOUEURS, printInfo) {
    var contenu = ''
    for (var mode in ALLHIGHSCORES) {
        contenu += '**' + printMode(mode) + '**\n'
        var highscoresTriees = trieHighscores(ALLHIGHSCORES[mode])
        for (var index in highscoresTriees) {
            var pair = highscoresTriees[index];
            var id = pair[0];
            var score = pair[1];
            var pseudo = JOUEURS[id].pseudo;
            var discriminator = JOUEURS[id].discriminator;
            var position = parseInt(index) + 1
            contenu += `\`${position}) ${score} : ${pseudo}${printInfo ? '#'+discriminator : ''}\`${printInfo ? `    \`${id}\``:''}\n`
        }
    }
    return contenu
}

function trieHighscores(highscores) {
    var sortable = []
    for (var id in highscores) {
        sortable.push([id, highscores[id]])
    }

    sortable.sort((hs1, hs2) => { return hs2[1] - hs1[1] });
    return sortable
}

export {
    printHighscores,
    trieHighscores
}