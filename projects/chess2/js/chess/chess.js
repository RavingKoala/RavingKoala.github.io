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