const RecorderEvents = {
	onFinished: "OnFinished",
	onRecordPermsUpdate: "OnRecordPermsUpdate",
}
class Recorder {
	isRecording
	#audioRecorder
	#mediaStream
	#lastBlobRaw
    #lastReadyRecordingBlobURI
    #audioObj

    constructor (audioObject) {
		this.isRecording = false
        this.#audioRecorder = null
        this.#mediaStream = null
		this.#lastBlobRaw = []
        this.#lastReadyRecordingBlobURI = null
        this.#audioObj = audioObject

		this.#audioObj.onpause = () => {// also gets triggerd by triggers on onended
			this.isPlaying = false
			document.dispatchEvent(new Event(RecorderEvents.onEnded))
		}

		this.requestPerms()
    }

    async requestPerms() {
        await window.navigator.mediaDevices.getUserMedia(
            { audio: true }
        ).then((stream) => {
            this.#mediaStream = stream

            document.dispatchEvent(new CustomEvent(RecorderEvents.onRecordPermsUpdate, { detail: { isRecAllowed: true } }))
        }).catch((e) => {
            console.error(e)

            document.dispatchEvent(new CustomEvent(RecorderEvents.onRecordPermsUpdate, { detail: { isRecAllowed: false } }))
        })
    }

	processData(audioClip) {
		this.#lastBlobRaw = []
		this.#lastBlobRaw.push(audioClip.data)
		const audioBlob = new Blob(this.#lastBlobRaw, { type: "audio/mp3" })
		const url = window.URL.createObjectURL(audioBlob)
		// Tear down after recording.
		this.#audioRecorder.stream.getTracks().forEach(t => t.stop())
		this.#audioRecorder = null

        document.dispatchEvent(new CustomEvent(RecorderEvents.onFinished, { detail: { "audioBlobURI": url } }))
	}

	setup() {
		this.#audioRecorder = new MediaRecorder(this.#mediaStream)

		this.#audioRecorder.ondataavailable = (data) => {
			this.processData(data)
		}
	}

	async start() {
		await this.requestPerms()
		this.setup()
		this.#audioRecorder.start()
		this.isRecording = true
	}

	stop() { 
        if (this.#audioRecorder !== null)
		this.#audioRecorder.stop()
		this.isRecording = false
	}

    // gets the last completed recording as blob URI
    getLastRecording() {
        return this.#lastReadyRecordingBlobURI
    }
}