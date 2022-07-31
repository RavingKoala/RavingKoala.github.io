class ChessBoard {
	/* enums */
	static rowMarks = {
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
		7: 7,
		8: 8,
	}
	static columnMarks = {
		a: 1,
		b: 2,
		c: 3,
		d: 4,
		e: 5,
		f: 6,
		g: 7,
		h: 8,
	}

	#board
	#piecesLookup // {"F": [a2,b2, ...], ...}
	static #boardPositionsTable // {"1awF": 0, 1bwF, 1, ...}
	constructor () {
		this.#board = {}
		this.#piecesLookup = null

		this.#initializeBoard()
	}

	get hash() {
		if (positionsMap === undefined)
			throw new Error("positionsMap not found!")
		ChessBoard.#validateBoardPositionsTable()

		this.#validateLookup()

		return this.#createHash()
	}

	static #validateBoardPositionsTable() {
		if (ChessBoard.boardPositionsTable !== undefined) return

		ChessBoard.#boardPositionsTable = {}; // a boardPositionsTable for all possible positions of pieces on the board
		Object.entries(positionsMap).forEach(([i, code]) => {
			ChessBoard.#boardPositionsTable[code] = parseInt(i)
		});
	}

	static #LookUpPositionMapHard(pos, type, color) { // may be good for deprication later
		if (pos === "c") return 1124 // can only be cB
		if (pos.includes("j")) {
			return ChessBoard.#boardPositionsTable[864]
		}
		
	}

	static #LookUpPositionMap(pos, type, color) {
		if (pos === "c") return 864 // can only be cB
		if (pos.includes("j")) {
			return ChessBoard.#boardPositionsTable[864]
		}
		
	}

	#createHash() {
		let hash = 0
		// console.log(this.#piecesLookup);
		for (const [type, piecesArr] of Object.entries(this.#piecesLookup)) {
			for (const pos of piecesArr) {
				// console.log(pos);
				let piece = this.getPiece(pos)
				// console.log(piece);
				let type = piece.type
				if (piece.hasBanana) type += "^"
				hash += parseInt(ChessBoard.#LookUpPositionMap(piece.position, type, piece.color))
			}
		}
		return hash
	}

	baseDecToHex(num) {
		return num.toString(16); // TODO: test base 36 ;p
	}

	baseHexToDec(numStr) {
		return parseInt(numStr, 16);
	}

	#initializeBoard() {

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
		for (const row of Object.keys(ChessBoard.rowMarks)) {
			this.#board[row] = {}
			for (const column of Object.keys(ChessBoard.columnMarks)) {
				this.#board[row][column] = null
			}
		}
		// board pieces
		this.#board["0"] = {}
		this.setCenterPiece(new Bear())
		this.setJailPiece(null, "wj5") // left/white jail top (row 5)
		this.setJailPiece(null, "wj4") // left/white jail bottom (row 4)
		this.setJailPiece(null, "bj5") // right/black jail top (row 5)
		this.setJailPiece(null, "bj4") // right/black jail bottom (row 4)
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
		if (code === "c") return ["0", "0"]
		if (code === "wj5") return ["0", "1"]
		if (code === "wj4") return ["0", "2"]
		if (code === "bj5") return ["0", "3"]
		if (code === "bj4") return ["0", "4"]
		let row = code.substring(0, 1)
		let column = code.substring(1, 2)
		return [row, column]
	}

	static createCode(row, column) {
		if (row === "0" || row === 0) {
			if (column === "0" || column === 0) return "c"
			if (column === "1" || column === 1) return "wj5"
			if (column === "2" || column === 2) return "wj4"
			if (column === "3" || column === 3) return "bj5"
			if (column === "4" || column === 4) return "bj4"
		}

		return row + "" + column
	}

	#getPiece(row, column) {
		return this.#board[row][column]
	}

	getCenterPiece() {
		return this.#getPiece("0", "0")
	}

	getJailPiece(code) {
		if (code === "wj5")
			return this.#getPiece("0", "1")
		if (code === "wj4")
			return this.#getPiece("0", "2")
		if (code === "bj5")
			return this.#getPiece("0", "3")
		if (code === "bj4")
			return this.#getPiece("0", "4")

		return null
	}

	getPiece(code) {
		if (code === "c")
			return this.getCenterPiece()
		if (code.includes("j"))
			return this.getJailPiece(code)

		let [row, column] = ChessBoard.splitCode(code)

		return this.#getPiece(row, column)
	}

	#setPiece(piece, row, column) {
		if (piece instanceof Piece)
			piece.position = ChessBoard.createCode(row, column)
		this.#board[row][column] = piece
		this.#piecesLookup = null // invalid lookuptable
	}

	setCenterPiece(piece) {
		return this.#setPiece(piece, "0", "0")
	}

	setJailPiece(piece, code) {
		if (code === "wj5")
			return this.#setPiece(piece, "0", "1")
		if (code === "wj4")
			return this.#setPiece(piece, "0", "2")
		if (code === "bj5")
			return this.#setPiece(piece, "0", "3")
		if (code === "bj4")
			return this.#setPiece(piece, "0", "4")

		throw new Error(code + " is not a jail code")
	}

	setPiece(piece, code) {
		if (code === "c")
			return this.setCenterPiece(piece)
		if (code.includes("j")) {
			return this.setJailPiece(piece, code)
		}

		let [row, column] = ChessBoard.splitCode(code)

		this.#setPiece(piece, row, column)
	}

	move(from, to) {
		if (from === to) return
		if (this.getPiece(to) !== null)
			throw new Error("Can't move from " + from + " to " + to)

		let piece = this.getPiece(from)
		this.setPiece(piece, to)
		this.setPiece(null, from)
	}

	take(from, to, force = false) {
		if (this.getPiece(to) === null && !force)
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
		if (ChessBoard.#whiteSquares !== undefined)
			return ChessBoard.#whiteSquares.includes(code)

		let whiteSquares = []
		Object.entries(ChessBoard.rowMarks).forEach(([row, rowNr]) => {
			Object.entries(ChessBoard.columnMarks).forEach(([column, columnNr]) => {
				if (rowNr % 2 === 0 && columnNr % 2 === 1)
					return whiteSquares.push(ChessBoard.createCode(row, column))
				if (rowNr % 2 === 1 && columnNr % 2 === 0)
					return whiteSquares.push(ChessBoard.createCode(row, column))
			});
		});

		whiteSquares.push("wj5", "bj4")

		ChessBoard.#whiteSquares = whiteSquares

		return ChessBoard.#whiteSquares.includes(code)
	}

	isBlackSquare(code) {
		return !this.isWhiteSquare(code)
	}

	#generateLookup() {
		this.#piecesLookup = {}

		for (const type of Object.values(Piece.TYPES))
			this.#piecesLookup[type] = []

		let addToLookup = (piece, pos) => {
			if (piece !== null && piece instanceof Piece)
				this.#piecesLookup[Piece.TYPES[piece.type]].push(pos)
		}

		for (const row of Object.keys(ChessBoard.rowMarks)) {
			for (const column of Object.keys(ChessBoard.columnMarks)) {
				let pos = ChessBoard.createCode(row, column)
				let piece = this.getPiece(pos)
				addToLookup(piece, pos)
			}
		}
		addToLookup(this.getCenterPiece())
		addToLookup(this.getJailPiece("wj5"))
		addToLookup(this.getJailPiece("wj4"))
		addToLookup(this.getJailPiece("bj5"))
		addToLookup(this.getJailPiece("bj4"))
	}

	#validateLookup() {
		if (this.#piecesLookup !== null)
			return

		this.#generateLookup(board)
	}

	canOnlyMakeMove(from, to) {
		this.#validateLookup()

		let piece = this.getPiece(from)

		if (!this.isOccupied(to)) { // is move
			for (const pos of this.#piecesLookup[Piece.TYPES[piece.type]]) {
				if (pos === from) continue
				if (piece.canMoveTo(this, pos, to)) // .constructor allows for static method call
					return false
			}
		} else { // is take
			for (const pos of this.#piecesLookup[Piece.TYPES[piece.type]]) {
				if (pos === from) continue
				if (piece.canTakeTo(this, pos, to)) // .constructor allows for static method call
					return false
			}
		}

		return true
	}

	static codeToVec(code) {
		let [row, column] = ChessBoard.splitCode(code)

		if (!(Object.keys(ChessBoard.rowMarks).includes(row) && Object.keys(ChessBoard.columnMarks).includes(column)))
			return null

		return new Vec2(ChessBoard.columnMarks[column], ChessBoard.rowMarks[row])
	}

	static vecToCode(vec) {
		if (!(Object.values(ChessBoard.rowMarks).includes(vec.y) && Object.values(ChessBoard.columnMarks).includes(vec.x)))
			return null

		let row = Object.entries(ChessBoard.rowMarks).filter(([key, value]) => value === vec.y)[0][0]
		let column = Object.entries(ChessBoard.columnMarks).filter(([key, value]) => value === vec.x)[0][0]

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

	static isCheck() {

	}

	static isCheckmate() {

	}

	toString() {
		let getPieceStr = (code) => {
			let piece = this.getPiece(code)

			return (piece !== null ? piece : "  ")
		}

		let retString = "[\n"
		for (const row of Object.keys(ChessBoard.rowMarks).reverse()) {
			if (row === "5")
				retString += "[" + getPieceStr("wj5") + "]["
			else if (row === "4")
				retString += "[" + getPieceStr("wj4") + "]["
			else
				retString += "    ["
			for (const column of Object.keys(ChessBoard.columnMarks)) {
				let code = ChessBoard.createCode(row, column)
				retString += getPieceStr(code) + ","
			}
			retString = retString.slice(0, -1)
			retString += "]"
			if (row === "5")
				retString += "[" + getPieceStr("bj5") + "]"
			else if (row === "4")
				retString += "[" + getPieceStr("bj4") + "]"

			retString += "\n"
		}
		retString += "]\n"
		return retString
	}
}