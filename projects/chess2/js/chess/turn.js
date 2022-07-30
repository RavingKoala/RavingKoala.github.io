class ChessTurn {
	static composeKeys = {

	}
	#turn
	isComposing
	#composeObj

	constructor () {
		this.turn = Chess.sides.white
		this.isComposing = false
	}

	get turn() {
		return this.#turn
	}

	set turn(turn) {
		this.#turn = Chess.sides[turn]
	}

	addToCompose(key, value) {
		isComposing = true
		if (!Object.values(ChessTurn.composeKeys).includes(key))
			throw new Error(key + " is not a valid key")
		this.#composeObj[key] = value
	}
	
	addToCompose(obj) {
		if (obj instanceof Object)
			throw new Error("parameter is not an object with key value pairs")

		for (const [key, value] of Object.entries(obj)) {
			this.addToCompose(key, value)
		}
	}

	compose() {
		isComposing = false
		// mandatory keys
		if (!)
		//optional keys
		return null
	}

	minifyFrom(board, from) {
		if (this.#isUniqueOnBothAxis(board, from)) return ""

		if (this.#isUniqueOnRow(board, from))
			return ChessBoard.splitCode(from)[0]
		else if (this.#isUniqueOnColumn(board, from))
			return ChessBoard.splitCode(from)[1]

		return from
	}

	static createCode(board, from, to, isCheckOrCheckmate = false) {
		let piece = board.getPiece(from)

		let fromMinCode


		if (board.isOccupied(to)) {
			let takenPiece = board.getPiece(to)
			if (/[qk]/.test(piece.type)) { //regex for [white or black] [queen or king] (banana optionally)
				ChessTurn.#createCaptureCode(piece, to, "j", fromMinCode) // TODO: add jail where it was send to
			}
			return ChessTurn.#createTakeCode(piece, to, fromMinCode)
		}

		return ChessTurn.#createMoveCode(piece, to, fromMinCode)
	}

	static #isUniqueOnBothAxis(board, pos) {
		return (this.#isUniqueOnColumn(board, pos) && this.#isUniqueOnRow(board, pos))
	}

	static #isUniqueInDirection(board, pos, vec) {
		let piece = board.getPiece(pos)

		for (let i = 1; i < 8; i++) { // 8 times for max board length or height (alternative is while true!)
			let tempVec = vec.clone().multiply(i)
			let code = ChessBoard.getRelativePos(pos, tempVec, this.color)

			if (code == null) return
			if (board.isOccupied(code))
				if (board.getPiece(code).type === piece.type)
					return false
		}

		return true
	}

	static #isUniqueOnRow(board, pos) {
		let isUnique = true

		let relVec = [
			new Vec2(1, 0),
			new Vec2(-1, 0),
		]

		relVec.forEach((vec) => {
			if (!isUnique) return
			isUnique = this.#isUniqueInDirection(board, pos, vec)
		})

		return isUnique
	}

	static #isUniqueOnColumn(board, pos) {
		let isUnique = true

		let relVec = [
			new Vec2(0, 1),
			new Vec2(0, -1),
		]

		relVec.forEach((vec) => {
			if (!isUnique) return
			isUnique = this.#isUniqueInDirection(board, pos, vec)
		})

		return isUnique
	}

	static #getPieceCode(piece) {
		if (!piece instanceof Piece)
			throw new Error(piece + "Is not instance of Piece!")

		let code = (piece.type !== "f" ? piece.type.toUpperCase() : "")
		if (piece.hasBanana) code += "^"
		return code

	}

	static #createMoveCode(piece, to, from = null) {
		let code = ""
		code += ChessTurn.#getPieceCode(piece).toString()
		if (from !== null) code += from
		code += to

		return code
	}

	static #createTakeCode(piece, to, from = null) {
		let code = ""
		code += ChessTurn.#getPieceCode(piece).toString()
		if (from !== null) code += from
		code += "x"
		code += to

		return code
	}

	static #createCaptureCode(piece, to, captureTo, from = null) {
		let code = ChessTurn.#createTakeCode(piece, to, from)
		return code + ">" + captureTo
	}

	static #createPromotionCode(piece, to, toPiece, from = null, isTakeMove = false) {
		let code = ""
		if (isTakeMove)
			code += ChessTurn.#createTakeCode(piece, to, from)
		else
			code += ChessTurn.#createMoveCode(piece, to, from)

		code += "=" // is: 'e8=QF' but can also be 'e8QF' or 'e8(QF)' or 'e8/QF'
		if (toPiece instanceof Piece)
			code += toPiece.type
		else
			code += toPiece // is code (string)

		return code
	}

	// static #createCheckOrCheckmateBaseCode(piece, to, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false) {
	// 	throw new Error('Method not implemented.');
	// }

	// static #createCheckCode(piece, to, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false) {
	// 	let base = ChessTurn.#createCheckOrCheckmateBaseCode(piece, to, isCheck, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false)
	// 	return base + "+"
	// }

	// static #createCheckmateCode(piece, to, from = null, toPiece, isTakeMove = false, isPromotionMove = false) {
	// 	let base = ChessTurn.#createCheckOrCheckmateBaseCode(piece, to, isCheck, from = null, toPiece = null, isTakeMove = false, isPromotionMove = false)
	// 	return base + "#"
	// }

	static createMatchEndCode(whiteWon = true) {
		if (whiteWon)
			return "1-0"
		else
			return "0-1"
	}
}