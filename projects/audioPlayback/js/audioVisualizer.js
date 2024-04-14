const fpsToMillisec = (num) => 1000/num

const minDecibels = -100
const maxDecibels = -20
const fftSize = 2048
const smoothingTimeConstant = 0.8

const lowFreqBound = 20     // Hz
const highFreqBound = 20000 // Hz

const barsNr = 12; // number of bars in the svg (these are animated, and not created, make sure the match the amount on children in svg)
const minBarSize = 20

class AudioVisualizer {
    // logic components
    #audioElement
    #audioContext
    #audioSource // created from audioContext and is never used outside of setup
    #analyser
    #animationInterval
    // dataprocessing
    #dataArray
    // data representation
    #soundWavesDOM
    #svgHeight
    
    //temp
    #maybe

    constructor(soundWavesDOM, audioElement) {
        this.#soundWavesDOM = soundWavesDOM
        this.#audioElement = audioElement
        this.#audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.#audioSource = this.#audioContext.createMediaElementSource(this.#audioElement)
        this.#analyser = this.#audioContext.createAnalyser()
        this.#audioSource.connect(this.#analyser)
        this.#analyser.connect(this.#audioContext.destination)

        this.#analyser.minDecibels = minDecibels
        this.#analyser.maxDecibels = maxDecibels
        this.#analyser.fftSize = fftSize
        this.#analyser.smoothingTimeConstant = smoothingTimeConstant
        this.#svgHeight = this.#soundWavesDOM.getAttribute("viewBox").split(" ")[3]

        this.#dataArray = new Uint8Array(this.#analyser.frequencyBinCount)
        this.#maybe = 0;
    }

    #truncateRangeToFreqency(dataArray, minHz = 20, maxHz = 20000) {
        minHz = Math.max(minHz, 20)
        maxHz = Math.min(maxHz, 20000)

        let minIndex = Math.floor(minHz / (this.#audioContext.sampleRate / this.#analyser.fftSize))
        let maxIndex = Math.ceil(maxHz / (this.#audioContext.sampleRate / this.#analyser.fftSize))

        return dataArray.slice(minIndex, maxIndex)
    }

    #medianNTimesInRange(dataArr, n) {
        // compress dataArr.length to n
        // compress using the median
        let retArray = new Uint8Array(n)
        let chunkSize = Math.floor(dataArr.length / n)
        let chunkArr = new Uint8Array(chunkSize) // chunk of dataArr to get median from
        for (let i = 0; i < n-1; i++) {
            chunkArr = dataArr.slice(i*chunkSize, (i+1)*chunkSize)
            // let median = chunkArr.sort((a,b)=>a-b)[chunkSize/2]
            let strongest = chunkArr.sort((a, b) => a - b)[0]
            // if (!(this.#maybe % 20)) // TEMP
            //     console.log(strongest);
            retArray[i] = strongest
        }
        return retArray
    }

    startAnimation() {
        this.#animationInterval = setInterval(() => {
            this.animate()
        }, fpsToMillisec(60))
    }

    stopAnimtaion() {
        if (this.#animationInterval != null)
        clearInterval(this.#animationInterval)

        this.#animationInterval = null;
    }

    animate() {
        this.#analyser.getByteFrequencyData(this.#dataArray)

        const truncatedData = this.#truncateRangeToFreqency(this.#dataArray, lowFreqBound, highFreqBound)
        let bardata = this.#medianNTimesInRange(truncatedData, 12)

        for (let i = 0; i < bardata.length; i++) {
            let rect = this.#soundWavesDOM.children[i]
            let size = bardata[i] / 255 * this.#svgHeight
            let offset = size / 2
            let minimalBarSizeOffset = minBarSize / 2
            rect.setAttribute("y", (this.#svgHeight / 2) - offset - minimalBarSizeOffset)
            rect.setAttribute("height", size + minBarSize)
        }

        this.#maybe++
    }
}