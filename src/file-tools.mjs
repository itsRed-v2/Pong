import fs from 'fs';
import 'dotenv/config'

const DATA_PATH = process.env.PONG_DATA_PATH;
const HIGHSCORE_PATH = DATA_PATH + '/highscores.mjs';
const PLAYERS_PATH = DATA_PATH + '/players.mjs';

function stringifyForExport(object) {
    return "export let data = " + JSON.stringify(object, null, "  ") + ";"
}

function saveHighScores(allHighscores) {
	fs.writeFile(HIGHSCORE_PATH, stringifyForExport(allHighscores), function (err) {
		if (err) return console.log(err)
	});
}
  
function saveJoueurs(JOUEURS) {
	fs.writeFile(PLAYERS_PATH, stringifyForExport(JOUEURS), function (err) {
		if (err) return console.log(err)
	});
}

export {
	stringifyForExport,
	saveHighScores,
	saveJoueurs
}