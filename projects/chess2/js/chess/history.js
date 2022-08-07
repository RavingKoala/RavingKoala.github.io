class ChessHistory {
	#history
	#chessHistoryUI
	constructor (boardHistoryDOM) {
		this.#history = { "w": [], "b": [] }
		this.#chessHistoryUI = new ChessHistoryUI(boardHistoryDOM)
		
		
	}

	add(code, side) {
		this.#history[side].push(code)
		this.#chessHistoryUI.addValue(code, side)
	}

	getLastMove() {
		if (this.#history["w"].length === this.#history["b"].length)
			return this.#history["b"][this.#history["b"].length - 1]
		else
			return this.#history["w"][this.#history["w"].length - 1]
	}

	clear() {
		this.#history = { "w": [], "b": [] }
	}
	
	toString() {
		let retStr = ""
		retStr += "{"
		
		retStr += "'w' = ["
		retStr += this.#history["w"].join(",")
		retStr += "], "
		
		retStr += "'b' = ["
		retStr += this.#history["b"].join(",")
		retStr += "]"
		
		retStr += "}"
		return retStr
	}

	toTable() {
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

class ChessHistoryUI {
	#chessHistoryDOM
	#rowCounter

	#ROWSDOM = (num) => {
		let retDom = document.createElement("div")
		retDom.classList.add("rowNum")
		retDom.textContent = num+"."
		return retDom
	}
	#MOVESDOM = (move) => {
		let retDom = document.createElement("div")
		retDom.classList.add("moveVal")
		retDom.textContent = move
		return retDom
	}

	#EMPTYDOM = () => {
		return document.createElement("span")
	}

	constructor (chessHistoryDOM) {
		this.#chessHistoryDOM = chessHistoryDOM
		this.#rowCounter = 1
	}

	addRow() {
		let historyDom = this.#chessHistoryDOM.querySelector(".history")
		while (historyDom.childElementCount % 3 !== 0) {
			historyDom.appendChild(this.#EMPTYDOM)
		}
		let rowNumDom = this.#ROWSDOM(this.#rowCounter++)
		historyDom.appendChild(rowNumDom)
		this.scrollToElement(rowNumDom)
	}

	addWhiteValue(value) {
		// TODO: ensure row number
		let historyDom = this.#chessHistoryDOM.querySelector(".history")
		
		if (historyDom.childElementCount % 3 === 2)
			historyDom.appendChild(this.#EMPTYDOM())
		if (historyDom.childElementCount % 3 === 0)
			this.addRow()
			
		let whiteMoveDom = this.#MOVESDOM(value)
		historyDom.appendChild(whiteMoveDom)
		this.scrollToElement(whiteMoveDom)
	}

	addBlackValue(value) {
		// TODO: ensure row number
		let historyDom = this.#chessHistoryDOM.querySelector(".history")
		if (historyDom.childElementCount % 3 === 0)
			this.addRow()
		if (historyDom.childElementCount % 3 === 1)
			historyDom.appendChild(this.#EMPTYDOM())
		
		let blackMoveDom = this.#MOVESDOM(value)
		historyDom.appendChild(blackMoveDom)
		this.scrollToElement(blackMoveDom)
	}
	
	addValue(value, side) {
		if (side === "w")
			this.addWhiteValue(value)
		else if (side === "b")
			this.addBlackValue(value)
	}

	scrollToElement(el) {
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
		el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
	}

}