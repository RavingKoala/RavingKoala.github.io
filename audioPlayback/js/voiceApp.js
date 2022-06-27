// this module is all the logic for the voice playback app
const States = {
	Idle: "idle",
	Recording: "recording",
	Hold: "hold",
	Reviewing: "reviewing",
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
			document.addEventListener(RecorderEvents.onEnded, () => { this.transitionState(States.Idle) })
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
		this.currentState = States.Idle
	}

	getNextState(state) {
		if (!state)
			state = this.currentState

		switch (state) {
			case States.Idle:
				return States.Recording
			case States.Recording:
				if (this.settings.immediateReview)
					return States.Reviewing
				else
					return States.Hold
			case States.Hold:
				return States.Reviewing
			case States.Reviewing:
				return States.Idle
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
			case States.Idle:
				this.#changeStateIdle()
				break
			case States.Recording:
				this.#changeStateRecording()
				break
			case States.Hold:
				this.#changeStatePause()
				break
			case States.Reviewing:
				this.#changeStateReviewing()
				break
			default:
				break
		}
	}

	#changeStateIdle() {
		getContent("./resources/SVGs/RecordButton.svg", (result) => {
			this.actionButtonDOM.innerHTML = result
		})
		this.textfieldDOM.innerHTML = "Idle"
	}

	#changeStateRecording() {
		if (this.settings.immediateReview)
			getContent("./resources/SVGs/PlayButton.svg", (result) => {
				this.actionButtonDOM.innerHTML = result
			})
		else
			getContent("./resources/SVGs/PauseButton.svg", (result) => {
				this.actionButtonDOM.innerHTML = result
			})
		this.textfieldDOM.innerHTML = "Recording"
	}

	#changeStatePause() {
		getContent("./resources/SVGs/PlayButton.svg", (result) => {
			this.actionButtonDOM.innerHTML = result
		})
		this.textfieldDOM.innerHTML = "Waiting"
	}

	#changeStateReviewing() {
		getContent("./resources/SVGs/FullstopButton.svg", (result) => {
			this.actionButtonDOM.innerHTML = result
		})
		this.textfieldDOM.innerHTML = "Reviewing"
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
			case States.Idle:
				this.#changeStateIdle()
				break;
			case States.Recording:
				this.#changeStateRecording()
				break;
			case States.Hold:
				this.#changeStatePause()
				break;
			case States.Reviewing:
				this.#changeStateReviewing()
				break;
			default:
				break;
		}
	}

	#changeStateIdle() {
		console.log("STATE Idle")
		if (!this.#Rec.isEnded)
			this.#Rec.stopPlaying()
	}

	#changeStateRecording() {
		console.log("STATE Recording")
		this.#Rec.startRecording()
	}

	#changeStatePause() {
		console.log("STATE Pause")
		this.#Rec.stopRecording()
	}

	#changeStateReviewing() {
		console.log("STATE Review")
		if (this.#voiceAppSettings.immediateReview)
			this.#Rec.stopRecording() // Automatically call playRecording on ready
		else
			this.#Rec.playRecording()
	}
}