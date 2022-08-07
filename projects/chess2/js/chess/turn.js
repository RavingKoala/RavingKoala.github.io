class ChessTurn {
	static signs = {
		move: "",
		take: "x",
		capture: ">",
		save: "&",
		promotion: "=",
		check: "+",
		checkmate: "#",
	}
	static composeKeys = {
		piece: "piece", // mandatory
		from: "from", // mandatory
		to: "to", // mandatory
		isTakeMove: "isTakeMove",
		captureTo: "captureTo",
		savePiece: "savePiece", // Piece
		promoteTo: "promoteTo", // Piece
	}
	turn
	isComposing
	#composeObj

	constructor () {
		this.turn = Chess.sides.white
		this.isComposing = false
		this.#composeObj = null
	}

	swapTurn() {
		if (this.turn === Chess.sides.white)
			this.turn = Chess.sides.black
		else if (this.turn === Chess.sides.black)
			this.turn = Chess.sides.white
	}

	// #region construct and create codes
	addToCompose(board, key, value) {
		if (!this.isComposing) {
			this.#composeObj = {}
			this.isComposing = true
		}
		if (!Object.values(ChessTurn.composeKeys).includes(key))
			throw new Error(key + " is not a valid key!")

		if (key === "from") {
			if (this.#composeObj.to !== undefined) {
				this.#composeObj.from = ChessTurn.minifyFrom(board, value, this.#composeObj.to)
			}
		}
		if (key === "to") {
			if (this.#composeObj.from !== undefined) {
				this.#composeObj.from = ChessTurn.minifyFrom(board, this.#composeObj.from, value)
			}
		}
		if (key === "captureTo")
			return this.#composeObj.captureTo = ChessTurn.minifyCaptureTo(value)

		this.#composeObj[key] = value
	}

	addToComposeObj(board, obj) {
		if (!obj instanceof Object)
			throw new Error("parameter is not an object with key value pairs!")

		for (let [key, value] of Object.entries(obj)) {
			this.addToCompose(board, key, value)
		}
	}

	composeTempCreate() { // may be inaccurate if params are missing
		if (this.#composeObj === null) throw new Error("no parameters given!")
		// mandatory keys
		if (this.#composeObj.piece === undefined) throw Error("provide parameter: 'piece' is mandatory!")
		if (!this.#composeObj.piece instanceof Piece) throw Error("parameter: 'piece' is not of type Piece!")
		if (this.#composeObj.to === undefined) throw Error("provide parameter: 'to' is mandatory!")
		if (this.#composeObj.from === undefined) throw Error("provide parameter: 'from' is mandatory!")

		//optional keys
		// isTakeMove promoteTo captureTo
		let isSaveMove = (this.#composeObj.savePiece !== undefined) ? true : false
		let isTakeMove = (this.#composeObj.isTakeMove !== undefined) ? true : false
		let isPromotionMove = (this.#composeObj.promoteTo !== undefined) ? true : false
		let isCaptureMove = (this.#composeObj.captureTo !== undefined) ? true : false

		// construct moveCode
		// keys: toPiece, isTakeMove, isPromotionMove
		let moveCode = ""
		moveCode += ChessTurn.#getPieceCode(this.#composeObj.piece)
		moveCode += this.#composeObj.from
		if (isSaveMove)
			moveCode += ChessTurn.#saveCodePiece(this.#composeObj.savePiece)
		
		if (!isTakeMove)
			moveCode += ChessTurn.#moveCodePiece(this.#composeObj.to)
		else
			moveCode += ChessTurn.#takeCodePiece(this.#composeObj.to)

		if (isPromotionMove) {
			let promoCode = ""
			if (this.#composeObj.promoteTo instanceof Piece)
				promoCode += ChessTurn.#getPieceCode(this.#composeObj.promoteTo)
			else
				promoCode += this.#composeObj.promoteTo
			moveCode += ChessTurn.#promotionCodePiece(promoCode)
		}

		if (isCaptureMove)
			moveCode += ChessTurn.#captureCodePiece(this.#composeObj.captureTo)

		// default normal move
		return moveCode
	}

	composeAndCreate() {
		let ret = this.composeTempCreate()
		this.isComposing = false
		this.#composeObj = null
		return ret
	}

	static minifyFrom(board, from, to) {
		let piece = board.getPiece(from)
		let posArr = board.typeCanMakeMove(piece.type, to, piece.color)
		let ret = ""
		let hasMatchingCol = false, hasMatchingRow = false
		for (const code of posArr) {
			if (from === code) continue
			if (from[0] === code[0])
				hasMatchingCol = true
			if (from[1] === code[1])
				hasMatchingRow = true

			if (hasMatchingCol && hasMatchingRow)
				return from
		}

		if (hasMatchingRow)
			ret += from[0]
		if (hasMatchingCol)
			ret += from[1]

		return ret
	}

	static minifyCaptureTo(captureTo) {
		return captureTo[2]
	}

	static createCode(board, from, to, promoteTo = null, isCheckOrCheckmate = false) {
		let piece = board.getPiece(from)

		let fromMinCode = ChessTurn.minifyFrom(board, from, to)

		if (board.isOccupied(to)) {
			return ChessTurn.#createTakeCode(piece, to, fromMinCode)
		}

		return ChessTurn.#createMoveCode(piece, to, fromMinCode)
	}

	static #getPieceCode(piece) {
		if (!piece instanceof Piece)
			throw new Error(piece + "Is not instance of Piece!")

		let code = (piece.type !== "F" ? piece.type : "")
		return code

	}

	static #createMoveCode(piece, to, from = null) {
		let code = ""
		code += ChessTurn.#getPieceCode(piece)
		if (from !== null) code += from
		code += to

		return code
	}

	static #createTakeCode(piece, to, from = null) {
		let code = ""
		code += ChessTurn.#getPieceCode(piece)
		if (from !== null) code += from
		code += ChessTurn.#takeCodePiece(to)

		return code
	}

	static #createPromotionCode(piece, to, promoteTo, from = null, isTakeMove = false) {
		let code = ""
		if (isTakeMove)
			code += ChessTurn.#createTakeCode(piece, to, from)
		else
			code += ChessTurn.#createMoveCode(piece, to, from)

		// is: 'e8=QF' but can also be 'e8QF' or 'e8(QF)' or 'e8/QF'
		if (promoteTo instanceof Piece)
			promoteTo = ChessTurn.#getPieceCode(promoteTo)

		code += ChessTurn.#promotionCodePiece(promoteTo)

		return code
	}

	static #createCaptureCode(piece, to, captureTo, from = null) {
		let code = ChessTurn.#createTakeCode(piece, to, from)
		return code + ChessTurn.#captureCodePiece(captureTo)
	}
	
	static #createSaveCode(piece, to, savingPiece, from = null, isTakeMove = false) {
		let code = ""
		code + ChessTurn.#saveCodePiece(savingPiece)
		if (isTakeMove)
			code += ChessTurn.#createTakeCode(piece, to, from)
		else
			code += ChessTurn.#createMoveCode(piece, to, from)
		return code
	}

	static #createPromotionAndCaptureCode(piece, to, toPiece, captureTo, from = null) {
		let code = ChessTurn.#createPromotionCode(piece, to, toPiece, from, true)
		return code + ChessTurn.#captureCodePiece(captureTo)
	}


	static #createCheckOrCheckmateBaseCode(piece, to, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false) {
		throw new Error('Method not implemented.');
	}

	static #createCheckCode(piece, to, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false) {
		let base = ChessTurn.#createCheckOrCheckmateBaseCode(piece, to, isCheck, from, toPiece, isTakeMove, isPromotionMove)
		return base + "+"
	}

	static #createCheckmateCode(piece, to, from = null, toPiece, isTakeMove = false, isPromotionMove = false) {
		let base = ChessTurn.#createCheckOrCheckmateBaseCode(piece, to, isCheck, from, toPiece, isTakeMove, isPromotionMove)
		return base + "#"
	}

	static #moveCodePiece(to, from = null) {
		let ret = ""
		if (from !== null) ret += from
		ret += ChessTurn.signs.move
		ret += to
		return ret
	}
	static #takeCodePiece(to, from = null) {
		let ret = ""
		if (from !== null) ret += from
		ret += ChessTurn.signs.take
		ret += to
		return ret
	}
	static #promotionCodePiece(to) {
		if (to instanceof Piece)
			to = to.type

		return ChessTurn.signs.promotion + "" + to
	}
	static #captureCodePiece(to) {
		return ChessTurn.signs.capture + "" + to
	}
	static #saveCodePiece(saving) {
		if (saving instanceof Piece)
			saving = saving.type

		return ChessTurn.signs.save + "" + saving
	}
	static #checkCodePiece(to) {
		return ChessTurn.signs.check + "" + to
	}
	static #checkmateCodePiece(to) {
		return ChessTurn.signs.checkmate + "" + to
	}

	static createMatchEndCode(whiteWon = true) {
		if (whiteWon)
			return "1-0"
		else
			return "0-1"
	}
	// #endregion

	// #region deconstruct codes

	// #endregion
}