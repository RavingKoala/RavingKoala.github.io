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
		this.board["0"]["4"] = null  // right/black jail bottom
		// white
		this.board["1"]["a"] = new Rook("w")
		this.board["1"]["b"] = new Monkey("w")
		this.board["1"]["c"] = new Fishy("w")
		this.board["1"]["d"] = new Queen("w")
		this.board["1"]["e"] = new King("w", true)
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
		this.board["8"]["e"] = new King("b", true)
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