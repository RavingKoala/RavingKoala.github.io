const RecorderEvents = {
	onReady: new Event("onReady"),
	onStopped: new Event("onStopped"),
	onEnded: new Event("onEnded"),
	onEndedOrStopped: new Event("onEndedOrStopped")
}

class Recorder {
	mediaStream
	audioRecorder
	recording
	AudioBlobList
	lastBlobRaw
	audioDOM
	#playASAP
	constructor (waveformDOM) {
		this.mediaStream
		this.audioRecorder
		this.recording = false
		this.AudioBlobList = []
		this.lastBlobRaw
		this.audioDOM = document.createElement("audio")
		document.body.appendChild(this.audioDOM) // TODO: append to waveformDOM

		// Eventlistners
		document.addEventListener(RecorderEvents.onReady, (e) => {
			this.processData(e)
		});
		// TODO: MAKE THIS WORK
		// this.audioDOM.onended = (e) => {
		// 	this.audioDOM.dispatchEvent(RecorderEvents.onEnded)
		// 	this.audioDOM.dispatchEvent(RecorderEvents.onEndedOrStopped)
		// }
	}

	processData(audioClip) {
		this.lastBlobRaw = []
		this.lastBlobRaw.push(audioClip.data)
		const audioBlob = new Blob(this.lastBlobRaw, { type: "audio/ogg" })
		this.AudioBlobList.push(audioBlob)
		this.audioDOM.setAttribute('src', window.URL.createObjectURL(audioBlob))
		// Tear down after recording.
		this.audioRecorder.stream.getTracks().forEach(t => t.stop())
		this.audioRecorder = null
		if (this.#playASAP) {
			this.audioDOM.play()
			this.#playASAP = false
		}
	}

	async requestPerms() {
		this.mediaStream = await window.navigator.mediaDevices.getUserMedia(
			{ audio: true }
		)
	}

	setupRecorder() {
		this.audioRecorder = new MediaRecorder(this.mediaStream)

		this.audioRecorder.ondataavailable = (e) => {
			this.processData(e)
			// play recording
			this.audioDOM.dispatchEvent(RecorderEvents.onReady)
		}
	}

	async startRecording() {
		await this.requestPerms();
		this.setupRecorder()
		if (this.mediaStream) {
			this.recording = true;
			this.audioRecorder.start()
		} else {
			throw new Error("Recording audio is not allowed!")
		}
	}

	stopRecording() {
		// TODO option = .5 sec cooldown
		this.audioRecorder.stop()
		this.recording = false;
		this.audioDOM.dispatchEvent(RecorderEvents.onStopped)
		this.audioDOM.dispatchEvent(RecorderEvents.onEndedOrStopped)
	}

	playRecording() {
		if (this.audioDOM.hasAttribute("src"))
			this.audioDOM.play()
		else
			this.#playASAP = true

	}
}