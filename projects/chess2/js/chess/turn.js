class ChessTurn {
	static signs = {
		move: "",
		take: "x",
		capture: ">",
		promotion: "=",
		check: "+",
		checkmate: "#",
	}
	static composeKeys = {
		piece: "piece", // mandatory
		from: "from", // mandatory
		to: "to", // mandatory
		isTakeMove: "isTakeMove",
		promoteTo: "promoteTo",
		captureTo: "captureTo",
	}
	#turn
	isComposing
	#composeObj

	constructor () {
		this.turn = Chess.sides.w
		this.isComposing = false
		this.#composeObj = null
	}

	get turn() {
		return this.#turn
	}

	set turn(turn) {
		this.#turn = Chess.sides[turn]
	}

	// #region construct and create codes
	addToCompose(board, key, value) {
		this.isComposing = true
		if (!Object.values(ChessTurn.composeKeys).includes(key))
			throw new Error(key + " is not a valid key!")

		this.#composeObj[key] = value
		
		if (key === "from")
			if (this.#composeObj.to !== undefined)
				return this.#composeObj[key] = ChessTurn.minifyFrom(board, value)
		if (key === "to")
			if (this.#composeObj.to !== undefined)
				return this.#composeObj.from = ChessTurn.minifyFrom(board, this.#composeObj.from)
	}

	addToCompose(board, obj) {
		if (obj instanceof Object)
			throw new Error("parameter is not an object with key value pairs!")

		for (const [key, value] of Object.entries(obj)) {
			this.addToCompose(board, key, value)
		}
	}

	composeTempCreate() { // may be inaccurate if params are missing
		if (this.#composeObj === null) throw new Error("no parameters given!")
		// mandatory keys
		if (!this.#composeObj.piece) throw Error("provide parameter: 'piece' is mandatory!")
		if (!this.#composeObj.piece instanceof Piece) throw Error("parameter: 'piece' is not of type Piece!")
		if (!this.#composeObj.to) throw Error("provide parameter: 'to' is mandatory!")
		if (!this.#composeObj.from) throw Error("provide parameter: 'from' is mandatory!")

		//optional keys
		// isTakeMove promoteTo captureTo
		let isTakeMove = (this.#composeObj.isTakeMove === undefined) ? true : false
		let isPromotionMove = (this.#composeObj.promoteTo !== undefined) ? true : false
		let isCaptureMove = (this.#composeObj.captureTo !== undefined) ? true : false


		// construct moveCode
		// keys: toPiece, isTakeMove, isPromotionMove
		let moveCode = ""
		if (!isTakeMove)
			moveCode += ChessTurn.#moveCodePiece(to)
		else
			moveCode += ChessTurn.#takeCodePiece(to)

		if (isPromotionMove) {
			promoCode = ""
			if (this.#composeObj.promoteTo instanceof Piece)
				moveCode += ChessTurn.#getPieceCode(this.#composeObj.promoteTo)
			else
				moveCode += this.#composeObj.promoteTo
		}

		if (isCaptureMove)
			moveCode += this.#composeObj.captureTo

		// default normal move
		return moveCode
	}

	composeAndCreate() {
		let ret = composeTempCreate()
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
		if (piece.hasBanana) code += "^"
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

	static #createPromotionAndCaptureCode(piece, to, toPiece, captureTo, from = null) {
		let code = ChessTurn.#createPromotionCode(piece, to, toPiece, from, true)
		return code + ChessTurn.#captureCodePiece(captureTo)
	}


	static #createCheckOrCheckmateBaseCode(piece, to, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false) {
		throw new Error('Method not implemented.');
	}

	static #createCheckCode(piece, to, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false) {
		let base = ChessTurn.#createCheckOrCheckmateBaseCode(piece, to, isCheck, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false)
		return base + "+"
	}

	static #createCheckmateCode(piece, to, from = null, toPiece, isTakeMove = false, isPromotionMove = false) {
		let base = ChessTurn.#createCheckOrCheckmateBaseCode(piece, to, isCheck, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false)
		return base + "#"
	}

	static #moveCodePiece(to, from = null) {
		let ret = ""
		if (from !== null) ret += from
		ret += signs.move
		ret += to
		return ret
	}
	static #takeCodePiece(to, from = null) {
		let ret = ""
		if (from !== null) ret += from
		ret += signs.take
		ret += to
		return ret
	}
	static #promotionCodePiece(to) {
		let toCode = ""
		if (to instanceof Piece) {
			toCode = to.type
		}

		return signs.promotion + "" + to
	}
	static #captureCodePiece(to) {
		return signs.capture + "" + to
	}
	static #checkCodePiece(to) {
		return signs.check + "" + to
	}
	static #checkmateCodePiece(to) {
		return signs.checkmate + "" + to
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