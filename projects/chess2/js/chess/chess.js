const ChessEvents = {
	onMove: "onMove", // piece, from, to
	onTake: "onTake", // pieceTaking, pieceTaken, from, to
	onMultiMove: "onMultiMove" // piece, origin, to
}

const sides = {
	white: "white",
	black: "black"
}

const states = {
	idle: "idle", // before and after game
	turn: "turn", // when it is the start of a turn and nothing happened yet
	waiting: "waiting", // waiting for the opponent to make a turn
	moving: "moving", // dragging a piece
	multiMove: "multiMove", // Multimoving a piece
	pickingJail: "pickingJail" // picking a jail for the Queen/King to go
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
	#board // 8x8 array ([row][column])
	#chessUI
	state
	#pickingPiece
	constructor (boardDOM) {
		this.#board = new ChessBoard()
		this.#chessUI = new ChessUI(this, boardDOM)
		this.state = states.idle

		this.initialize()
	}

	initialize() {
		this.#chessUI.initialize(this.#board)
		// set board rule
		// change fishy into fishy queen
		document.addEventListener(ChessEvents.onMove, (event) => {
			let piece = event.detail.piece
			let code = event.detail.currentPos
			if ((piece.code === "wf" && code.startsWith("8"))
				|| (piece.code === "bf" && code.startsWith("1"))) {
				this.#change(piece.code, (piece) => new FishyQueen(piece.color))
			}
		})
		document.addEventListener(ChessEvents.onTake, (event) => {
			let piece = event.detail.pieceTaking
			let code = event.detail.currentPos
			if ((piece.code === "wf" && code.startsWith("8"))
				|| (piece.code === "bf" && code.startsWith("1"))) {
				this.#change(code, (piece) => new FishyQueen(piece.color))
			}
		})
		// capture king/queen to jail
		document.addEventListener(ChessEvents.onTake, (event) => {
			let piece = event.detail.pieceTaken
			if (/[wb][qk]\^?/.test(piece.code)) { //regex for [white or black] [queen or king] maybe a banana
				console.trace(this.state, states.pickingJail)
				this.state = states.pickingJail
				this.#pickingPiece = piece
			}
		})
		document.addEventListener(ChessEvents.onMultiMove, (event) => {
			let piece = event.detail.piece
			let origin = event.detail.origin
			let to = event.detail.to
			this.#chessUI.unHint()
			let hints = piece.possibleMultiMoves(this.#board, to).splice(0, 2)
			hints[0].push(origin)
			this.#chessUI.hintSquares(to, hints)
		})
		// // console version
		// document.addEventListener(ChessEvents.onMove, (e) => {
		// 	console.clear()
		// 	console.log(this.#board.toString());
		// })
		// document.addEventListener(ChessEvents.onTake, (e) => {
		// 	console.clear()
		// 	console.log(this.#board.toString());
		// })
		// console.clear()
		// console.log(this.#board.toString());

		console.trace(this.state, states.turn)
		this.state = states.turn
	}

	onSquarePicked(code) {
		if (this.state !== states.pickingJail) return

		if ((/w[qk]\^?/.test(this.#pickingPiece.code) && /jl[12]/.test(code))
			|| (/b[qk]\^?/.test(this.#pickingPiece.code) && /jr[12]/.test(code))) {
			this.#board.setJailPiece(this.#pickingPiece, code)
			this.#chessUI.setPiece(this.#pickingPiece, code)
			console.trace(this.state, states.turn)
			this.state = states.turn
		}
	}

	onDrag(pieceDOM) {
		//suggest pieces to move/take
		this.#chessUI.dragStart(pieceDOM)
		let code = pieceDOM.parentNode.dataset.id

		let piece = this.#board.getPiece(code)
		let hints = piece.possibleMoves(this.#board, code)
		// check if multimove
		// if multimove give both multimove hints and normal hints
		if (piece.canMultiMove) {
			let multiMovesHints = piece.possibleMultiMoves(this.#board, code)
			hints[0] = hints[0].concat(multiMovesHints[0])
			hints[1] = hints[1].concat(multiMovesHints[1])
		}
		this.#chessUI.hintSquares(code, hints)

		console.trace(this.state, states.moving)
		this.state = states.moving
	}

	onMove(from, to) {
		if (from === to) return

		let piece = this.#board.getPiece(from)
		if (piece.canMoveTo(this.#board, from, to)) {
			this.#move(from, to)
			if (from === "c")
				this.#chessUI.hideCenterSquare()

			console.trace(this.state, states.waiting)
			this.state = states.waiting
			document.dispatchEvent(new CustomEvent(ChessEvents.onMove, { detail: { "piece": piece, "previousPos": from, "currentPos": to } }))
		}
		if (piece.canTakeTo(this.#board, from, to)) {
			let pieceTaken = this.#board.getPiece(to) // for event

			this.#take(from, to)

			console.trace(this.state, states.waiting)
			this.state = states.waiting
			document.dispatchEvent(new CustomEvent(ChessEvents.onTake, { detail: { "pieceTaking": piece, "pieceTaken": pieceTaken, "previousPos": from, "currentPos": to } })) // pieceTaking, pieceTaken, from, to
		}
	}

	#move(from, to) {
		this.#board.move(from, to)
		this.#chessUI.move(from, to)
	}

	#take(from, to, takeDest) {
		if (takeDest !== undefined)
			this.#move(to, takeDest)

		this.#board.take(from, to)
		this.#chessUI.take(from, to)
	}

	#change(code, func) {
		let piece = this.#board.getPiece(code)
		piece = func(piece)
		this.#board.setPiece(piece, code)

		this.#chessUI.setPiece(piece, code)
	}

	onDragCancel() {
		this.#chessUI.dragCancel()
		this.#chessUI.unHint()

		if (this.state !== states.waiting
			&& this.state !== states.pickingJail){ // on successful turn
			console.trace(this.state, states.turn)
			this.state = states.turn
		}
	}

	onMultiMove(origin, to) {
		let piece = this.#board.getPiece(origin)

		if (!piece.canMultiMove) return
		if (!piece.possibleMultiMoves(this.#board, origin)[2].includes(to)) return

		console.trace(this.state, states.multiMove)
		this.state = states.multiMove

		document.dispatchEvent(new CustomEvent(ChessEvents.onMultiMove, { detail: { "piece": piece, "origin": origin, "to": to } }))
	}
}