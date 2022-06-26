const VolumeEvents = {
	volumeChanged: "volumeChanged",
}

class VolumeManager {
	#volume
	#IsPressedDown
	#sliderDOM
	#minPageOffset
	#maxPageOffset

	constructor (sliderDOM) {
		this.#volume
		this.#IsPressedDown = false
		this.#sliderDOM = sliderDOM
		this.changeVolume(0.5)

		this.#sliderDOM.addEventListener("input", (e) => {
			this.changeVolume(e.target.value/100)
		})
	}

	changeVolume(value) {
		if (value > 1)
			value = 1
		if (value < 0)
			value = 0

		this.#volume = value
		document.dispatchEvent(new CustomEvent(VolumeEvents.volumeChanged, { detail: { 'volume': value } }))
	}


}