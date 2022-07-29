

class Chess {
	/* enums */
	static events = {
		onMove: "onMove", // piece, from, to
		onTake: "onTake", // pieceTaking, pieceTaken, from, to
		onMultiMove: "onMultiMove" // piece, origin, to
	}

	static sides = {
		white: "w",
		black: "b"
	}

	static states = {
		idle: "idle", // before and after game
		turn: "turn", // when it is the start of a turn and nothing happened yet
		waiting: "waiting", // waiting for the opponent to make a turn
		moving: "moving", // dragging a piece
		multiMove: "multiMove", // Multimoving a piece
		pickingJail: "pickingJail", // picking a jail for the Queen/King to go
		finished: "finished" // game is over
	}

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
	#saving
	#turn
	constructor (boardDOM) {
		this.#board = new ChessBoard()
		this.#chessUI = new ChessUI(this, boardDOM)
		this.state = Chess.states.idle
		this.#saving = null

		this.initialize()
	}

	initialize() {
		this.#chessUI.initialize(this.#board)
		// set board rule
		// change fishy into fishy queen
		document.addEventListener(Chess.events.onMove, (event) => {
			let piece = event.detail.piece
			let code = event.detail.currentPos
			if ((piece.code === "wf" && code.startsWith("8"))
				|| (piece.code === "bf" && code.startsWith("1"))) {
				this.#change(piece.code, (piece) => new FishyQueen(piece.color))
			}
		})
		document.addEventListener(Chess.events.onTake, (event) => {
			let piece = event.detail.pieceTaking
			let code = event.detail.currentPos
			if ((piece.code === "wf" && code.startsWith("8"))
				|| (piece.code === "bf" && code.startsWith("1"))) {
				this.#change(code, (piece) => new FishyQueen(piece.color))
			}
		})
		// capture king/queen to jail
		document.addEventListener(Chess.events.onTake, (event) => {
			let piece = event.detail.pieceTaken
			if (/[wb][qk]\^?/.test(piece.code)) { //regex for [white or black] [queen or king] (banana optionally)
				this.state = Chess.states.pickingJail
				this.#pickingPiece = piece
			}
		})
		document.addEventListener(Chess.events.onMultiMove, (event) => {
			let piece = event.detail.piece
			let origin = event.detail.origin
			let to = event.detail.to
			this.#chessUI.unHint()
			let hints = piece.getMultiMoveHints(this.#board, to)
			this.#chessUI.hintSquares(to, hints, origin)
		})
		// // console version
		// document.addEventListener(Chess.events.onMove, (e) => {
		// 	console.clear()
		// 	console.log(this.#board.toString());

		// 	this.#board.getJailPiece("jr1")
		// })
		// document.addEventListener(Chess.events.onTake, (e) => {
		// 	console.clear()
		// 	console.log(this.#board.toString());
		// })
		// console.clear()
		// console.log(this.#board.toString());

		this.state = Chess.states.turn
	}

	onSquarePicked(code) {
		if (this.state !== Chess.states.pickingJail) return

		if ((/w[qk]\^?/.test(this.#pickingPiece.code) && /jl[12]/.test(code))
			|| (/b[qk]\^?/.test(this.#pickingPiece.code) && /jr[12]/.test(code))) {
			this.#board.setJailPiece(this.#pickingPiece, code)
			this.#chessUI.setPiece(this.#pickingPiece, code)
			this.state = Chess.states.turn
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
			let multiMovesHints = piece.getMultiMoves(this.#board, code)
			hints[0] = hints[0].concat(multiMovesHints[0])
			hints[1] = hints[1].concat(multiMovesHints[1])
		}
		this.#chessUI.hintSquares(code, hints)

		this.state = Chess.states.moving
	}

	onMove(from, to) {
		if (from === to && !this.#saving !== null) return

		let piece = this.#board.getPiece(from)

		if (this.#saving !== null) {
			if (piece.saveCondition(this.#board, from, to)) {
				this.#move(from, to) // TODO: check if still can TAKE this way

				this.#move(this.#saving.to, this.#saving.from)
				this.#saving == null
				return
			}

			return
		}

		if (piece.canMoveTo(this.#board, from, to)) {
			this.#move(from, to)
			if (from === "c")
				this.#chessUI.hideCenterSquare()
		}
		if (piece.canTakeTo(this.#board, from, to)) {
			this.#take(from, to)
		}
	}

	#move(from, to) {
		let piece = this.#board.getPiece(from) // for event

		this.#board.move(from, to)
		this.#chessUI.move(from, to)

		this.state = Chess.states.waiting

		document.dispatchEvent(new CustomEvent(Chess.events.onMove, { detail: { "piece": piece, "previousPos": from, "currentPos": to } }))
	}

	#take(from, to) {
		let piece = this.#board.getPiece(from) // for event
		let pieceTaken = this.#board.getPiece(to) // for event

		this.#board.take(from, to)
		this.#chessUI.take(from, to)

		this.state = Chess.states.waiting

		document.dispatchEvent(new CustomEvent(Chess.events.onTake, { detail: { "pieceTaking": piece, "pieceTaken": pieceTaken, "previousPos": from, "currentPos": to } }))
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

		if (this.state !== Chess.states.waiting // on successful turn
			&& this.state !== Chess.states.pickingJail) {
			this.state = Chess.states.turn
		}
		if (this.#saving !== null)
			this.#saving = null
	}

	onMultiMove(origin, to) {
		let piece = this.#board.getPiece(origin)

		if (!piece.canMultiMove) return
		if (!piece.getMultiMoves(this.#board, origin)[0].includes(to)) return

		this.state = Chess.states.multiMove

		document.dispatchEvent(new CustomEvent(Chess.events.onMultiMove, { detail: { "piece": piece, "origin": origin, "to": to } }))
	}

	onSave(origin, jail) {
		let piece = this.#board.getPiece(origin)

		if (!piece.canSave) return
		let save = piece.canSavePiece(this.#board, origin)
		if (save !== null) {
			this.#chessUI.unHint()
			let hints = piece.getMultiMoveHints(this.#board, save.from)
			this.#chessUI.hintSquares(save.from, hints)
			this.#saving = save
		}
	}
}