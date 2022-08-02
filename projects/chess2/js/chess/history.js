class ChessHistory {
	#history
	constructor () {
		this.#history = { "w": [], "b": [] }
	}

	add(code, side) {
		this.#history[side].push(code)
	}

	clear() {
		this.#history = { "w": [], "b": [] }
	}

	toString() {
		// ---------------------
		// |  White  |  Black  |
		// |_________|_________|
		// |         |         |
		// | ------- | ------- |
		// |         |         |
		// | ------- | ------- |
		// |         |         |
		// ---------------------

		let retStr = ""
		let width = 12

		retStr += "-" + StringHelper.ensureLengthFill("", width, "-") + "-" + StringHelper.ensureLengthFill("", width, "-") + "-\r\n"
		retStr += "|" + StringHelper.ensureLengthCenter("White", width) + "|" + StringHelper.ensureLengthCenter("Black", width) + "|\r\n"
		retStr += "|" + StringHelper.LengthFill(width, "_") + "|" + StringHelper.LengthFill(width, "_") + "|\r\n"

		for (let i = 0; i < Math.max(this.#history["w"].length, this.#history["b"].length); i++) {
			if (i !== 0)
				retStr += "| " + StringHelper.LengthFill(width - 2, "-") + " | " + StringHelper.LengthFill(width - 2, "-") + " |\r\n"
			let whiteValue = ((this.#history["w"][i] !== undefined) ? this.#history["w"][i] : "")
			let blackValue = ((this.#history["b"][i] !== undefined) ? this.#history["b"][i] : "")
			retStr += "|" + StringHelper.ensureLengthCenter(whiteValue, width) + "|" + StringHelper.ensureLengthCenter(blackValue, width) + "|\r\n"
		}

		retStr += "-" + StringHelper.LengthFill(width, "-") + "-" + StringHelper.LengthFill(width, "-") + "-\r\n"

		return retStr
	}
}