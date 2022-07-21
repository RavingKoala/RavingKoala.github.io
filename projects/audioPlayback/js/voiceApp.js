// this module is all the logic for the voice playback app
const States = {
	idle: "Idle",
	recording: "Recording",
	hold: "Hold",
	reviewing: "Reviewing",
}

var VoiceAppSettings = {
	immediateReview: new Error("immediateReview was never set to 'true' or 'false'"), // bool
	autoContinueAfterPlayed: new Error("autoContinueAfterPlayed was never set to 'true' or 'false'"), // bool
}

class VoiceApp {
	State
	UIManager
	RecorderManager

	constructor (actionButtonDOM, textfieldDOM, recorder, settings) {
		this.State = new VoiceAppStateManager(settings)
		this.UIManager = new VoiceAppUIStateManager(actionButtonDOM, textfieldDOM, settings)

		this.RecorderManager = new VoiceAppRecorderStateManager(recorder, settings)

		if (settings.autoContinueAfterPlayed == true)
			document.addEventListener(RecorderEvents.onEnded, () => { this.transitionState(States.idle) })
	}

	nextState() {
		let nextState = this.State.getNextState()
		this.transitionState(nextState)
	}

	transitionState(state) {
		this.State.currentState = state
		this.RecorderManager.changeState(state)
		this.UIManager.changeState(state)
	}
}

class VoiceAppStateManager {
	settings
	currentState

	constructor (settings) {
		this.settings = settings
		this.currentState = States.idle
	}

	getNextState(state) {
		if (!state)
			state = this.currentState

		switch (state) {
			case States.idle:
				return States.recording
			case States.recording:
				if (this.settings.immediateReview)
					return States.reviewing
				else
					return States.hold
			case States.hold:
				return States.reviewing
			case States.reviewing:
				return States.idle
			default:
				throw Error("Unknown State")
		}
	}
}

class VoiceAppUIStateManager {
	actionButtonDOM
	textfieldDOM

	constructor (actionButtonDOM, textfieldDOM, settings) {
		this.actionButtonDOM = actionButtonDOM
		this.textfieldDOM = textfieldDOM
		this.settings = settings
	}

	changeState(state) {
		switch (state) {
			case States.idle:
				this.#changeUI("./resources/SVGs/RecordButton.svg", "Start recording")
				break
			case States.recording:
				let actionbuttonURI = this.settings.immediateReview ? "./resources/SVGs/PlayButton.svg" : "./resources/SVGs/PauseButton.svg"
				this.#changeUI(actionbuttonURI, "Recording")
				break
			case States.hold:
				this.#changeUI("./resources/SVGs/PlayButton.svg", "Waiting")
				break
			case States.reviewing:
				this.#changeUI("./resources/SVGs/FullstopButton.svg", "Reviewing")
				break
			default:
				break
		}
	}

	#changeUI(actionBtnURI, labelText) {
		getContent(actionBtnURI, (result) => {
			this.actionButtonDOM.innerHTML = result
		})
		this.textfieldDOM.innerHTML = labelText
	}
}

class VoiceAppRecorderStateManager {
	#voiceAppSettings
	#Rec

	constructor (recorder, voiceAppSettings) {
		this.#voiceAppSettings = voiceAppSettings

		var settings = RecorderSettings
		settings.PlayASAP = voiceAppSettings.immediateReview

		this.#Rec = recorder
	}

	changeState(state) {
		switch (state) {
			case States.idle:
				if (!this.#Rec.isEnded)
					this.#Rec.stopPlaying()
				break
			case States.recording:
				this.#Rec.startRecording()
				break
			case States.hold:
				this.#Rec.stopRecording()
				break
			case States.reviewing:
				if (this.#voiceAppSettings.immediateReview)
					this.#Rec.stopRecording() // Automatically call playRecording on ready
				else
					this.#Rec.playRecording()
				break
			default:
				break
		}
	}
}