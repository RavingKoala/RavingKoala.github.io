class ChessUI {
	#boardDOM
	#chess
	#turn
	#isDragging
	#draggingDOM
	#isCenterHidden
	#hinted
	constructor (chess, boardDOM, turn) {
		this.#chess = chess
		this.#turn = turn // TODO: can only move pieces of color === turn.color (REMOVE IF DONE WITH CSS)
		this.#boardDOM = boardDOM
		this.#isDragging = false
		this.#draggingDOM = null
		this.#isCenterHidden = false
		this.#hinted = [null, [], [], null]
	}

	initialize(board) {
		// visual board
		for (const column of Object.keys(ChessBoard.columnMarks)) {
			for (const row of Object.keys(ChessBoard.rowMarks)) {
				let code = ChessBoard.createCode(column, row)
				let piece = board.getPiece(code)
				if (piece !== null)
					this.setPiece(piece, code)
			}
		}
		let otherSquares = [
			"c",
			"wj5",
			"wj4",
			"bj5",
			"bj4"
		]
		otherSquares.forEach((code) => {
			let piece = board.getPiece(code)
			if (piece === null) return
			this.setPiece(piece, code)
		})

		// append actionlistners
		this.#boardDOM.querySelectorAll(".square").forEach((square) => {
			square.addEventListener("mouseenter", (e) => { // mouseenter or hints get overritten by multimove hints
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
		this.#boardDOM.querySelectorAll(".square[data-id*='j']").forEach((square) => {
			square.addEventListener("mousedown", (e) => {
				let code = square.dataset.id
				this.#chess.onSquarePicked(code)
			})
			square.addEventListener("mouseenter", (e) => {
				if (!this.#isDragging) return

				let origin = this.#draggingDOM.parentNode.dataset.id
				this.#chess.onSave(origin)
			})
		});
		document.addEventListener("mouseup", (e) => {
			if (!this.#isCenterHidden)
				this.#boardDOM.querySelector(".centerSquare").classList.remove("noDrop")

			this.#chess.onDragCancel()
		})
		document.addEventListener("mousemove", (e) => {
			if (!this.#isDragging) return

			this.#dragMove(new Vec2(e.clientX, e.clientY))
		})
	}

	hideCenterSquare() {
		/* bear exception */
		this.#boardDOM.querySelector(".centerSquare").classList.add("hidden")
		this.#isCenterHidden = true
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
		this.#hinted[0] = source

		for (const code of squares[0]) {
			tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("moveable")
		}
		this.#hinted[1] = squares[0]
		
		for (const code of squares[1]) {
			tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
			tempDOM.classList.add("takeable")
		}
		this.#hinted[2] = squares[1]

		if (origin !== null) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + origin + "']")
			tempDOM.classList.add("origin")
		}
		this.#hinted[3] = origin
	}

	unHint() {
		if (this.#hinted[0] !== null) {
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + this.#hinted[0] + "']")
			tempDOM.classList.remove("source")
		}
		this.#hinted[0] = null

		if (this.#hinted[1].length > 0) {
			for (const code of this.#hinted[1]) { // moves
				let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
				tempDOM.classList.remove("moveable")
			}
		}
		this.#hinted[1] = []
		
		if (this.#hinted[2].length > 0) {
			for (const code of this.#hinted[2]) { // takes
				let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
				tempDOM.classList.remove("takeable")
			}
		}
		this.#hinted[2] = []

		if (this.#hinted[3] !== null) { // origin
			let tempDOM = this.#boardDOM.querySelector("[data-id='" + this.#hinted[3] + "']")
			tempDOM.classList.remove("origin")
		}
		this.#hinted[3] = null
	}

	hintJail(color) {
		this.#hinted[4] = []
		document.querySelectorAll(".square[data-id*='" + color + "j']").forEach((jailSquare) => {
			jailSquare.classList.add("jailPick")
			this.#hinted[4].push(jailSquare.dataset.id)
		})
	}
	
	hintSaveJail(code) {
		document.querySelectorAll(".square[data-id*='" + color + "j']").forEach((jailSquare) => {
			jailSquare.classList.add("jailSave")
		})
		this.#hinted[5] = jailSquare.dataset.id
	}

	unHintJail() {
		if (this.#hinted[4] === undefined && this.#hinted[5]) return

		if (this.#hinted[4] !== undefined) {
			for (const code of this.#hinted[4]) {
				let tempDOM = this.#boardDOM.querySelector("[data-id='" + code + "']")
				tempDOM.classList.remove("jailPick")
			}
			delete this.#hinted[4]
		}
		
		if (this.#hinted[5] !== undefined) {
			if (this.#hinted[5] !== null) { // origin
				let tempDOM = this.#boardDOM.querySelector("[data-id='" + this.#hinted[5] + "']")
				tempDOM.classList.remove("jailSave")
			}
			delete this.#hinted[5]
		}
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

			// hide center
			if (pieceDOM.parentNode.dataset.id !== "c")
				this.#boardDOM.querySelector(".centerSquare").classList.add("noDrop")

			e.preventDefault();
			this.#chess.onDrag(pieceDOM)
			this.#dragMove(new Vec2(e.clientX, e.clientY))
		})
	}
	
	changeTurn(turn) {
		document.querySelector(".board").setAttribute("turn", turn)
	}
}