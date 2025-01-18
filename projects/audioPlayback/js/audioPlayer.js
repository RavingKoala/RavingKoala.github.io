const AudioPlayerEvents = {
    onEnded: "OnEnded",
    onPlay: "onPlay",
}

class AudioPlayer {
    isPlaying
    #audioObj

    constructor (audioObject) {
        this.isPlaying = false
        this.#audioObj = audioObject
        this.setVolume(0.5)

        this.#audioObj.onpause = () => {// also gets triggerd by triggers on onended
            this.isPlaying = false
            document.dispatchEvent(new Event(AudioPlayerEvents.onEnded))
        }
    }

    setVolume(value) {
        this.#audioObj.volume = value
    }

    forcePlay(blobURI) {
        reset()

        this.play(blobURI)
    }

    play(blobURI) {
        document.dispatchEvent(new CustomEvent(AudioPlayerEvents.onPlay, { details: { 'AudioBlobURI': blobURI } }))

        this.#audioObj.src = blobURI

        this.isPlaying = true
        this.#audioObj.play()
    }

    stop() {
        this.#audioObj.pause()
    }

    reset(){
        stop()
        this.#audioObj.src = ""
    }

}