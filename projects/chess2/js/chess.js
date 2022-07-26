var rowMarks = {
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
}
var columnMarks = {
	"a": 1,
	"b": 2,
	"c": 3,
	"d": 4,
	"e": 5,
	"f": 6,
	"g": 7,
	"h": 8,
}

var Side = {
	"white": 0,
	"black": 1
}

class Chess {
	/* board layout
	 * [
	 *     [8a, 8b, 8c, 8d, 8e, 8f, 8g, 8h] // black
	 *     [7a, 7b, 7c, 7d, 7e, 7f, 7g, 7h]
	 *     [6a, 6b, 6c, 6d, 6e, 6f, 6g, 6h]
	 *     [5a, 5b, 5c, 5d, 5e, 5f, 5g, 5h]
	 *     [4a, 4b, 4c, 4d, 4e, 4f, 4g, 4h]
	 *     [3a, 3b, 3c, 3d, 3e, 3f, 3g, 3h]
	 *     [2a, 2b, 2c, 2d, 2e, 2f, 2g, 2h]
	 *     [1a, 1b, 1c, 1d, 1e, 1f, 1g, 1h] // white
	 * ]
	 */
	board // 8x8 array ([row][column])
	#chessUI
	constructor (boardDOM) {
		this.board = new ChessBoard()
		this.#chessUI = new ChessUI(this, boardDOM)
		this.#chessUI.initialize(this.board)
	}

	onDrag(pieceDOM) {
		//suggest pieces to move/take
		this.#chessUI.dragStart(pieceDOM)
		let pieceCode = pieceDOM.parentNode.dataset.id
		let hints = this.board.getPieceByCode(pieceCode).possibleMoves(this.board, pieceCode)
		this.#chessUI.hintSquares(hints)
	}

	onMove(from, to) {
		let piece = this.board.getPieceByCode(from)
		if (piece.canMoveTo(this.board, from, to)) {
			this.move(from, to)
			if (from === "c")
				this.#chessUI.hideCenterSquare()
		}
		if (piece.canTakeTo(this.board, from, to))
			this.take(from, to)
	}

	move(from, to) {
		if (from === to) return

		this.board.move(from, to)
		this.#chessUI.move(from, to)
	}

	take(from, to, takeDest) {
		if (from === to) return

		if (takeDest !== undefined)
			this.move(to, takeDest)

		this.board.take(from, to)
		this.#chessUI.take(from, to)
	}

	onDragCancel() {
		this.#chessUI.dragCancel()
		this.#chessUI.unHint()
	}
}

class ChessBoard {
	board
	constructor () {
		this.initialize()
	}

	initialize() {
		// board
		this.board = {}
		for (const row of Object.keys(rowMarks)) {
			this.board[row] = {}
			for (const column of Object.keys(columnMarks)) {
				this.board[row][column] = null
			}
		}

		// board pieces
		this.board["0"] = {}
		this.board["0"]["0"] = new Bear()
		this.board["0"]["1"] = null // left/white jail top
		this.board["0"]["2"] = null // left/white jail bottom
		this.board["0"]["3"] = null // right/black jail top
		this.board["0"]["4"] = null // right/black jail bottom
		// white
		this.board["1"]["a"] = new Rook("w")
		this.board["1"]["b"] = new Monkey("w")
		this.board["1"]["c"] = new Fishy("w")
		this.board["1"]["d"] = new Queen("w")
		this.board["1"]["e"] = new King("w")
		this.board["1"]["f"] = new Fishy("w")
		this.board["1"]["g"] = new Monkey("w")
		this.board["1"]["h"] = new Rook("w")
		this.board["2"]["a"] = new Fishy("w")
		this.board["2"]["b"] = new Fishy("w")
		this.board["2"]["c"] = new Elephant("w")
		this.board["2"]["d"] = new Fishy("w")
		this.board["2"]["e"] = new Fishy("w")
		this.board["2"]["f"] = new Elephant("w")
		this.board["2"]["g"] = new Fishy("w")
		this.board["2"]["h"] = new Fishy("w")
		// black
		this.board["8"]["a"] = new Rook("b")
		this.board["8"]["b"] = new Monkey("b")
		this.board["8"]["c"] = new Fishy("b")
		this.board["8"]["d"] = new Queen("b")
		this.board["8"]["e"] = new King("b")
		this.board["8"]["f"] = new Fishy("b")
		this.board["8"]["g"] = new Monkey("b")
		this.board["8"]["h"] = new Rook("b")
		this.board["7"]["a"] = new Fishy("b")
		this.board["7"]["b"] = new Fishy("b")
		this.board["7"]["c"] = new Elephant("b")
		this.board["7"]["d"] = new Fishy("b")
		this.board["7"]["e"] = new Fishy("b")
		this.board["7"]["f"] = new Elephant("b")
		this.board["7"]["g"] = new Fishy("b")
		this.board["7"]["h"] = new Fishy("b")
	}

	static splitCode(code) {
		let row = code.substring(0, 1)
		let column = code.substring(1, 2)
		return [row, column]
	}

	static createCode(row, column) {
		return row + "" + column
	}

	getPiece(row, column) {
		return this.board[row][column]
	}

	getPieceByCode(code) {
		if (code === "c")
			return this.getPiece("0", "0")
		if (code.startsWith("j")) {
			if (code === "jl1")
				return this.getPiece("0", "1")
			if (code === "jl2")
				return this.getPiece("0", "2")
			if (code === "jr1")
				return this.getPiece("0", "3")
			if (code === "jr2")
				return this.getPiece("0", "4")
		}

		let [row, column] = ChessBoard.splitCode(code)

		return this.getPiece(row, column)
	}

	setPiece(piece, row, column) {
		this.board[row][column] = piece
	}

	setPieceByCode(piece, code) {
		if (code === "c")
			return this.setPiece("0", "0")
		if (code.startsWith("j")) {
			if (code === "jl1")
				return this.getPiece("0", "1")
			if (code === "jl2")
				return this.getPiece("0", "2")
			if (code === "jr1")
				return this.getPiece("0", "3")
			if (code === "jr2")
				return this.getPiece("0", "4")
		}

		let [row, column] = ChessBoard.splitCode(code)

		this.board[row][column] = piece
	}

	move(from, to) {
		if (this.getPieceByCode(to) !== null)
			throw new Error("Can't move to " + to)

		let piece = this.getPieceByCode(from)
		this.setPieceByCode(piece, to)
		this.setPieceByCode(null, from)
	}

	take(from, to) {
		if (this.getPieceByCode(to) === null)
			throw new Error("Can't take " + to + ". Has no piece to take")

		this.setPieceByCode(null, to)
		this.move(from, to)
	}

	isOccupied(row, column) {
		return this.board[row][column] !== null
	}

	isOccupiedByCode(code) {
		let [row, column] = ChessBoard.splitCode(code)

		return this.board[row][column] !== null
	}

	isTakable(row, column, color) {
		return this.isTakableByCode(ChessBoard.createCode(row, column), color)
	}

	isTakableByCode(code, color) {
		let piece = this.getPieceByCode(code)

		if (piece === null) return false
		if (piece.color === color) return false

		return true
	}

	static codeToVec(code) {
		let [row, column] = ChessBoard.splitCode(code)

		if (!(Object.keys(rowMarks).includes(row) && Object.keys(columnMarks).includes(column)))
			return null

		return new Vec2(columnMarks[column], rowMarks[row])
	}

	static vecToCode(vec) {
		if (!(Object.values(rowMarks).includes(vec.y) && Object.values(columnMarks).includes(vec.x)))
			return null

		let row = Object.entries(rowMarks).filter(([key, value]) => value === vec.y)[0][0]
		let column = Object.entries(columnMarks).filter(([key, value]) => value === vec.x)[0][0]


		return row + column
	}

	static getPos(row, column, vec) {
		return ChessBoard.getPosByCode(ChessBoard.createCode(row, column), vec)
	}

	static getPosByCode(code, vec) {
		let vec2 = ChessBoard.codeToVec(code)

		if (vec2 === null)
			return null

		let vecPos = vec2.add(vec)

		return ChessBoard.vecToCode(vecPos)
	}

	static getRelativePos(row, column, vec, color) {
		return ChessBoard.getRelativePosByCode(ChessBoard.createCode(row, column), vec, color)
	}

	static getRelativePosByCode(code, vec, color) {
		let tempVec = vec.clone()
		if (color === "b")
			tempVec.multiply(-1)
		return this.getPosByCode(code, tempVec)
	}

	toString() {
		let retString = "[\n"
		for (const row of Object.keys(rowMarks).reverse()) {
			retString += "  ["
			for (const column of Object.keys(columnMarks)) {
				retString += (this.board[row][column] !== null ? this.board[row][column] : "  ") + ","
			}
			retString = retString.slice(0, -1)
			retString += "]\n"
		}
		retString += "]\n"
		return retString
	}
}

class ChessUI {
	#boardDOM
	#chess
	#isDragging
	#draggingDOM
	#hinted
	constructor (chess, boardDOM) {
		this.#chess = chess
		this.#boardDOM = boardDOM
		this.#isDragging = false
		this.#draggingDOM = null
		this.#hinted = []
	}

	initialize(board) {
		// visual board
		let squares = this.#boardDOM.querySelector(".squares")
		for (const row of Object.keys(rowMarks)) {
			for (const column of Object.keys(columnMarks)) {
				let piece = board.board[row][column]
				if (piece !== null)
					squares.querySelector("[data-id='" + row + column + "']").innerHTML = piece.toHTML()
			}
		}
		squares.querySelector("[data-id='c']").innerHTML = board.board["0"]["0"].toHTML()


		// append actionlistners
		this.#boardDOM.querySelectorAll(".piece").forEach((piece) => {
			piece.addEventListener("mousedown", (e) => {
				e.preventDefault();
				this.#chess.onDrag(piece)
				this.#dragMove(new Vec2(e.clientX, e.clientY))
			})
		})
		this.#boardDOM.querySelectorAll(".square").forEach((square) => {
			square.addEventListener("mouseover", (e) => {
				if (this.#isDragging)
					square.classList.add("dropping")
			})
			square.addEventListener("mouseleave", (e) => {
				if (this.#isDragging)
					square.classList.remove("dropping")
			})
			square.addEventListener("mouseup", (e) => {
				if (this.#isDragging) {
					square.classList.remove("dropping")

					let from = this.#draggingDOM.parentNode.dataset.id
					let to = square.dataset.id

					this.#chess.onMove(from, to)
				}
			})
		})
		document.addEventListener("mouseup", (e) => {
			this.#chess.onDragCancel()
		})
		document.addEventListener("mousemove", (e) => {
			if (this.#isDragging)
				this.#dragMove(new Vec2(e.clientX, e.clientY))
		})
	}

	hideCenterSquare() {
		/* bear exception */
		this.#boardDOM.querySelector(".squares").querySelector("[data-id='c']").classList.add("hidden")
	}

	dragStart(piece) {
		if (this.#isDragging)
			this.#chess.onDragCancel()

		piece.classList.add("dragging")
		this.#isDragging = true
		this.#draggingDOM = piece
	}

	hintSquares(squares) {
		for (const code of squares[0]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("moveable")
		}
		for (const code of squares[1]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("takeable")
		}
		this.#hinted = squares
	}

	unHint() {
		if (this.#hinted.length === 0)
			return

		for (const code of this.#hinted[0]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.remove("moveable")
		}
		for (const code of this.#hinted[1]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.remove("takeable")
		}
		this.#hinted = []
	}

	dragCancel() {
		this.#drag_reset()
	}

	#drag_reset() {
		if (this.#draggingDOM != null) {
			this.#draggingDOM.classList.remove("dragging")
			this.#draggingDOM.style.left = ""
			this.#draggingDOM.style.top = ""
			this.#draggingDOM = null
		}
		this.originPos = Vec2.zero
		this.#isDragging = false
	}

	#dragMove(pos) {
		if (!this.#draggingDOM instanceof HTMLElement
			|| !pos instanceof Vec2)
			throw new Error("something went wrong somewhere!")

		this.#draggingDOM.style.left = pos.x + "px"
		this.#draggingDOM.style.top = pos.y + "px"
	}

	move(from, to) {
		let fromPieceDOM = this.#boardDOM.querySelector("[data-id='" + from + "'] .piece")
		let toContainerDOM = this.#boardDOM.querySelector("[data-id='" + to + "']")
		toContainerDOM.appendChild(fromPieceDOM)
	}

	take(from, to) {
		let toContainerDOM = this.#boardDOM.querySelector("[data-id='" + to + "']")
		toContainerDOM.innerHTML = ""
		this.move(from, to)
	}
}

class Piece {
	color
	type
	hasBanana

	code = () => `${this.color}${this.type}${this.hasBanana ? "^" : ""}`
	name = () => `${Piece.#COLORS[this.color]} ${Piece.#TYPES[this.type]}${this.hasBanana ? " with banana" : ""}`

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
		if (type === "b") { // bear exeption
			this.type = type
			this.color = ""
			Piece.#TYPES[this.type = "b"]
			return
		}

		this.type = type
		this.color = color
		if (banana)
			this.hasBanana = true;
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
		let possibleMoves = this.possibleMoves(board, pos)
		return possibleMoves[0].includes(to)
	}

	canTakeTo(board, pos, to) {
		let possibleMoves = this.possibleMoves(board, pos)
		return possibleMoves[1].includes(to)
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
	constructor (color) {
		super("k", color)
	}

	possibleMoves(board, pos) {
		let returnArr = [[], []] // returnArr[0] = [...moves]; returnArr[1] = [...takes]

		let relPos = [
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, 1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, 0), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, -1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, -1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, 0), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, 1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, 1), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupiedByCode(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakableByCode(code, this.color)) {
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
				let code = ChessBoard.getRelativePosByCode(pos, tempVec, this.color)

				if (code == null)
					return
				if (!board.isOccupiedByCode(code)) {
					returnArr[0].push(code)
					continue
				}
				if (board.isTakableByCode(code, this.color)) {
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
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, 1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, 1), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupiedByCode(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakableByCode(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		relPos = [
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, 0), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, 0), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupiedByCode(code)) {
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
				let code = ChessBoard.getRelativePosByCode(pos, tempVec, this.color)

				if (code == null)
					return
				if (!board.isOccupiedByCode(code)) {
					returnArr[0].push(code)
					continue
				}
				if (board.isTakableByCode(code, this.color)) {
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
			ChessBoard.getRelativePosByCode(pos, new Vec2(-2, -2), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(2, 2), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(2, -2), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-2, 2), this.color)
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupiedByCode(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakableByCode(code, this.color)) {
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
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, 0), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, 0), this.color)
		].filter((code) => code != null)

		// TODO: rook can only take if other color took something of you in the previous turn
		relPos.forEach((code) => {
			if (board.isTakableByCode(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		Object.keys(rowMarks).forEach((row) => {
			Object.keys(columnMarks).forEach((column) => {
				let code = ChessBoard.createCode(row, column)
				if (!board.isOccupiedByCode(code))
					returnArr[0].push(code)
			})
		})

		return returnArr
	}
}

class Monkey extends Piece {
	constructor (color) {
		super("m", color)
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
			let code = ChessBoard.getRelativePosByCode(pos, vec, this.color)

			if (code == null)
				return
			if (!board.isOccupiedByCode(code)) {
				returnArr[0].push(code)
				return
			}

			code = ChessBoard.getRelativePosByCode(pos, vec.clone().multiply(2), this.color)

			if (code == null)
				return
			if (!board.isOccupiedByCode(code)) {
				returnArr[0].push(code)
				return
			}
			if (board.isTakableByCode(code, this.color)) {
				returnArr[1].push(code)
				return
			}
		})

		let swaps = {
			"5h": "jr1",
			"4h": "jr2",
			"5a": "jl1",
			"4a": "jl2"
		}
		
		
		
		if (this.color === "w" && pos === "5h") {
			let jailPiece = board.getPieceByCode("jr1")
			if (jailPiece !== null)
				if (jailPiece.hasBanana())
					returnArr[1].push("jr1")
		}
		if (this.color === "w" && pos === "4h") {
			let jailPiece = board.getPieceByCode("jr2")
			if (jailPiece !== null)
				if (jailPiece.hasBanana())
					returnArr[1].push("jr2")
		}
		if (this.color === "b" && pos === "5a") {
			let jailPiece = board.getPieceByCode("jl1")
			if (jailPiece !== null)
				if (jailPiece.hasBanana())
					returnArr[1].push("jl1")
		}
		if (this.color === "b" && pos === "4a") {
			let jailPiece = board.getPieceByCode("jl2")
			if (jailPiece !== null)
				if (jailPiece.hasBanana())
					returnArr[1].push("jl2")
		}
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
			returnArr[0] = codes.filter((code) => !board.isOccupiedByCode(code))
			return returnArr
		}

		let relPos = [
			ChessBoard.getRelativePosByCode(pos, new Vec2(1, 0), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, -1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(0, 1), this.color),
			ChessBoard.getRelativePosByCode(pos, new Vec2(-1, 0), this.color),
		].filter((code) => code != null)

		relPos.forEach((code) => {
			if (!board.isOccupiedByCode(code))
				returnArr[0].push(code)
		})
		return returnArr
	}
}