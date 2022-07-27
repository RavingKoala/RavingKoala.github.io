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
		for (const row of Object.keys(rowMarks)) {
			for (const column of Object.keys(columnMarks)) {
				let code = ChessBoard.createCode(row, column)
				let piece = board.getPiece(code)
				if (piece !== null)
					this.setPiece(piece, code)
			}
		}
		let otherSquares = [
			"c",
			"jl1",
			"jl2",
			"jr1",
			"jr2"
		]
		otherSquares.forEach((code) => {
			let piece = board.getPiece(code)
			if (piece === null) return
			this.setPiece(piece, code)
		})

		// append actionlistners
		this.#boardDOM.querySelectorAll(".square").forEach((square) => {
			square.addEventListener("mouseover", (e) => {
				if (!this.#isDragging) return

				square.classList.add("dropping")

				let origin = this.#draggingDOM.parentNode.dataset.id
				let to = square.dataset.id

				if (this.#hinted[0].includes(to)) {
					this.#chess.onMultiMove(origin, to)
				}
			})
			square.addEventListener("mouseleave", (e) => {
				if (!this.#isDragging) return

				square.classList.remove("dropping")
			})
			square.addEventListener("mouseup", (e) => {
				if (!this.#isDragging) return

				square.classList.remove("dropping")

				let from = this.#draggingDOM.parentNode.dataset.id
				let to = square.dataset.id

				this.#chess.onMove(from, to)
			})
		})
		document.addEventListener("mouseup", (e) => {
			this.#chess.onDragCancel()
		})
		document.addEventListener("mousemove", (e) => {
			if (!this.#isDragging) return

			this.#dragMove(new Vec2(e.clientX, e.clientY))
		})
	}

	hideCenterSquare() {
		/* bear exception */
		this.#boardDOM.querySelector(".squares").querySelector("[data-id='c']").classList.add("hidden")
	}

	dragStart(piece) {
		if (this.#isDragging)
			this.#chess.onDragCancel()

		piece.classList.add("dragging")
		this.#isDragging = true
		this.#draggingDOM = piece
	}

	hintSquares(squares) {
		for (const code of squares[0]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("moveable")
		}
		for (const code of squares[1]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("takeable")
		}
		this.#hinted = squares
	}

	unHint() {
		if (this.#hinted.length === 0)
			return

		for (const code of this.#hinted[0]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.remove("moveable")
		}
		for (const code of this.#hinted[1]) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.remove("takeable")
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
		this.#isDragging = false
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

	take(from, to) {
		let toContainerDOM = this.#boardDOM.querySelector("[data-id='" + to + "']")
		toContainerDOM.innerHTML = ""
		this.move(from, to)
	}

	setPiece(piece, code) {
		this.#boardDOM.querySelector("[data-id='" + code + "']").innerHTML = piece.toHTML()

		let pieceDOM = this.#boardDOM.querySelector("[data-id='" + code + "'] .piece")

		pieceDOM.addEventListener("mousedown", (e) => {
			e.preventDefault();
			this.#chess.onDrag(pieceDOM)
			this.#dragMove(new Vec2(e.clientX, e.clientY))
		})
	}
}