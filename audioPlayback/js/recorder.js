const RecorderEvents = {
	onReady: "onReady",
	onStopped: "onStopped",
	onEnded: "onEnded",
	onEndedOrStopped: "onEndedOrStopped", // only call this autside of this file
	onRecordPermsUpdate: "onRecordPermsUpdate"
}

document.addEventListener(RecorderEvents.onStopped, () => { document.dispatchEvent(new Event(RecorderEvents.onEndedOrStopped)) })
document.addEventListener(RecorderEvents.onEnded, () => { document.dispatchEvent(new Event(RecorderEvents.onEndedOrStopped)) })

class Recorder {
	isRecording
	isEnded
	#playASAP
	#audioRecorder
	#mediaStream
	#audioObj
	constructor () {
		this.isRecording = false
		this.isEnded = true
		this.#mediaStream
		this.lastBlobRaw
		this.#audioObj = new Audio()

		this.#audioObj.onpause = () => {
			this.isEnded = true
			document.dispatchEvent(new Event(RecorderEvents.onEnded))
		}

		this.requestPerms()
	}

	processData(audioClip) {
		this.lastBlobRaw = []
		this.lastBlobRaw.push(audioClip.data)
		const audioBlob = new Blob(this.lastBlobRaw, { type: "audio/ogg" })
		const url = window.URL.createObjectURL(audioBlob)
		// history
		// blobHistory.push(audioBlob) // option for later
		this.#audioObj.src = url
		// Tear down after recording.
		this.#audioRecorder.stream.getTracks().forEach(t => t.stop())
		this.#audioRecorder = null
		// play recording
		this.isEnded = false
		// TODO setting make this inbetween step
		this.#audioObj.play()
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

	setupRecorder() {
		this.#audioRecorder = new MediaRecorder(this.#mediaStream)

		this.#audioRecorder.ondataavailable = (data) => {
			this.processData(data)
			// play recording
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
		// TODO setting make this optional
		// await new Promise(res => setTimeout(res, 500))
		this.#audioRecorder.stop()
		this.isRecording = false
	}

	playRecording() { // option for later

	}

	stopPlaying() {
		this.#audioObj.pause()
	}
}