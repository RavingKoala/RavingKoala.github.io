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
		for (const row of Object.keys(ChessBoard.rowMarks)) {
			for (const column of Object.keys(ChessBoard.columnMarks)) {
				let code = ChessBoard.createCode(row, column)
				let piece = board.getPiece(code)
				if (piece !== null)
					this.setPiece(piece, code)
			}
		}
		let otherSquares = [
			"c",
			"jl5",
			"jl4",
			"jr5",
			"jr4"
		]
		otherSquares.forEach((code) => {
			let piece = board.getPiece(code)
			if (piece === null) return
			this.setPiece(piece, code)
		})

		// append actionlistners
		this.#boardDOM.querySelectorAll(".square").forEach((square) => {
			square.addEventListener("mouseenter", (e) => {
				if (!this.#isDragging) return

				square.classList.add("dropping")

				let origin = this.#draggingDOM.parentNode.dataset.id
				let to = square.dataset.id

				if (this.#hinted[1].includes(to)) {
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
		this.#boardDOM.querySelectorAll(".square[data-id^='j']").forEach((square) => {
			square.addEventListener("mousedown", (e) => {
				let code = square.dataset.id
				this.#chess.onSquarePicked(code)
			})
			square.addEventListener("mouseenter", (e) => {
				if (!this.#isDragging) return

				let origin = this.#draggingDOM.parentNode.dataset.id
				let jail = square.dataset.id
				this.#chess.onSave(origin, jail)
			})
		});
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

	hintSquares(source, squares, origin = null) {
		let tempDOM = this.#boardDOM.querySelector("[data-id='" + source + "']")
		tempDOM.classList.add("source")
		this.#hinted.push(source)

		for (const code of squares[0]) {
			tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("moveable")
		}
		for (const code of squares[1]) {
			tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("takeable")
		}

		this.#hinted = this.#hinted.concat(squares)

		if (origin !== null) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + origin + "']")
			tempDOM.classList.add("origin")
			this.#hinted.push(origin)
		}
	}

	unHint() {
		if (this.#hinted.length === 0)
			return

		let tempDOM = this.#boardDOM.querySelector("[data-id='" + this.#hinted[0] + "']")
		tempDOM.classList.remove("source")

		for (const code of this.#hinted[1]) {
			tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.remove("moveable")
		}
		for (const code of this.#hinted[2]) {
			tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.remove("takeable")
		}

		if (this.#hinted[3] !== undefined) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + this.#hinted[3] + "']")
			tempDOM.classList.remove("origin")
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
			if (this.#chess.state === Chess.states.pickingJail) return

			e.preventDefault();
			this.#chess.onDrag(pieceDOM)
			this.#dragMove(new Vec2(e.clientX, e.clientY))
		})

	}
}