// this module is ment for checking if audio and mic functionality are enabled.

function RequirementStateManager(audioDOM, micDOM) {

	this.SoundStates = {
		Sound: "sound",
		NoSound: "noSound"
	};

	this.MicStates = {
		Mic: "mic",
		NoMic: "noMic",
	};

	this.setSoundImage = (state) => {
		switch (state) {
			case this.SoundStates.Sound:
				removeClass("audio", "danger-text")
				removeClass("audio", "warning-text")
				addClass("audio", "success-text")
				getContent("./resources/SVGs/Sound.svg", (result) => {
					audioDOM.innerHTML = result
				})
				break
			default:
				removeClass("audio", "success-text")
				removeClass("audio", "warning-text")
				addClass("audio", "danger-text")
				getContent("./resources/SVGs/NoSound.svg", (result) => {
					audioDOM.innerHTML = result
				})
				break
		}
	}

	this.setMicImage = (state) => {
		switch (state) {
			case this.MicStates.Mic:
				removeClass("microphone", "danger-text")
				removeClass("microphone", "warning-text")
				addClass("microphone", "success-text")
				getContent("./resources/SVGs/Mic.svg", (result) => {
					micDOM.innerHTML = result
				})
				break
			default:
				removeClass("microphone", "success-text")
				removeClass("microphone", "warning-text")
				addClass("microphone", "danger-text")
				getContent("./resources/SVGs/NoMic.svg", (result) => {
					micDOM.innerHTML = result
				})
				break
		}
	}
}
