// this module is all the logic for the voice playback app
const States = {
	Idle: "idle",
	Recording: "recording",
	Hold: "hold",
	Reviewing: "reviewing"
}

var VoiceAppSettings = {
	pauseBeforeReview: false, // bool
	autoContinueAfterPlayed: true // bool // TODO: MAKE THIS WORK
}

class VoiceApp {
	State
	UIManager
	RecorderManager

	constructor (actionButtonDOM, textfieldDOM, waveformDOM, voiceAppSettings) {
		this.State = new VoiceAppStateManager(voiceAppSettings);
		this.UIManager = new VoiceAppUIStateManager(actionButtonDOM, textfieldDOM, voiceAppSettings)
		this.RecorderManager = new VoiceAppRecorderStateManager(waveformDOM, voiceAppSettings)

		if (voiceAppSettings.autoContinueAfterPlayed)
			document.addEventListener(RecorderEvents.onEndedOrStopped, () => {
				this.transitionState(States.Idle)
			})
		if (!voiceAppSettings.pauseBeforeReview)
			document.addEventListener(RecorderEvents.onReady, () => {
				this.transitionState(States.Reviewing)
			})
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
	voiceAppSettings
	currentState
	constructor (voiceAppSettings) {
		this.voiceAppSettings = voiceAppSettings
		this.currentState = States.Idle
	}

	getNextState(state) {
		if (!state)
			state = this.currentState;

		switch (state) {
			case States.Idle:
				return States.Recording
			case States.Recording:
				if (this.voiceAppSettings.pauseBeforeReview)
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

	transitionNextState() {
		this.currentState = this.getNextState(this.currentState)
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
		this.textfieldDOM.innerHTML = "Reviewing"
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

	constructor (waveformDOM, voiceAppSettings) {
		this.#voiceAppSettings = voiceAppSettings
		this.#Rec = new Recorder(waveformDOM)
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

	}

	#changeStateRecording() {
		this.#Rec.startRecording()
	}

	#changeStatePause() {
		this.#Rec.stopRecording()
	}

	#changeStateReviewing() {
		if (!this.#voiceAppSettings.pauseBeforeReview)
			this.#Rec.stopRecording()

		this.#Rec.playRecording()
	}
}