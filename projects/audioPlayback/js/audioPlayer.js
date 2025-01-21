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

    async forcePlay(blobURI) {
        await reset()

        await this.play(blobURI)
    }

    async play(blobURI) {
        if (this.isPlaying) {
            await this.reset()
        }
        
        document.dispatchEvent(new CustomEvent(AudioPlayerEvents.onPlay, { details: { 'AudioBlobURI': blobURI } }))

        this.#audioObj.src = blobURI

        this.isPlaying = true
        await this.#audioObj.play()
    }

    async stop() {
        await this.#audioObj.pause()
    }

    async reset(){
        await this.stop()
        this.#audioObj.src = ""
    }

}