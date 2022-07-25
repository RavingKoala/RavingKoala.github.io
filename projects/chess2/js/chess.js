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
var pieces = {

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
		this.#chessUI.initialize(this.board.board)
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
		if (piece.canMoveTo(this.board, from, to))
			this.move(from, to)
	}

	move(from, to) {
		if (from === to) return

		this.board.move(from, to)
		this.#chessUI.move(from, to)
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

	getPiece(row, column) {
		return this.board[row][column]
	}

	getPieceByCode(code) {
		//TODO: add if starts with j => its jail
		//TODO: add if starts with c => center (for bear)
		let row = code.substring(0, 1)
		let column = code.substring(1, 2)

		return this.getPiece(row, column)
	}

	setPiece(piece, row, column) {
		this.board[row][column] = piece
	}

	setPieceByCode(piece, code) {
		let row = code.substring(0, 1)
		let column = code.substring(1, 2)

		this.board[row][column] = piece
	}

	move(from, to) {
		let piece = this.getPieceByCode(from)
		this.setPieceByCode(piece, to)
		this.setPieceByCode(null, from)
	}
	
	isOccupied(row, column) {
		return this.board[row][column] !== null
	}
	
	isOccupiedByCode(code) {
		let row = code.substring(0, 1)
		let column = code.substring(1, 2)
		return this.board[row][column] !== null
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
		for (const [row, rowArr] of Object.entries(board)) {
			for (const [column, value] of Object.entries(rowArr)) {
				if (value !== null)
					squares.querySelector("[data-id='" + row + column + "']").innerHTML = value.toHTML()
			}
		}

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
			console.log(this.#chess.board.toString());
		})
		document.addEventListener("mousemove", (e) => {
			if (this.#isDragging)
				this.#dragMove(new Vec2(e.clientX, e.clientY))
		})
	}

	dragStart(piece) {
		if (this.#isDragging)
			this.#chess.onDragCancel()

		piece.classList.add("dragging")
		this.#isDragging = true
		this.#draggingDOM = piece
	}

	hintSquares(squares) {
		for (const code of squares) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("moveable")
		}
		this.#hinted = squares
	}

	unHint() {
		console.log(this.#hinted);
		for (const code of this.#hinted) {
			let tempDOM2 = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM2.classList.remove("moveable")
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
		this.isDragging = false
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
		"qf": "queen fishy",
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

	canMoveTo(board, pos, to) {// pos is Vec2; to is relative
		throw new Error('Method not implemented.');

	}

	possibleMoves(board, pos) { // return [ moves ] (or maybe returns [[moves], [takes]]?)
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

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}

class Queen extends Piece {
	constructor (color) {
		super("q", color)
	}

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}

class Fishy extends Piece {
	constructor (color) {
		super("f", color)
	}

	canMoveTo(board, pos, to) {
		return this.possibleMoves(board, pos).includes(to)
	}

	possibleMoves(board, pos) {
		let currentRow = pos.substring(0, 1)
		let currentColumn = pos.substring(1, 2)
		let returnArr = []
		for (const row of Object.keys(rowMarks).reverse()) {
			for (const column of Object.keys(columnMarks)) {
				if (row !== currentRow || column !== currentColumn)
					returnArr.push(row + column)
			}
		}
		return returnArr
	}
}

class QueenFishy extends Piece {
	constructor (color) {
		super("qf", color)
	}

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}

class Elephant extends Piece {
	constructor (color) {
		super("e", color)
	}

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}

class Rook extends Piece {
	constructor (color) {
		super("r", color)
	}

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}

class Monkey extends Piece {
	constructor (color) {
		super("m", color)
	}

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}

class Bear extends Piece {
	constructor () {
		super("b")
	}

	canMoveTo(board, pos, to) {
		throw new Error('Method not implemented.');
	}

	possibleMoves(board, pos) {
		throw new Error('Method not implemented.');
	}
}