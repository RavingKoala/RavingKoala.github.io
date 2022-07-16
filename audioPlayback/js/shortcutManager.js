var KeyCodes = {
	KeyQ: "KeyQ",
	KeyW: "KeyW",
	KeyE: "KeyE",
	KeyR: "KeyR",
	KeyT: "KeyT",
	KeyY: "KeyY",
	KeyU: "KeyU",
	KeyI: "KeyI",
	KeyO: "KeyO",
	KeyP: "KeyP",
	KeyA: "KeyA",
	KeyS: "KeyS",
	KeyD: "KeyD",
	KeyF: "KeyF",
	KeyG: "KeyG",
	KeyH: "KeyH",
	KeyJ: "KeyJ",
	KeyK: "KeyK",
	KeyL: "KeyL",
	KeyZ: "KeyZ",
	KeyX: "KeyX",
	KeyC: "KeyC",
	KeyV: "KeyV",
	KeyB: "KeyB",
	KeyN: "KeyN",
	KeyM: "KeyM",
	Digit1: "Digit1",
	Digit2: "Digit2",
	Digit3: "Digit3",
	Digit4: "Digit4",
	Digit5: "Digit5",
	Digit6: "Digit6",
	Digit7: "Digit7",
	Digit8: "Digit8",
	Digit9: "Digit9",
	Digit0: "Digit0",
	ArrowUp: "ArrowUp",
	ArrowDown: "ArrowDown",
	ArrowLeft: "ArrowLeft",
	ArrowRight: "ArrowRight",
	Minus: "Minus",
	Equal: "Equal",
	BracketLeft: "BracketLeft",
	BracketRight: "BracketRight",
	Backslash: "Backslash",
	Semicolon: "Semicolon",
	Quote: "Quote",
	Enter: "Enter",
	Period: "Period",
	Slash: "Slash",
	Space: "Space",
	Tab: "Tab",
	Escape: "Escape",
	Backquote: "Backquote",
	NumpadDivide: "NumpadDivide",
	NumpadMultiply: "NumpadMultiply",
	NumpadSubtract: "NumpadSubtract",
	NumpadEnter: "NumpadEnter",
	Numpad0: "Numpad0",
	Numpad1: "Numpad1",
	Numpad2: "Numpad2",
	Numpad3: "Numpad3",
	Numpad4: "Numpad4",
	Numpad5: "Numpad5",
	Numpad6: "Numpad6",
	Numpad7: "Numpad7",
	Numpad8: "Numpad8",
	Numpad9: "Numpad9",
	NumpadDecimal: "NumpadDecimal",
	Control: "Control",
	Alt: "Alt",
	Shift: "Shift",
	Meta: "Meta",
	F1: "F1",
	F2: "F2",
	F3: "F3",
	F4: "F4",
	F5: "F5",
	F6: "F6",
	F7: "F7",
	F8: "F8",
	F9: "F9",
	F10: "F10",
	F11: "F11",
	F12: "F12",
}

var KeyActions = {
	keyDown: "KeyDown",
	keyUp: "KeyUp",
	press: "Press", // < 250ms (ShortcutManager.holdTime)
	hold: "Hold", // > 250ms (ShortcutManager.holdTime)
}

class ShortcutManager {
	holdTime = 250 // milliseconds
	activeShortcuts
	pressed
	constructor () {
		this.activeShortcuts = {}
		this.pressed = {}
		document.addEventListener("keydown", (e) => {
			if (this.pressed[e.code] === null) // prevent trigger from the same press
				return
			if (!this.activeShortcuts[e.code])
				return

			this.#onKeyDown(e)
		});
		document.addEventListener("keyup", (e) => {
			if (!this.activeShortcuts[e.code])
				return

			this.#onKeyUp(e)
		});
		window.addEventListener("blur", this.#resetTracking)
	}

	addShortcut(shortcut, action, unique = true) {
		if (typeof action !== "function")
			throw new Error("Shortcut action is not valid!")

		if (!this.activeShortcuts[shortcut.keyCode])
			this.activeShortcuts[shortcut.keyCode] = {}
			

		if (this.activeShortcuts[shortcut.keyCode][shortcut.toString()]) {
			if (unique)
				if (typeof this.activeShortcuts[shortcut.keyCode][shortcut.toString()] === "function"){
					let fn = this.activeShortcuts[shortcut.keyCode][shortcut.toString()]
					this.activeShortcuts[shortcut.keyCode][shortcut.toString()] = [fn];
				}	
			else
				if (this.activeShortcuts[shortcut.keyCode][shortcut.toString()] === action) {
					alert("that shortcut is already set")
					return
				}
		}

		if (Array.isArray(this.activeShortcuts[shortcut.keyCode][shortcut.toString()]))
			this.activeShortcuts[shortcut.keyCode][shortcut.toString()].push(action)
		else 
			this.activeShortcuts[shortcut.keyCode][shortcut.toString()] = action
	}

	#ShortcutPressed(shortcut) {
		if (this.activeShortcuts[shortcut.keyCode][shortcut.toString()]) {
			if (Array.isArray(this.activeShortcuts[shortcut.keyCode][shortcut.toString()]))
				this.activeShortcuts[shortcut.keyCode][shortcut.toString()].forEach(fn => fn() );
			else
				this.activeShortcuts[shortcut.keyCode][shortcut.toString()]()
		}
	}

	#onKeyDown(e) {
		this.pressed[e.code] = setTimeout(() => {
			this.#onKeyHold(e)
			clearTimeout(this.pressed[e.code])
			this.pressed[e.code] = null
		}, this.holdTime)

		let scMod = new shortcutMod(e.ctrlKey, e.altKey, e.shiftKey, e.metaKey)
		let sc = new shortcut(e.code, scMod, KeyActions.keyDown)
		this.#ShortcutPressed(sc)
	}

	#onKeyPress(e) {
		let scMod = new shortcutMod(e.ctrlKey, e.altKey, e.shiftKey, e.metaKey)
		let sc = new shortcut(e.code, scMod, KeyActions.press)
		this.#ShortcutPressed(sc)
	}

	#onKeyHold(e) {
		clearTimeout(this.pressed[e.code])
		let scMod = new shortcutMod(e.ctrlKey, e.altKey, e.shiftKey, e.metaKey)
		let sc = new shortcut(e.code, scMod, KeyActions.hold)
		this.#ShortcutPressed(sc)
	}

	#onKeyUp(e) {
		if (this.pressed[e.code] === null) {
			delete this.pressed[e.code]
		} else {
			clearTimeout(this.pressed[e.code])
			delete this.pressed[e.code]
			this.#onKeyPress(e)
		}

		let shortcutMods = new shortcutMod(e.ctrlKey, e.altKey, e.shiftKey, e.metaKey)
		let sc = new shortcut(e.code, shortcutMods, KeyActions.keyUp)
		this.#ShortcutPressed(sc)
	}

	#resetTracking() {
		for (const key in this.pressed) {
			clearTimeout(this.pressed[key])
			delete this.pressed[key]
		}
		this.pressed = {}
	}
}

class shortcut {
	constructor (keyCode = undefined, mods = new shortcutMod(), keyAction = undefined) {
		this.keyCode = keyCode
		this.mods = mods
		this.keyAction = keyAction
	}

	toString() {
		let string = ""
		string += this.mods.toString()
		string += this.keyCode
		string += this.keyAction
		return string
	}
}

class shortcutMod {
	constructor (ctrl = undefined, alt = undefined, shift = undefined, meta = undefined) {
		this.ctrl = ctrl
		this.alt = alt
		this.shift = shift
		this.meta = meta
	}

	toString() {
		let string = ""
		if (this.ctrl) string += "ctrl"
		if (this.alt) string += "alt"
		if (this.shift) string += "shift"
		if (this.meta) string += "meta"
		return string
	}
}