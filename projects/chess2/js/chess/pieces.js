class Piece {
	color
	type
	position
	hasBanana
	canMultiMove
	canSave
	canPromote

	get code() { return `${this.color}${this.type}${this.hasBanana ? "^" : ""}` }
	get name() { return `${Piece.#COLORS[this.color]} ${Piece.TYPES[this.type]}${this.hasBanana ? " with banana" : ""}` }

	static #COLORS = {
		"w": "white",
		"b": "black"
	}
	static TYPES = {
		"k": "king",
		"q": "queen",
		"f": "fishy",
		"fq": "fishy queen",
		"e": "elephant",
		"r": "rook",
		"m": "monkey",

		"b": "bear"
	}
	constructor (type, color, hasBanana = false) {
		this.canMultiMove = false // default unless overwritten
		this.canSave = false // default unless overwritten
		this.canPromote = false // default unless overwritten
		this.type = type
		this.color = color
		this.hasBanana = hasBanana;
		
		if (type === "b") // bear exeption overeride
			this.color = ""
	}

	#PIECEHTML = (type) => `<div class="piece ${type}"></div>`

	toHTML() {
		return this.#PIECEHTML(this.toString())
	}

	giveBanana() {
		this.hasBanana = false;
	}
	takeBanana() {
		this.hasBanana = true
	}

	canMoveTo(board, pos, to) {
		if (this.canMultiMove) {
			let possibleMoves = this.getMultiMoves(board, pos)
			if (possibleMoves[0].includes(to))
				return true
		}
		let possibleMoves = this.possibleMoves(board, pos)
		return possibleMoves[0].includes(to)
	}

	canTakeTo(board, pos, to) {
		if (this.canMultiMove) {
			let possibleMoves = this.getMultiMoves(board, pos)
			if (possibleMoves[1].includes(to))
				return true
		}
		let possibleMoves = this.possibleMoves(board, pos)
		return possibleMoves[1].includes(to)
	}

	promotionChange(piece, pos) {
		throw new Error('Method not implemented.');
	}
	
	promotionCondition(board, pos) {
		throw new Error('Method not implemented.');
	}

	saveCondition(board, pos, toPos) {
		throw new Error('Method not implemented.');
	}

	canSavePiece(board, pos) {
		throw new Error('Method not implemented.');
	}

	getMultiMoveHints(board, pos) {
		throw new Error('Method not implemented.');
	}

	getMultiMoves(board, pos) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) { // return [[moves], [takes]]
		throw new Error('Method not implemented.');
	}

	toString() {
		if (this.type === "b")
			return this.type

		let retString = ""
		retString += this.color
		retString += this.type
		if (this.hasBanana) retString += "^"
		return retString
	}
}

class King extends Piece {
	constructor (color = null, hasBanana = false) {
		super("k", color, hasBanana)
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relPos = [
			ChessBoard.getRelativePos(pos, new Vec2(1, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, 0), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 0), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(0, 1), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupied(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakable(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		return returnArr
	}
}

class Queen extends Piece {
	constructor (color = null) {
		super("q", color)
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relVec = [
			new Vec2(1, 1),
			new Vec2(1, 0),
			new Vec2(1, -1),
			new Vec2(0, -1),
			new Vec2(-1, -1),
			new Vec2(-1, 0),
			new Vec2(-1, 1),
			new Vec2(0, 1),
		]

		relVec.forEach((vec) => {
			for (let i = 1; i < 8; i++) { // 8 times for max board length or height (alternative is while true!)
				let tempVec = vec.clone().multiply(i)
				let code = ChessBoard.getRelativePos(pos, tempVec, this.color)

				if (code == null)
					return
				if (!board.isOccupied(code)) {
					returnArr[0].push(code)
					continue
				}
				if (board.isTakable(code, this.color)) {
					returnArr[1].push(code)
					return
				}
				return
			}
		})

		return returnArr
	}
}

class Fishy extends Piece {
	constructor (color = null) {
		super("f", color)
		this.canPromote = true
	}
	
	promotionChange(piece, pos) {
		return new FishyQueen(piece.color)
	}

	promotionCondition(board, pos) {
		return (this.color === "w" && pos.startsWith("8")) || (this.color === "b" && pos.startsWith("1"))
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relPos = [
			ChessBoard.getRelativePos(pos, new Vec2(-1, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, 1), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupied(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakable(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		relPos = [
			ChessBoard.getRelativePos(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 0), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, 0), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupied(code)) {
				returnArr[0].push(code)
				return
			}
		})

		return returnArr
	}
}

class FishyQueen extends Piece {
	constructor (color = null) {
		super("fq", color)
	}

	possibleMoves(board, pos) {
		// copied from Queen class
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relVec = [
			new Vec2(1, 1),
			new Vec2(1, 0),
			new Vec2(1, -1),
			new Vec2(0, -1),
			new Vec2(-1, -1),
			new Vec2(-1, 0),
			new Vec2(-1, 1),
			new Vec2(0, 1),
		]

		relVec.forEach((vec) => {
			for (let i = 1; i < 8; i++) { // 8 times for max board length or height (alternative is while true!)
				let tempVec = vec.clone().multiply(i)
				let code = ChessBoard.getRelativePos(pos, tempVec, this.color)

				if (code == null)
					return
				if (!board.isOccupied(code)) {
					returnArr[0].push(code)
					continue
				}
				if (board.isTakable(code, this.color)) {
					returnArr[1].push(code)
					return
				}
				return
			}
		})

		return returnArr
	}
}

class Elephant extends Piece {
	constructor (color = null) {
		super("e", color)
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relPos = [
			ChessBoard.getRelativePos(pos, new Vec2(-2, -2), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(2, 2), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(2, -2), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-2, 2), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupied(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakable(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		return returnArr
	}
}

class Rook extends Piece {
	constructor (color = null) {
		super("r", color)
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relPos = [
			ChessBoard.getRelativePos(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, 0), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 0), this.color)
		].filter((code) => code != null)

		// TODO: rook can only take if other color took something of you in the previous turn
		relPos.forEach((code) => {
			if (board.isTakable(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		Object.keys(ChessBoard.rowMarks).forEach((row) => {
			Object.keys(ChessBoard.columnMarks).forEach((column) => {
				let code = ChessBoard.createCode(row, column)
				if (!board.isOccupied(code))
					returnArr[0].push(code)
			})
		})

		return returnArr
	}
}

class Monkey extends Piece {
	constructor (color = null, hasBanana = false) {
		super("m", color, hasBanana)
		this.canMultiMove = true
		this.canSave = true
	}

	saveCondition(board, pos, toPos) {
		let piece = board.getPiece(pos)
		let onWhiteSquare = board.isWhiteSquare(pos)
		let isWhitePiece = piece.color === "w"
		let jump

		if (isWhitePiece) {
			if (!onWhiteSquare)
				jump = { from: "5a", to: "jl5" }
			else // onWhiteSquare
				jump = { from: "4a", to: "jl4" }
		} else {
			if (onWhiteSquare)
				jump = { from: "5h", to: "jr5" }
			else // onWhiteSquare
				jump = { from: "4h", to: "jr4" }
		}


		let movesFromSaveSpot = this.getMultiMoves(board, pos) // dumb name i know

		if (toPos !== jump.from && (movesFromSaveSpot[0].includes(toPos) || movesFromSaveSpot[1].includes(toPos)))
			return true

		return false
	}

	canSavePiece(board, pos) {
		let piece = board.getPiece(pos)
		let onWhiteSquare = board.isWhiteSquare(pos)
		let isWhitePiece = piece.color === "w"
		let jump

		if (isWhitePiece) {
			if (!onWhiteSquare)
				jump = { from: "5a", to: "jl5" }
			else // onWhiteSquare
				jump = { from: "4a", to: "jl4" }
		} else {
			if (onWhiteSquare)
				jump = { from: "5h", to: "jr5" }
			else // onWhiteSquare
				jump = { from: "4h", to: "jr4" }
		}

		// quick check if possible
		let savingPiece = board.getJailPiece(jump.to)
		if (savingPiece === null) return null
		if (!savingPiece.hasBanana) return null

		let multiMoves = this.getMultiMoves(board, pos)

		if (((pos === jump.from && (multiMoves[0].length > 0 || multiMoves[1].length > 0))) ||
			(multiMoves[0].includes(jump.from) || multiMoves[1].includes(jump.from)))
			return jump

		return null
	}

	getMultiMoveHints(board, pos) {
		let returnArr = [[], []] // [ [...movesHints], [...takesHints] ]

		let relVec = [
			new Vec2(0, 1),
			new Vec2(1, 1),
			new Vec2(1, 0),
			new Vec2(1, -1),
			new Vec2(0, -1),
			new Vec2(-1, -1),
			new Vec2(-1, 0),
			new Vec2(-1, 1),
		]

		// hints
		relVec.forEach((vec) => {
			let code = ChessBoard.getPos(pos, vec)
			if (code == null)
				return
			if (!board.isOccupied(code))
				return

			code = ChessBoard.getPos(pos, vec.clone().multiply(2))
			if (code === this.position) {
				returnArr[0].push(code)
				return
			}
			if (code == null)
				return
			if (!board.isOccupied(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakable(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		return returnArr
	}

	getMultiMoves(board, pos) {
		let returnArr = [[], []] // [ [...possible eventual moves], [...possible eventual takes] ]

		returnArr[0].push(pos)

		let relVec = [
			new Vec2(0, 1),
			new Vec2(1, 1),
			new Vec2(1, 0),
			new Vec2(1, -1),
			new Vec2(0, -1),
			new Vec2(-1, -1),
			new Vec2(-1, 0),
			new Vec2(-1, 1),
		]

		// eventual moves
		let isJumpableDirection = (board, pos, vec) => {
			let code = ChessBoard.getPos(pos, vec)
			if (code == null)
				return false
			if (!board.isOccupied(code))
				return false
			code = ChessBoard.getPos(pos, vec.clone().multiply(2))
			if (code == null)
				return false
			if (!board.isOccupied(code) && code !== pos)
				return [true, code, "move"]

			if (board.isTakable(code, this.color))
				return [true, code, "take"]

			return false
		}

		// searching all positions
		// fill returnArr[2] with possible eventual moves
		// fill returnArr[3] with possible eventual takes
		let searched = []
		let searching = [pos]

		while (searching.length > 0) {
			let doing = searching.shift()

			relVec.forEach((vec) => {
				let jumpable = isJumpableDirection(board, doing, vec)
				if (jumpable === false)
					return

				if (jumpable[2] === "take") {
					returnArr[1].push(jumpable[1])
					return
				}
				if (jumpable[2] === "move")
					returnArr[0].push(jumpable[1])

				if (!searching.includes(jumpable[1]) && !searched.includes(jumpable[1]))
					searching.push(jumpable[1])
			})

			searched.push(doing)
		}

		return returnArr
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relVec = [
			new Vec2(0, 1),
			new Vec2(1, 1),
			new Vec2(1, 0),
			new Vec2(1, -1),
			new Vec2(0, -1),
			new Vec2(-1, -1),
			new Vec2(-1, 0),
			new Vec2(-1, 1),
		]

		relVec.forEach((vec) => {
			let code = ChessBoard.getPos(pos, vec)

			if (code == null)
				return
			if (!board.isOccupied(code)) {
				returnArr[0].push(code)
				return
			}
		})

		return returnArr
	}
}

class Bear extends Piece {
	constructor () {
		super("b")
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		if (pos === "c") {
			let codes = ["4d", "4e", "5d", "5e"]
			returnArr[0] = codes.filter((code) => !board.isOccupied(code))
			return returnArr
		}

		let relPos = [
			ChessBoard.getRelativePos(pos, new Vec2(1, 0), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 0), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(1, 1), this.color),
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupied(code))
				returnArr[0].push(code)
		})
		return returnArr
	}
}