class Piece {
	color
	type
	hasBanana
	canMultiMove

	get code() { return `${this.color}${this.type}${this.hasBanana ? "^" : ""}` }
	get name() { return `${Piece.#COLORS[this.color]} ${Piece.#TYPES[this.type]}${this.hasBanana ? " with banana" : ""}` }

	static #COLORS = {
		"w": "white",
		"b": "black"
	}
	static #TYPES = {
		"k": "king",
		"q": "queen",
		"f": "fishy",
		"fq": "fishy queen",
		"e": "elephant",
		"r": "rook",
		"m": "monkey",

		"b": "bear"
	}
	constructor (type, color, banana = false) {
		this.canMultiMove = false // default unless overwritten
		if (type === "b") { // bear exeption
			this.type = type
			this.color = ""
			Piece.#TYPES[this.type = "b"]
			return
		}

		this.type = type
		this.color = color
		this.hasBanana = banana;
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
			let possibleMoves = this.possibleMultiMoves(board, pos)
			if (possibleMoves[2].includes(to))
				return true
		}
		let possibleMoves = this.possibleMoves(board, pos)
		return possibleMoves[0].includes(to)
	}

	canTakeTo(board, pos, to) {
		if (this.canMultiMove) {
			let possibleMoves = this.possibleMultiMoves(board, pos)
			if (possibleMoves[3].includes(to))
				return true
		}
		let possibleMoves = this.possibleMoves(board, pos)
		return possibleMoves[1].includes(to)
	}

	possibleMultiMoves(board, pos) {
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
	constructor (color, hasBanana = false) {
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
	constructor (color) {
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
	constructor (color) {
		super("f", color)
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
	constructor (color) {
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
	constructor (color) {
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
	constructor (color) {
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

		Object.keys(rowMarks).forEach((row) => {
			Object.keys(columnMarks).forEach((column) => {
				let code = ChessBoard.createCode(row, column)
				if (!board.isOccupied(code))
					returnArr[0].push(code)
			})
		})

		return returnArr
	}
}

class Monkey extends Piece {
	constructor (color, hasBanana = false) {
		super("m", color, hasBanana)
		this.canMultiMove = true
	}

	possibleMultiMoves(board, pos) {
		let returnArr = [[], [], [], []] // [   [...movesHints], [...takesHints], [...possible eventual moves], [...possible eventual takes]   ]

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
			if (!board.isOccupied(code))
				return

			code = ChessBoard.getPos(pos, vec.clone().multiply(2))
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


		let isJumpableDirection = (board, pos, vec) => {
			let code = ChessBoard.getPos(pos, vec)
			if (code == null)
				return false
			if (!board.isOccupied(code))
				return false
			code = ChessBoard.getPos(pos, vec.clone().multiply(2))
			if (code == null)
				return false
			if (!board.isOccupied(code))
				return [true, code, "move"]

			if (board.isTakable(code, this.color))
				return [true, code, "take"]

			return false
		}

		// fill returnArr[2] with possible eventual moves
		// fill returnArr[3] with possible eventual takes

		// searching all positions
		let searched = []
		let searching = [pos]

		while (searching.length > 0 && searching.length < 34) {
			let doing = searching.shift()

			relVec.forEach((vec) => {
				let jumpable = isJumpableDirection(board, doing, vec)
				if (jumpable === false) return

				if (jumpable[2] === "move")
					returnArr[2].push(jumpable[1])
				if (jumpable[2] === "take")
					returnArr[3].push(jumpable[1])

				if (!(searching.includes(jumpable[1]) || searched.includes(jumpable[1])))
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

		// let move = (from, to) => {
		// 	if (from !== pos) return

		// 	let jailPiece = board.getPiece(from)

		// 	if (jailPiece === null) return

		// 	if (jailPiece.hasBanana)
		// 		returnArr[1].push(to)
		// }

		// let swaps = {}

		// // cant take from same color
		// if (this.color === "w")
		// 	swaps = {
		// 		"5h": "jl1",
		// 		"4h": "jl2",
		// 	}
		// if (this.color === "b")
		// 	swaps = {
		// 		"5a": "jr1",
		// 		"4a": "jr2",
		// 	}

		// for (const [key, value] of Object.entries(swaps)) {
		// 	move(key, value)
		// 	move(value, key)
		// }

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
			ChessBoard.getRelativePos(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePos(pos, new Vec2(-1, 0), this.color),
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupied(code))
				returnArr[0].push(code)
		})
		return returnArr
	}
}