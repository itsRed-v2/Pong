import { SlashCommandBuilder } from "@discordjs/builders";
import { printMode } from '../src/pong.mjs'

export default {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Donne la liste des gens qui ont une partie en cours')
		.addBooleanOption(option =>
			option.setName('info')
				.setDescription('Donne des informations supplémentaires sur les joueurs')),
	async execute(interaction, PONG_DATA) {
		const JOUEURS = PONG_DATA.JOUEURS;

		let info = interaction.options.getBoolean('info');
		if (!info) info = false;

		interaction.reply(afficheliste(listeJoueursActifs(JOUEURS, info)));
	}
}

function afficheliste(liste) {
    if (liste.length > 1) {
        liste.unshift(`${liste.length} parties sont en cours:`)
    } else if (liste.length == 1) {
        liste.unshift(`1 partie est en cours:`)
    } else {
        liste.unshift(`Aucune partie n'est en cours`)
    }
    return liste.join('\n');
}

function listeJoueursActifs(joueurs, info) {
    var liste = []
    Object.keys(joueurs).forEach(id => {
        if (joueurs[id].partie) {
            liste.push(`\`${joueurs[id].pseudo}${info ? '#'+joueurs[id].discriminator:''}\`${info ? ' \`'+id+'\`' : ''} - ${joueurs[id].partie.printScore()}, ${printMode(joueurs[id].partie.mode)}`)
        }
    });
    return liste
}

export {
	listeJoueursActifs,
    afficheliste
}