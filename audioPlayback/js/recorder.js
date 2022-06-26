const RecorderEvents = {
	onReady: "onReady",
	onStopped: "onStopped",
	onEnded: "onEnded",
	onEndedOrStopped: "onEndedOrStopped", // only call this autside of this file
	onRecordPermsUpdate: "onRecordPermsUpdate"
}

document.addEventListener(RecorderEvents.onStopped, () => { document.dispatchEvent(new Event(RecorderEvents.onEndedOrStopped)) })
document.addEventListener(RecorderEvents.onEnded, () => { document.dispatchEvent(new Event(RecorderEvents.onEndedOrStopped)) })

var RecorderSettings = {
	PlayASAP: new Error("PlayASAP was never set to 'true' or 'false'"), // bool
}

class Recorder {
	isRecording
	isPlaying
	#volume
	#playASAP
	#audioRecorder
	#mediaStream
	#lastBlobRaw
	#audioObj
	constructor (settings) {
		this.isRecording = false
		this.isPlaying = false
		this.#playASAP = settings.PlayASAP
		this.#mediaStream
		this.#lastBlobRaw
		this.#audioObj = new Audio()
		this.setVolume(1)

		this.#audioObj.onpause = () => {
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
			console.error(e);

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
		if (!this.#playASAP) {
			this.isPlaying = true
			this.#audioObj.play()
		}
	}

	stopPlaying() {
		this.#audioObj.pause()
	}
}