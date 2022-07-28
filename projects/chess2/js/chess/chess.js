const ChessEvents = {
	onMove: "onMove", // piece, from, to
	onTake: "onTake", // pieceTaking, pieceTaken, from, to
	onMultiMove: "onMultiMove" // piece, origin, to
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
	constructor (boardDOM) {
		this.#board = new ChessBoard()
		this.#chessUI = new ChessUI(this, boardDOM)
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
			if (piece.code.startsWith("wk") || piece.code === "wq") {
				let destCode = !this.#board.isOccupied("jl1") ? "jl1" : "jl2"

				this.#board.setJailPiece(piece, destCode)
				this.#chessUI.setPiece(piece, destCode)
			}

			if (piece.code.startsWith("bk") || piece.code === "bq") {
				let destCode = !this.#board.isOccupied("jr1") ? "jr1" : "jr2"

				this.#board.setJailPiece(piece, destCode)
				this.#chessUI.setPiece(piece, destCode)
			}
		})
		document.addEventListener(ChessEvents.onMultiMove, (event) => {
			let piece = event.detail.piece
			// let from = event.detail.from
			let to = event.detail.to
			this.#chessUI.unHint()
			this.#chessUI.hintSquares(piece.possibleMultiMoves(this.#board, to).splice(0, 2))
		})
	}

	onDrag(pieceDOM) {
		//suggest pieces to move/take
		this.#chessUI.dragStart(pieceDOM)
		let pieceCode = pieceDOM.parentNode.dataset.id

		let piece = this.#board.getPiece(pieceCode)
		let hints = piece.possibleMoves(this.#board, pieceCode)
		// check if multimove
		// if multimove give both multimove hints as normal hints
		if (piece.canMultiMove) {
			let multiMovesHints = piece.possibleMultiMoves(this.#board, pieceCode)
			hints[0] = hints[0].concat(multiMovesHints[0])
			hints[1] = hints[1].concat(multiMovesHints[1])
		}
		this.#chessUI.hintSquares(hints)
	}

	onMove(from, to) {
		if (from === to) return

		let piece = this.#board.getPiece(from)
		console.log(piece.canMoveTo(this.#board, from, to))
		if (piece.canMoveTo(this.#board, from, to)) {
			this.#move(from, to)
			if (from === "c")
				this.#chessUI.hideCenterSquare()

			document.dispatchEvent(new CustomEvent(ChessEvents.onMove, { detail: { "piece": piece, "previousPos": from, "currentPos": to } }))
		}
		if (piece.canTakeTo(this.#board, from, to)) {
			let pieceTaken = this.#board.getPiece(to) // for event

			this.#take(from, to)

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
	}

	onMultiMove(origin, to) {
		let piece = this.#board.getPiece(origin)

		if (!piece.canMultiMove) return
		if (!piece.possibleMultiMoves(this.#board, origin)[2].includes(to)) return
		
		document.dispatchEvent(new CustomEvent(ChessEvents.onMultiMove, { detail: { "piece": piece, "origin": origin, "to": to } }))
	}
}