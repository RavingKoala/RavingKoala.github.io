const RecorderEvents = {
	onReady: "OnReady",
	onPlaying: "OnPlaying",
	onStopped: "OnStopped",
	onEnded: "OnEnded",
	onEndedOrStopped: "OnEndedOrStopped",
	onRecordPermsUpdate: "OnRecordPermsUpdate",
}

class Recorder {
	audioStream
	audioRecorder
	IsRecording
	AudioBlobHistory
	LastBlobRaw
	AudioDOM
	#playASAP
	constructor (audioDOM) {
		this.audioStream
		this.audioRecorder
		this.IsRecording = false
		this.AudioBlobHistory = []
		this.LastBlobRaw
		this.#playASAP
		this.AudioDOM = audioDOM

		this.requestPerms()

		// Eventlistners
		document.addEventListener(RecorderEvents.onReady, (e) => {
			this.processData(e)
		})
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
		this.AudioBlobHistory.push(audioBlob)
		this.AudioDOM.src = window.URL.createObjectURL(audioBlob)
		// Tear down after recording.
		this.audioRecorder.stream.getTracks().forEach(t => t.stop())
		this.audioRecorder = null
		if (this.#playASAP) {
			this.AudioDOM.play()
			this.#playASAP = false
		}
	}

	requestPerms() {
		window.navigator.mediaDevices.getUserMedia(
			{ audio: true }
		).then(stream => {
			this.audioStream = stream
			document.dispatchEvent(new CustomEvent(RecorderEvents.onRecordPermsUpdate, { detail: { 'IsRecAllowed': true } }))
		}).catch((e) => {
			document.dispatchEvent(new CustomEvent(RecorderEvents.onRecordPermsUpdate, { detail: { 'IsRecAllowed': false } }))
		})
	}

	setupRecorder() {
		this.audioRecorder = new MediaRecorder(this.audioStream)

		this.audioRecorder.ondataavailable = (e) => {
			this.processData(e)
			// play recording
			document.dispatchEvent(new Event(RecorderEvents.onReady))
		}
	}

	cleanupLastRecording() {
		this.AudioDOM.pause()
		if (this.AudioDOM.hasAttribute("src"))
			this.AudioDOM.removeAttribute("src")
	}

	async startRecording() {
		await this.requestPerms()
		this.setupRecorder()
		if (this.audioStream) {
			// TODO option = .5 sec cooldown
			this.audioRecorder.start()
			this.IsRecording = true
		}
	}

	stopRecording() {
		if (this.IsRecording) {
			// TODO option = .5 sec cooldown
			this.audioRecorder.stop()
			cleanupLastRecording()
			this.IsRecording = false
			document.dispatchEvent(new Event(RecorderEvents.onStopped))
			document.dispatchEvent(new Event(RecorderEvents.onEndedOrStopped))
		}
	}

	playRecording() {
		if (this.AudioDOM.hasAttribute("src"))
			this.AudioDOM.play()
		else
			this.#playASAP = true
	}
}