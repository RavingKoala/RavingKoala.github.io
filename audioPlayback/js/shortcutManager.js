/* structs */
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

	addShortcut(shortcut, action) {
		if (typeof action !== "function")
			throw new Error("Shortcut action is not valid!")

		if (!this.activeShortcuts[shortcut.keyCode])
			this.activeShortcuts[shortcut.keyCode] = {}

		if (this.activeShortcuts[shortcut.keyCode][shortcut.toString()]) {
			alert("that shortcut is already set")
			return
		}

		this.activeShortcuts[shortcut.keyCode][shortcut.toString()] = action
	}

	#ShortcutPressed(shortcut) {
		if (this.activeShortcuts[shortcut.keyCode][shortcut.toString()])
			this.activeShortcuts[shortcut.keyCode][shortcut.toString()]()
	}

	#onKeyDown(e) {
		this.pressed[e.code] = setTimeout(() => {
			this.#onKeyHold(e)
			clearTimeout(this.pressed[e.code])
			this.pressed[e.code] = null
		}, this.holdTime)

		let scMod = new shortcutMod(e.ctrl, e.shift, e.alt, e.meta)
		let sc = new shortcut(e.code, scMod, KeyActions.keyDown)
		this.#ShortcutPressed(sc)
	}

	#onKeyPress(e) {
		let scMod = new shortcutMod(e.ctrl, e.shift, e.alt, e.meta)
		let sc = new shortcut(e.code, scMod, KeyActions.press)
		this.#ShortcutPressed(sc)
	}

	#onKeyHold(e) {
		clearTimeout(this.pressed[e.code])
		let scMod = new shortcutMod(e.ctrl, e.shift, e.alt, e.meta)
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

		let shortcutMods = new shortcutMod(e.ctrl, e.shift, e.alt, e.meta)
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

/* templates */

class shortcut {
	constructor (keyCode = undefined, mods = new shortcutMod(), keyAction = undefined) {
		this.keyCode = keyCode
		this.mods = mods
		this.keyAction = keyAction
	}

	equals(sc) {
		if (!sc instanceof shortcut)
			return false
		if (this.keyCode !== sc.keyCode
			|| this.mods.equals(sc.scMod)
			|| this.keyAction !== sc.keyAction)
			return false
		return true
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
	constructor (ctrl = undefined, shift = undefined, alt = undefined, meta = undefined) {
		this.ctrl = ctrl
		this.shift = shift
		this.alt = alt
		this.meta = meta
	}

	equals(scMod) {
		if (!scMod instanceof shortcutMod)
			return false
		if (this.ctrl !== scMod.ctrl
			|| this.shift !== scMod.shift
			|| this.alt !== scMod.alt
			|| this.meta !== scMod.meta)
			return false

		return true
	}

	toString() {
		let string = ""
		if (this.ctrl) string += "ctrl"
		if (this.shift) string += "shift"
		if (this.alt) string += "alt"
		if (this.meta) string += "meta"
		return string
	}
}