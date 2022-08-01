// TODO:
//   make hints object instead of array with keys
//   Rook can only take on previous turn take

class Chess {
	/* enums */
	static events = {
		onMove: "onMove", // piece, from, to
		onTake: "onTake", // piece, pieceTaken, from, to
		onJailPicked: "onJailPicked", // pieceJailed, to
		onMultiMove: "onMultiMove", // piece, origin, to
		onStateChange: "onStateChange" // from, to
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

	static sides = {
		white: "w",
		black: "b"
	}

	/* board layout
	 * [
	 *      [8a, 8b, 8c, 8d, 8e, 8f, 8g, 8h] // black
	 *      [7a, 7b, 7c, 7d, 7e, 7f, 7g, 7h]
	 *      [6a, 6b, 6c, 6d, 6e, 6f, 6g, 6h]
	 * [jw5][5a, 5b, 5c, 5d, 5e, 5f, 5g, 5h][jb5]
	 * [jw4][4a, 4b, 4c, 4d, 4e, 4f, 4g, 4h][jb4]
	 *      [3a, 3b, 3c, 3d, 3e, 3f, 3g, 3h]
	 *      [2a, 2b, 2c, 2d, 2e, 2f, 2g, 2h]
	 *      [1a, 1b, 1c, 1d, 1e, 1f, 1g, 1h] // white
	 * ]
	 */

	#board // 8x8 array ([column][row])
	#chessUI
	#state
	#pickingPiece
	#saving
	#turn
	constructor (boardDOM) {
		this.#board = new ChessBoard()
		this.#chessUI = new ChessUI(this, boardDOM)
		this.#state = Chess.states.idle
		this.#turn = new ChessTurn()
		this.#pickingPiece = null
		this.#saving = null

		this.initialize()
	}

	initialize() {
		this.#chessUI.initialize(this.#board)

		this.state = Chess.states.turn
	}

	get state() {
		return this.#state
	}

	set state(state) {
		let lastState = this.#state
		this.#state = state
		document.dispatchEvent(new CustomEvent(Chess.events.onStateChange, { detail: { from: lastState, to: state } }))
	}

	#promote(piece, pos) {
		if (piece.canPromote) {
			if (piece.promotionCondition(this.#board, pos))
				this.#change(pos, piece.promotionChange)
		}
	}
	onDrag(pieceDOM) {
		//suggest pieces to move/take
		this.#chessUI.dragStart(pieceDOM)
		let code = pieceDOM.parentNode.dataset.id

		let piece = this.#board.getPiece(code)
		let hints = piece.possibleMoves(this.#board, code)
		// if multimove -> give both multimove hints and normal hints
		if (piece.canMultiMove) {
			let multiMovesHints = piece.getMultiMoves(this.#board, code)
			hints[0] = hints[0].concat(multiMovesHints[0])
			hints[1] = hints[1].concat(multiMovesHints[1])
		}
		this.#chessUI.hintSquares(code, hints)

		this.state = Chess.states.moving
	}

	onSquarePicked(code) {
		if (this.#state !== Chess.states.pickingJail) return

		if (!((/w[QK]\^?/.test(this.#pickingPiece.code) && /wj[45]/.test(code)) ||
			(/b[QK]\^?/.test(this.#pickingPiece.code) && /bj[45]/.test(code))))
			return

		let tempPiece = this.#pickingPiece // for event


		this.#board.setJailPiece(this.#pickingPiece, code)
		this.#chessUI.setPiece(this.#pickingPiece, code)
		this.#pickingPiece = null
		this.state = Chess.states.turn

		document.dispatchEvent(new CustomEvent(Chess.events.onJailPicked, { detail: { "piece": tempPiece, "to": code } }))
	}

	onMove(from, to) {
		if (this.#saving !== null) {

			this.#save(from, to)
			return
		}

		if (from === to) return

		let piece = this.#board.getPiece(from)

		if (piece.canMoveTo(this.#board, from, to)) {
			this.#move(from, to)
			if (from === "c")
				this.#chessUI.hideCenterSquare()
			return
		}

		if (piece.canTakeTo(this.#board, from, to)) {
			this.#take(from, to)
			return
		}
	}

	#save(from, to) {
		let piece = this.#board.getPiece(from)

		if (!piece.saveCondition(this.#board, from, to)) return

		if (this.#board.isOccupied(to) && from !== to) {
			this.#take(from, to);
		} else {
			this.#move(from, to)
		}
		this.#move(this.#saving.to, this.#saving.from)
		this.#saving = null
	}

	#move(from, to) {
		let piece = this.#board.getPiece(from)

		if (piece.canPromote) {
			if (piece.promotionCondition(this.#board, to))
				console.log(ChessTurn.createCode(this.#board, from, to, this.#board.getPiece(to)));
		}

		this.#board.move(from, to)
		this.#chessUI.move(from, to)


		if (piece.canPromote)
			if (piece.promotionCondition(this.#board, to))
				this.#change(to, piece.promotionChange)


		this.state = Chess.states.waiting

		document.dispatchEvent(new CustomEvent(Chess.events.onMove, { detail: { "piece": piece, "previousPos": from, "currentPos": to } }))
	}

	#take(from, to) {
		let piece = this.#board.getPiece(from) // for event
		let pieceTaken = this.#board.getPiece(to) // for event

		this.#board.take(from, to)
		this.#chessUI.take(from, to)

		this.state = Chess.states.waiting

		// capture king/queen to jail
		if (/[wb][QK]\^?/.test(pieceTaken.code)) { //regex for [white or black] [queen or king] (banana optionally)
			this.state = Chess.states.pickingJail
			this.#pickingPiece = pieceTaken
		}

		document.dispatchEvent(new CustomEvent(Chess.events.onTake, { detail: { "piece": piece, "pieceTaken": pieceTaken, "previousPos": from, "currentPos": to } }))
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

		if (this.#state !== Chess.states.waiting // on successful turn
			&& this.#state !== Chess.states.pickingJail) {
			this.state = Chess.states.turn
		}

		this.#saving = null
	}

	onMultiMove(origin, to) {
		let piece = this.#board.getPiece(origin)

		if (!piece.canMultiMove) return
		if (!piece.getMultiMoves(this.#board, origin)[0].includes(to)) return

		this.state = Chess.states.multiMove

		// update hints for current hovered square
		this.#chessUI.unHint()
		let hints = piece.getMultiMoveHints(this.#board, to)
		this.#chessUI.hintSquares(to, hints, origin)

		document.dispatchEvent(new CustomEvent(Chess.events.onMultiMove, { detail: { "piece": piece, "origin": origin, "to": to } }))
	}

	onSave(origin) {
		if (this.#saving !== null) return
		let piece = this.#board.getPiece(origin)

		if (!piece.canSave) return

		let save = piece.canSavePiece(this.#board, origin)

		if (save === null) return

		this.#chessUI.unHint()
		let hints = piece.getMultiMoveHints(this.#board, save.from)
		this.#chessUI.hintSquares(save.from, hints)

		this.#saving = save
	}
}