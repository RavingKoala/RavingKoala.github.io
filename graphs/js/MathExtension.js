Math.oldFloor = Math.floor
Math.floor = function(x, round) {
	if (round === undefined)
		return Math.oldFloor(x)

	return Math.oldFloor(x / round) * round
}

Math.oldRound = Math.round
Math.round = function(x, round) {
	if (round === undefined)
		return Math.oldRound(x)

	return Math.oldRound(x / round) * round
}

Math.oldCeil = Math.ceil
Math.ceil = function(x, round) {
	if (round === undefined)
		return Math.oldCeil(x)

	return Math.oldCeil(x / round) * round
}

Math.gcd = function(a, b) {
	return (!b) ? a : Math.gcd(b, a % b);
}