const rowMarks = {
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
}
const columnMarks = {
	"a": 1,
	"b": 2,
	"c": 3,
	"d": 4,
	"e": 5,
	"f": 6,
	"g": 7,
	"h": 8,
}
const Side = {
	"white": 0,
	"black": 1
}

class ChessBoard {
	#board
	constructor () {
		this.#initialize()
	}

	#initialize() {

		/*
		[
			[br,bm,bf,bq,bk,bf,bm,br]
			[bf,bf,be,bf,bf,be,bf,bf]
			[  ,  ,  ,  ,  ,  ,  ,  ]
		[  ][  ,  ,  ,  ,  ,  ,  ,  ][  ]
		[  ][  ,  ,  ,  ,  ,  ,  ,  ][  ]
			[  ,  ,  ,  ,  ,  ,  ,  ]
			[wf,wf,we,wf,wf,we,wf,wf]
			[wr,wm,wf,wq,wk,wf,wm,wr]
		]
		*/

		// board
		this.#board = {}
		for (const row of Object.keys(rowMarks)) {
			this.#board[row] = {}
			for (const column of Object.keys(columnMarks)) {
				this.#board[row][column] = null
			}
		}
		// board pieces
		this.#board["0"] = {}
		this.#setPiece(new Bear(), "0", "0")
		this.#setPiece(null, "0", "1") // left/white jail top (row 5)
		this.#setPiece(null, "0", "2") // left/white jail bottom (row 4)
		this.#setPiece(null, "0", "3") // right/black jail top (row 5)
		this.#setPiece(null, "0", "4") // right/black jail bottom (row 4)
		// white
		this.#setPiece(new Rook("w"), "1", "a")
		this.#setPiece(new Monkey("w"), "1", "b")
		this.#setPiece(new Fishy("w"), "1", "c")
		this.#setPiece(new Queen("w"), "1", "d")
		this.#setPiece(new King("w", true), "1", "e")
		this.#setPiece(new Fishy("w"), "1", "f")
		this.#setPiece(new Monkey("w"), "1", "g")
		this.#setPiece(new Rook("w"), "1", "h")
		this.#setPiece(new Fishy("w"), "2", "a")
		this.#setPiece(new Fishy("w"), "2", "b")
		this.#setPiece(new Elephant("w"), "2", "c")
		this.#setPiece(new Fishy("w"), "2", "d")
		this.#setPiece(new Fishy("w"), "2", "e")
		this.#setPiece(new Elephant("w"), "2", "f")
		this.#setPiece(new Fishy("w"), "2", "g")
		this.#setPiece(new Fishy("w"), "2", "h")
		// black
		this.#setPiece(new Rook("b"), "8", "a")
		this.#setPiece(new Monkey("b"), "8", "b")
		this.#setPiece(new Fishy("b"), "8", "c")
		this.#setPiece(new Queen("b"), "8", "d")
		this.#setPiece(new King("b", true), "8", "e")
		this.#setPiece(new Fishy("b"), "8", "f")
		this.#setPiece(new Monkey("b"), "8", "g")
		this.#setPiece(new Rook("b"), "8", "h")
		this.#setPiece(new Fishy("b"), "7", "a")
		this.#setPiece(new Fishy("b"), "7", "b")
		this.#setPiece(new Elephant("b"), "7", "c")
		this.#setPiece(new Fishy("b"), "7", "d")
		this.#setPiece(new Fishy("b"), "7", "e")
		this.#setPiece(new Elephant("b"), "7", "f")
		this.#setPiece(new Fishy("b"), "7", "g")
		this.#setPiece(new Fishy("b"), "7", "h")
	}

	static splitCode(code) {
		let row = code.substring(0, 1)
		let column = code.substring(1, 2)
		return [row, column]
	}

	static createCode(row, column) {
		return row + "" + column
	}

	#getPiece(row, column) {
		return this.#board[row][column]
	}

	getCenterPiece() {
		return this.#getPiece("0", "0")
	}

	getJailPiece(code) {
		if (code === "jl1")
			return this.#getPiece("0", "1")
		if (code === "jl2")
			return this.#getPiece("0", "2")
		if (code === "jr1")
			return this.#getPiece("0", "3")
		if (code === "jr2")
			return this.#getPiece("0", "4")

		return null
	}

	getPiece(code) {
		if (code === "c")
			return this.getCenterPiece()
		if (code.startsWith("j"))
			return this.getJailPiece(code)

		let [row, column] = ChessBoard.splitCode(code)

		return this.#getPiece(row, column)
	}

	#setPiece(piece, row, column) {
		if (piece instanceof Piece)
			piece.position = ChessBoard.createCode(row, column)
		this.#board[row][column] = piece
	}

	setCenterPiece(piece) {
		return this.#setPiece(piece, "0", "0")
	}

	setJailPiece(piece, code) {
		if (code === "jl1")
			return this.#setPiece(piece, "0", "1")
		if (code === "jl2")
			return this.#setPiece(piece, "0", "2")
		if (code === "jr1")
			return this.#setPiece(piece, "0", "3")
		if (code === "jr2")
			return this.#setPiece(piece, "0", "4")
	}

	setPiece(piece, code) {
		if (code === "c")
			return this.setCenterPiece(piece)
		if (code.startsWith("j"))
			return this.setJailPiece(piece, code)

		let [row, column] = ChessBoard.splitCode(code)

		this.#setPiece(piece, row, column)
	}

	move(from, to) {
		if (this.getPiece(to) !== null)
			throw new Error("Can't move to " + to)

		let piece = this.getPiece(from)
		this.setPiece(piece, to)
		this.setPiece(null, from)
	}

	take(from, to) {
		if (this.getPiece(to) === null)
			throw new Error("Can't take " + to + ". Has no piece to take")

		this.setPiece(null, to)
		this.move(from, to)
	}

	isOccupied(code) {
		let piece = this.getPiece(code)

		return piece !== null
	}

	isTakable(code, color) {
		let piece = this.getPiece(code)

		if (piece === null) return false
		if (piece.color === color) return false

		return true
	}
	
	static #whiteSquares
	isWhiteSquare(code) {
		if (ChessBoard.#whiteSquares === undefined)
			return ChessBoard.#whiteSquares.includes(code)
			
		let whiteSquares = []
		Object.entries(rowMarks).forEach( ([row, rowNr]) => {
			Object.entries(columnMarks).forEach(([column, columnNr]) => {
				if (rowNr % 2 === 0 && columnNr % 2 === 1)
					return whiteSquares.push(this.createCode(row, column))
				if (rowNr % 2 === 1 && columnNr % 2 === 0)
					return whiteSquares.push(this.createCode(row, column))
			});
		});
		
		whiteSquares.push("jl1", "jr2")
		
		ChessBoard.#whiteSquares = whiteSquares
	}
	
	isBlackSquare(code) {
		return !this.isWhiteSquare(code)
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

	static getPos(code, vec) {
		let vec2 = ChessBoard.codeToVec(code)

		if (vec2 === null) return null

		let vecPos = vec2.add(vec)

		return ChessBoard.vecToCode(vecPos)
	}

	static getRelativePos(code, vec, color) {
		let tempVec = vec.clone()
		if (color === "b")
			tempVec.multiply(-1)
		return this.getPos(code, tempVec)
	}

	toString() {
		let getPieceStr = (code) => {
			let piece = this.getPiece(code)
			return (piece !== null ? piece : "  ")
		}

		let retString = "[\n"
		for (const row of Object.keys(rowMarks).reverse()) {
			if (row === "5")
				retString += "[" + getPieceStr("jl1") + "]["
			else if (row === "4")
				retString += "[" + getPieceStr("jl2") + "]["
			else
				retString += "    ["
			for (const column of Object.keys(columnMarks)) {
				let code = ChessBoard.createCode(row, column)
				retString += getPieceStr(code) + ","
			}
			retString = retString.slice(0, -1)
			if (row === "5")
				retString += "[" + getPieceStr("jr1") + "]\n"
			else if (row === "4")
				retString += "[" + getPieceStr("jr2") + "]\n"
			else
				retString += "]\n"
		}
		retString += "]\n"
		return retString
	}
}