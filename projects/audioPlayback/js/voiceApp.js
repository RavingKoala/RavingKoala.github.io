// this module is all the logic for the voice playback app
const States = {
	idle: "Idle",
	recording: "Recording",
	hold: "Hold",
	reviewing: "Reviewing",
}

var VoiceAppSettings = {
	pauseBeforeReview: new Error("pauseBeforeReview was never set to 'true' or 'false'"), // bool
	manualContinue: new Error("autoContinueAfterPlayed was never set to 'true' or 'false'"), // bool
}

class VoiceApp {
	State
	UIManager
	MediaManager
    AudioPlayer
    AudioVisualizer

    constructor (actionButtonDOM, textfieldDOM, recorder, audioPlayer, audioVisualizer, settings) {
		this.State = new VoiceAppStateManager(settings)
		this.UIManager = new VoiceAppUIStateManager(actionButtonDOM, textfieldDOM, settings)
		this.MediaManager = new VoiceAppMediaStateManager(recorder, audioPlayer, settings)

        this.AudioPlayer = audioPlayer
        this.AudioVisualizer = audioVisualizer
        

        document.addEventListener(RecorderEvents.onFinished, (e) => {
            audioPlayer.play(e.detail.audioBlobURI)
        })
        document.addEventListener(AudioPlayerEvents.onPlay, () => {
            audioVisualizer.startAnimation()
        })
        document.addEventListener(AudioPlayerEvents.onEnded, () => {
            if (!settings.manualContinue)
                this.nextState()
            audioVisualizer.stopAnimtaion()
        })
	}

	nextState() {
		let nextState = this.State.getNextState()
		this.transitionState(nextState)
	}
    
	transitionState(state) {
		this.State.currentState = state
		this.MediaManager.changeState(state)
		this.UIManager.changeState(state)
	}

    playRecording(audioURI) {
        this.AudioPlayer.play(audioURI)
        this.transitionState(States.reviewing)
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
				if (this.settings.pauseBeforeReview)
                    return States.hold
                else
                    return States.reviewing
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
                let actionbuttonURI = this.settings.pauseBeforeReview ? "./resources/SVGs/PauseButton.svg" : "./resources/SVGs/PlayButton.svg"
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
		getContent(actionBtnURI).then((result) => {
			this.actionButtonDOM.innerHTML = result
		})
		this.textfieldDOM.innerHTML = labelText
	}
}

class VoiceAppMediaStateManager {
	#voiceAppSettings
    #Rec
    #Audio

	constructor (recorder, audioPlayer, voiceAppSettings) {
		this.#voiceAppSettings = voiceAppSettings

		this.#Rec = recorder
        this.#Audio = audioPlayer
	}

	changeState(state) {
        console.log("doing state", state);
        
		switch (state) {
			case States.idle:
				if (!this.#Rec.isEnded)
                    this.#Audio.stop()
				break
			case States.recording:
				this.#Rec.start()
				break
			case States.hold:
				this.#Rec.stop()
				break
			case States.reviewing:
				if (this.#voiceAppSettings.pauseBeforeReview)
                    this.#Audio.play(this.#Rec.getLastRecording())
				else
                    this.#Rec.stop() // Automatically call playRecording on ready
				break
			default:
				break
		}
	}
}