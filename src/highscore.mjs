function changeHs(id, score, mode, allHighscores) {
	const clemode = 'mode_' + mode;
	if (allHighscores[clemode][id]) {
		allHighscores[clemode][id] = parseInt(score);
		return true;
	}
	else {
		return false;
	}
}

function ajouteHs(id, score, mode, allHighscores) {
	const clemode = 'mode_' + mode;
	if (!allHighscores[clemode][id]) {
		allHighscores[clemode][id] = parseInt(score);
		return true;
	}
	else {
		return false;
	}
}

function removeHs(id, mode, allHighscores) {
	if (allHighscores[mode][id]) {
		delete allHighscores[mode][id];
		return true;
	}
	else {
		return false;
	}
}

export {
	changeHs,
	ajouteHs,
	removeHs,
};