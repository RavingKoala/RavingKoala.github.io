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
	#hash
	static #boardPositionsTable // {"1awF": 0, 1bwF, 1, ...} // TODO: optimize this so it looks like {F: {w: {a: {1: {}, ...}, ...}, ...}, ...}
	constructor () {
		this.#board = {}
		this.#piecesLookup = null
		this.#hash = null

		this.#initializeBoard()
	}

	get hash() {
		if (positionsMap === undefined)
			throw new Error("positionsMap not found!")

		ChessBoard.#validateBoardPositionsTable()
		this.#validateLookup()
		this.#validateHash()

		return this.#hash
	}

	#validateHash() {
		if (this.#hash === null)
			this.#createHash()
	}

	static #validateBoardPositionsTable() {
		if (ChessBoard.boardPositionsTable !== undefined) return

		ChessBoard.#boardPositionsTable = {}; // a boardPositionsTable for all possible positions of pieces on the board
		Object.entries(positionsMap).forEach(([i, code]) => {
			ChessBoard.#boardPositionsTable[code] = parseInt(i)
		});
	}

	static #LookUpPositionMap(pos, type, color) {
		if (pos === "c") return 1124 // can only be 'cB'
		let key = pos + color + type
		return ChessBoard.#boardPositionsTable[pos + color + type]
	}

	#createHash() {
		let hash = 0
		for (const [type, piecesArr] of Object.entries(this.#piecesLookup)) {
			for (const pos of piecesArr) {
				let piece = this.getPiece(pos)

				let type = piece.type
				if (piece.hasBanana) type += "^"

				let num = ChessBoard.#LookUpPositionMap(piece.position, type, piece.color)

				hash += num
			}
		}
		this.#hash = hash
	}

	static baseDecToHex(num) {
		return num.toString(16); // TODO: test base 36 ;p
	}

	static baseHexToDec(numStr) {
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
		for (const column of Object.keys(ChessBoard.columnMarks)) {
			this.#board[column] = {}
			for (const row of Object.keys(ChessBoard.rowMarks)) {
				this.#board[column][row] = null
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
		this.#setPiece(new Rook("w"), "a", "1")
		this.#setPiece(new Monkey("w"), "b", "1")
		this.#setPiece(new Fishy("w"), "c", "1")
		this.#setPiece(new Queen("w"), "d", "1")
		this.#setPiece(new King("w", true), "e", "1")
		this.#setPiece(new Fishy("w"), "f", "1")
		this.#setPiece(new Monkey("w"), "g", "1")
		this.#setPiece(new Rook("w"), "h", "1")
		this.#setPiece(new Fishy("w"), "a", "2")
		this.#setPiece(new Fishy("w"), "b", "2")
		this.#setPiece(new Elephant("w"), "c", "2")
		this.#setPiece(new Fishy("w"), "d", "2")
		this.#setPiece(new Fishy("w"), "e", "2")
		this.#setPiece(new Elephant("w"), "f", "2")
		this.#setPiece(new Fishy("w"), "g", "2")
		this.#setPiece(new Fishy("w"), "h", "2")
		// black
		this.#setPiece(new Rook("b"), "a", "8")
		this.#setPiece(new Monkey("b"), "b", "8")
		this.#setPiece(new Fishy("b"), "c", "8")
		this.#setPiece(new Queen("b"), "d", "8")
		this.#setPiece(new King("b", true), "e", "8")
		this.#setPiece(new Fishy("b"), "f", "8")
		this.#setPiece(new Monkey("b"), "g", "8")
		this.#setPiece(new Rook("b"), "h", "8")
		this.#setPiece(new Fishy("b"), "a", "7")
		this.#setPiece(new Fishy("b"), "b", "7")
		this.#setPiece(new Elephant("b"), "c", "7")
		this.#setPiece(new Fishy("b"), "d", "7")
		this.#setPiece(new Fishy("b"), "e", "7")
		this.#setPiece(new Elephant("b"), "f", "7")
		this.#setPiece(new Fishy("b"), "g", "7")
		this.#setPiece(new Fishy("b"), "h", "7")
	}

	static splitCode(code) {
		if (code === "c") return ["0", "0"]
		if (code === "wj5") return ["0", "1"]
		if (code === "wj4") return ["0", "2"]
		if (code === "bj5") return ["0", "3"]
		if (code === "bj4") return ["0", "4"]
		let column = code.substring(0, 1)
		let row = code.substring(1, 2)
		return [column, row]
	}

	static createCode(column, row) {
		if (column === "0" || column === 0) {
			if (row === "0" || row === 0) return "c"
			if (row === "1" || row === 1) return "wj5"
			if (row === "2" || row === 2) return "wj4"
			if (row === "3" || row === 3) return "bj5"
			if (row === "4" || row === 4) return "bj4"
		}

		return column + "" + row
	}

	#getPiece(column, row) {
		return this.#board[column][row]
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

		let [column, row] = ChessBoard.splitCode(code)

		return this.#getPiece(column, row)
	}

	#setPiece(piece, column, row) {
		if (piece instanceof Piece)
			piece.position = ChessBoard.createCode(column, row)
		this.#board[column][row] = piece
		this.#piecesLookup = null // invalidate lookuptable // TODO: invalidate only if piece === null (should create method removePiece to call if is null)
		this.#hash = null // invalidate hash
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

		let [column, row] = ChessBoard.splitCode(code)

		this.#setPiece(piece, column, row)
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
		Object.entries(ChessBoard.columnMarks).forEach(([column, columnNr]) => {
			Object.entries(ChessBoard.rowMarks).forEach(([row, rowNr]) => {
				if (columnNr % 2 === 1 && rowNr % 2 === 0)
					return whiteSquares.push(ChessBoard.createCode(column, row))
				if (columnNr % 2 === 0 && rowNr % 2 === 1)
					return whiteSquares.push(ChessBoard.createCode(column, row))
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

		for (const type of Object.keys(Piece.TYPES))
			this.#piecesLookup[type] = []

		let addToLookup = (piece, pos) => {
			if (piece !== null && piece instanceof Piece)
				this.#piecesLookup[piece.type].push(pos)
		}

		for (const column of Object.keys(ChessBoard.columnMarks)) {
			for (const row of Object.keys(ChessBoard.rowMarks)) {
				let pos = ChessBoard.createCode(column, row)
				let piece = this.getPiece(pos)
				addToLookup(piece, pos)
			}
		}
		addToLookup(this.getCenterPiece(), "c")
		addToLookup(this.getJailPiece("wj5"), "wj5")
		addToLookup(this.getJailPiece("wj4"), "wj4")
		addToLookup(this.getJailPiece("bj5"), "bj5")
		addToLookup(this.getJailPiece("bj4"), "bj4")
	}

	#validateLookup() {
		if (this.#piecesLookup !== null)
			return

		this.#generateLookup(board)
	}

	#canMakeMove(piece, from, to) {
		if (!this.isOccupied(to))
			return piece.canMoveTo(this, from, to) // is move
		else
			return piece.canTakeTo(this, from, to) // is take
		
	}

	typeCanMakeMove(type, to, color = null) {
		this.#validateLookup()
		
		let retArr = []
		for (const pos of this.#piecesLookup[type]){
			let piece = this.getPiece(pos)
			if ((color === null || piece.color === color))
				if (this.#canMakeMove(piece, piece.position, to))
					retArr.push(pos)
		}
		return retArr
	}

	allCanMakeMove(to, color = null) {
		let retArr = []
		for (const type of Object.keys(this.#piecesLookup)) {
			retArr.concat(typeCanMakeMove(type, to, color))
		}
		return retArr
	}
	
	updatePiecesSpecialConditions(obj) {
		this.#validateLookup()
		
		if (obj.hasOwnProperty("lastMove")) {
			this.#piecesLookup["R"].forEach((pos) => {
				this.getPiece(pos).lastMove = obj.lastMove
			})
		}
	}

	static codeToVec(code) {
		let [column, row] = ChessBoard.splitCode(code)

		if ( !Object.keys(ChessBoard.columnMarks).includes(column) || !Object.keys(ChessBoard.rowMarks).includes(row))
			return null

		return new Vec2(ChessBoard.columnMarks[column], ChessBoard.rowMarks[row])
	}

	static vecToCode(vec) {
		if (!Object.values(ChessBoard.columnMarks).includes(vec.x) || !Object.values(ChessBoard.rowMarks).includes(vec.y))
			return null

		let column = Object.entries(ChessBoard.columnMarks).filter(([key, value]) => value === vec.x)[0][0]
		let row = Object.entries(ChessBoard.rowMarks).filter(([key, value]) => value === vec.y)[0][0]

		return column + "" + row
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
				let code = ChessBoard.createCode(column, row)
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