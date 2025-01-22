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
    #audioPlayer
    #recorder
    #audioVisualizer
    #settings
    #actionButtonDOM
    #textfieldDOM
    #currentState

    constructor (actionButtonDOM, textfieldDOM, recorder, audioPlayer, audioVisualizer, settings) {

        this.#audioPlayer = audioPlayer
        this.#audioVisualizer = audioVisualizer
        
        this.#settings = settings

        this.#actionButtonDOM = actionButtonDOM
        this.#textfieldDOM = textfieldDOM

        this.#recorder = recorder

        this.#currentState = States.idle

        document.addEventListener(RecorderEvents.onFinished, (e) => {
            if (!this.#settings.pauseBeforeReview)
                audioPlayer.play(e.detail.audioBlobURI)
        })
        document.addEventListener(AudioPlayerEvents.onPlay, () => {
            this.#audioVisualizer.startAnimation()
        })
        document.addEventListener(AudioPlayerEvents.onEnded, () => {
            if (!settings.manualContinue)
                this.transitionState(States.idle)
            this.#audioVisualizer.stopAnimtaion()
        })
    }

    #getNextState(state) {
        if (!state)
            state = this.#currentState

        switch (state) {
            case States.idle:
                return States.recording
            case States.recording:
                if (this.#settings.pauseBeforeReview)
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


    #changeUI(actionBtnURI, labelText) {
        getContent(actionBtnURI).then((result) => {
            this.#actionButtonDOM.innerHTML = result
        })
        this.#textfieldDOM.innerHTML = labelText
    }

    #setState(state) {
        switch (state) {
            case States.idle:
                if (!this.#recorder.isEnded)
                    this.#audioPlayer.stop()
                this.#changeUI("./resources/SVGs/RecordButton.svg", "Start recording")
                break
            case States.recording:
                this.#recorder.start()
                let actionbuttonURI = this.#settings.pauseBeforeReview ? "./resources/SVGs/PauseButton.svg" : "./resources/SVGs/PlayButton.svg"
                this.#changeUI(actionbuttonURI, "Recording")
                break
            case States.hold:
                this.#recorder.stop()
                this.#changeUI("./resources/SVGs/PlayButton.svg", "Ready")
                break
            case States.reviewing:
                if (this.#settings.pauseBeforeReview)
                    this.#audioPlayer.play(this.#recorder.getLastRecording())
                else
                    this.#recorder.stop() // Automatically call playRecording on ready
                this.#changeUI("./resources/SVGs/FullstopButton.svg", "Reviewing")
                break
            default:
                break
        }

        this.#currentState = state
    }

	nextState() {
		let nextState = this.#getNextState()
		this.transitionState(nextState)
	}
    
	transitionState(state) {
        this.#setState(state)
	}

    playRecording(audioURI) {
        this.#audioPlayer.play(audioURI)
        this.transitionState(States.reviewing)
    }
}