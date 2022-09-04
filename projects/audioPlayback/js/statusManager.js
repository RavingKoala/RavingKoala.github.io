// this module is ment for checking if audio and mic functionality are enabled.

const SoundStates = {
	Sound: "Sound",
	NoSound: "NoSound"
}

const MicStates = {
	Mic: "Mic",
	NoMic: "NoMic",
}

class StatusStateManager {
	#currentState = {
		Mic: null,
		Sound: null
	}
	constructor (audioDOM, micDOM) {
		if (!audioDOM instanceof Element || !audioDOM instanceof Document)
			throw new Error("audioDom is not a valid element")
		if (!micDOM instanceof Element || !micDOM instanceof Document)
			throw new Error("micDOM is not a valid element")

		this.audioDOM = audioDOM
		this.micDOM = micDOM
	}

	setSoundImage(state) {
		if (state === this.#currentState.Sound)
			return

		let audioDOM = document.getElementById("audio")

		switch (state) {
			case SoundStates.Sound:
				audioDOM.classList.remove("danger-text")
				audioDOM.classList.remove("warning-text")
				audioDOM.classList.add("success-text")
				getContent("./resources/SVGs/Sound.svg").then((result) => {
					this.audioDOM.innerHTML = result
				})
				break
			default:
				audioDOM.classList.remove("success-text")
				audioDOM.classList.remove("warning-text")
				audioDOM.classList.add("danger-text")
				getContent("./resources/SVGs/NoSound.svg").then((result) => {
					this.audioDOM.innerHTML = result
				})
				break
		}

		this.#currentState.Sound = state
	}

	setMicImage(state) {
		if (state === this.#currentState.Mic)
			return

		let micDOM = document.getElementById("microphone")

		switch (state) {
			case MicStates.Mic:
				micDOM.classList.remove("danger-text")
				micDOM.classList.remove("warning-text")
				micDOM.classList.add("success-text")
				getContent("./resources/SVGs/Mic.svg").then((result) => {
					this.micDOM.innerHTML = result
				})
				break
			default:
				micDOM.classList.remove("success-text")
				micDOM.classList.remove("warning-text")
				micDOM.classList.add("danger-text")
				getContent("./resources/SVGs/NoMic.svg").then((result) => {
					this.micDOM.innerHTML = result
				})
				break
		}
		this.#currentState.Mic = state
	}
}
