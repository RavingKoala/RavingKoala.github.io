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

		switch (state) {
			case SoundStates.Sound:
				removeClass("audio", "danger-text")
				removeClass("audio", "warning-text")
				addClass("audio", "success-text")
				getContent("./resources/SVGs/Sound.svg").then((result) => {
					this.audioDOM.innerHTML = result
				})
				break
			default:
				removeClass("audio", "success-text")
				removeClass("audio", "warning-text")
				addClass("audio", "danger-text")
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

		switch (state) {
			case MicStates.Mic:
				removeClass("microphone", "danger-text")
				removeClass("microphone", "warning-text")
				addClass("microphone", "success-text")
				getContent("./resources/SVGs/Mic.svg").then((result) => {
					this.micDOM.innerHTML = result
				})
				break
			default:
				removeClass("microphone", "success-text")
				removeClass("microphone", "warning-text")
				addClass("microphone", "danger-text")
				getContent("./resources/SVGs/NoMic.svg").then((result) => {
					this.micDOM.innerHTML = result
				})
				break
		}
		this.#currentState.Mic = state
	}
}
