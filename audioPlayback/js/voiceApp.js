// this module is all the logic for the voice playback app
const States = {
	Idle: "idle",
	Recording: "recording",
	Hold: "hold",
	Reviewing: "reviewing",
	// TODO: add stopping and pausing
}

var VoiceAppSettings = {
	immediateReview: () => new Error("immediateReview was never set to 'true' or 'false'"), // bool
	autoContinueAfterPlayed: () => new Error("autoContinueAfterPlayed was never set to 'true' or 'false'"), // bool
}

class VoiceApp {
	State
	UIManager
	RecorderManager

	constructor (actionButtonDOM, textfieldDOM, settings) {
		

		this.State = new VoiceAppStateManager(settings);
		this.UIManager = new VoiceAppUIStateManager(actionButtonDOM, textfieldDOM, settings)

		this.RecorderManager = new VoiceAppRecorderStateManager(settings)

		if (settings.autoContinueAfterPlayed)
			document.addEventListener(RecorderEvents.onEndedOrStopped, () => {
				this.transitionState(States.Idle)
			})
		// if (settings.immediateReview)
		// 	document.addEventListener(RecorderEvents.onReady, () => {
		// 		this.transitionState(States.Reviewing)
		// 	})
	}

	nextState() {
		let nextState = this.State.getNextState()
		this.transitionState(nextState)
	}

	// TODO: make safe to transition from any state to any state
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
			state = this.currentState;

		switch (state) {
			case States.Idle:
				return States.Recording
			case States.Recording:
				if (!this.settings.immediateReview)
					return States.Hold
				else
					return States.Reviewing
			case States.Hold:
				return States.Reviewing
			case States.Reviewing:
				return States.Idle
			default:
				return States.Idle
		}
	}
}

class VoiceAppUIStateManager {
	actionButtonDOM
	textfieldDOM

	constructor (actionButtonDOM, textfieldDOM) {
		this.actionButtonDOM = actionButtonDOM
		this.textfieldDOM = textfieldDOM
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
		getContent("./resources/SVGs/PlayButton.svg", (result) => {
			this.actionButtonDOM.innerHTML = result
		})
		this.textfieldDOM.innerHTML = "Recording"
	}

	#changeStatePause() {
		getContent("./resources/SVGs/PauseButton.svg", (result) => {
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

	constructor (voiceAppSettings) {
		this.#voiceAppSettings = voiceAppSettings
		this.#Rec = new Recorder()
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
		if (!this.#Rec.isEnded)
			this.#Rec.stopPlaying()
	}

	#changeStateRecording() {
		this.#Rec.startRecording()
	}

	#changeStatePause() {
		this.#Rec.stopRecording()
	}

	#changeStateReviewing() {
		if (this.#voiceAppSettings.immediateReview)
			this.#Rec.stopRecording()

		this.#Rec.playRecording()
	}
}