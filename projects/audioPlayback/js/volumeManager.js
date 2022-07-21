const VolumeEvents = {
	volumeChanged: "volumeChanged",
}

class VolumeManager {
	#volume
	#isPressedDown
	#volumeSliderDOM
	#minPageOffset
	#maxPageOffset

	constructor (volumeSliderDOM) {
		this.#volume
		this.#isPressedDown = false
		this.#volumeSliderDOM = volumeSliderDOM
		this.changeVolume(0.5)

		this.#volumeSliderDOM.querySelector(".thumb").addEventListener("mousedown", (e) => {
			this.volumeSlider_thumb_mousedown(e)
		})
		
		this.#volumeSliderDOM.addEventListener("input", (e) => {
			this.changeVolume(e.target.value / 100)
		})
		this.#volumeSliderDOM.addEventListener("mousemove", (e) => {
			this.volumeSlider_mousemove(e)
		})
		this.#volumeSliderDOM.addEventListener("mouseup", (e) => {
			this.volumeSlider_mouseup(e)
		})
		this.#volumeSliderDOM.addEventListener("mouseleave", (e) => {
			this.volumeSlider_mouseleave(e)
		})

	}

	changeVolume(value) {
		// cap to minimal and maximal value
		if (value > 1)
			value = 1
		if (value < 0)
			value = 0
		// dont update if volume level didn't change
		if (value === this.#volume)
			return
		// update
		this.#volume = value
		this.updateSlider(value)
		document.dispatchEvent(new CustomEvent(VolumeEvents.volumeChanged, { detail: { 'volume': value } }))
	}

	addVolume(value) {
		this.changeVolume(this.#volume + value)
	}

	subVolume(value) {
		this.changeVolume(this.#volume - value)
	}

	updateSlider(value) {
		this.#volumeSliderDOM.querySelector(".activeVolume").style.height = value * 100 + "%"
	}

	volumeSlider_thumb_mousedown(e) {
		this.#isPressedDown = true

		// Get latest min and max y coords of sliderRange
		let rect = this.#volumeSliderDOM.querySelector(".sliderRange").getBoundingClientRect()
		this.#minPageOffset = rect.top
		this.#maxPageOffset = rect.bottom
	}

	volumeSlider_mousemove(e) {
		if (this.#isPressedDown === true) {
			if (e.clientY - this.#minPageOffset <= 0)
				return this.changeVolume(0)

			if (e.clientY - this.#maxPageOffset >= 0)
				return this.changeVolume(1)

			let volume = (e.clientY - this.#minPageOffset) / (this.#maxPageOffset - this.#minPageOffset)
			this.changeVolume(volume)
		}
	}

	volumeSlider_mouseup(e) {
		this.#isPressedDown = false
	}

	volumeSlider_mouseleave(e) {
		this.#isPressedDown = false
	}
}