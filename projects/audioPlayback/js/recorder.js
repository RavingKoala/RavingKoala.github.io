const RecorderEvents = {
	onReady: "OnReady",
	onEnded: "OnEnded",
	onRecordPermsUpdate: "OnRecordPermsUpdate",
    onPlay: "onPlay",
}

var RecorderSettings = {
	PlayASAP: new Error("PlayASAP was never set to 'true' or 'false'"), // bool
}

class Recorder {
	isRecording
	isPlaying
	#playASAP
	#audioRecorder
	#mediaStream
	#lastBlobRaw
	#audioObj
    constructor (settings, audioObject) {
		this.isRecording = false
		this.isPlaying = false
		this.#playASAP = settings.PlayASAP
		this.#mediaStream
		this.#lastBlobRaw
        this.#audioObj = audioObject
		this.setVolume(0.5)

		this.#audioObj.onpause = () => {// also gets triggerd by triggers on onended
			this.isPlaying = false
			document.dispatchEvent(new Event(RecorderEvents.onEnded))
		}

		this.requestPerms()
	}

	processData(audioClip) {
		this.#lastBlobRaw = []
		this.#lastBlobRaw.push(audioClip.data)
		const audioBlob = new Blob(this.#lastBlobRaw, { type: "audio/ogg" })
		const url = window.URL.createObjectURL(audioBlob)
		this.#audioObj.src = url
		// Tear down after recording.
		this.#audioRecorder.stream.getTracks().forEach(t => t.stop())
		this.#audioRecorder = null
		if (this.#playASAP)
			this.playRecording()
	}

	async requestPerms() {
		await window.navigator.mediaDevices.getUserMedia(
			{ audio: true }
		).then((stream) => {
			this.#mediaStream = stream

			document.dispatchEvent(new CustomEvent(RecorderEvents.onRecordPermsUpdate, { detail: { 'IsRecAllowed': true } }))
		}).catch((e) => {
			console.error(e)

			document.dispatchEvent(new CustomEvent(RecorderEvents.onRecordPermsUpdate, { detail: { 'IsRecAllowed': false } }))
		})
	}

	setVolume(value) {
		this.#audioObj.volume = value
	}

	setupRecorder() {
		this.#audioRecorder = new MediaRecorder(this.#mediaStream)

		this.#audioRecorder.ondataavailable = (data) => {
			this.processData(data)

			document.dispatchEvent(new Event(RecorderEvents.onReady))
		}
	}

	async startRecording() {
		await this.requestPerms()
		this.setupRecorder()
		this.#audioRecorder.start()
		this.isRecording = true
	}

	stopRecording() {
		this.#audioRecorder.stop()
		this.isRecording = false
	}

	playRecording() { // never call playRecording if settings.PlayASAP === true
        document.dispatchEvent(new Event(RecorderEvents.onPlay))

		this.isPlaying = true
		this.#audioObj.play()
	}

	stopPlaying() {
		this.#audioObj.pause()
	}
}