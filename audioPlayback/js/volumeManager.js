const VolumeEvents = {
	volumeChanged: "volumeChanged",
}

class VolumeManager {
	#volume
	constructor () {
		this.#volume

		this.changeVolume(0.5)
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