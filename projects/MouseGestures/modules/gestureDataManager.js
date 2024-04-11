import { DataStorage } from "./dataManager.js"

export { GestureDataStorage }

class GestureDataStorage extends DataStorage {
    static #gestures = null

    static #ensureInit() {
        if (this.#gestures !== null)
            return

        let gestures = localStorage.getItem("Gestures")

        if (gestures !== null)
            this.#gestures = JSON.parse(gestures)
        else
            this.#gestures = {}
    }

    static #saveChanges() {
        let gestureStr = JSON.stringify(this.#gestures)
        localStorage.setItem("Gestures", gestureStr)
    }

    static exists(key) {
        this.#ensureInit()

        return this.#gestures.hasOwnProperty(key)
    }

    static get(key) {
        this.#ensureInit()

        let value = this.#gestures[key]
        return value !== undefined ? value : null
    }

    static getAll() {
        this.#ensureInit()

        return this.#gestures
    }

    static set(key, value) {
        this.#ensureInit()

        this.#gestures[key] = value

        this.#saveChanges()
    }

    static remove(key) {
        this.#ensureInit()

        // remove
        delete this.#gestures[key];

        this.#saveChanges()
    }

    static clear() {
        localStorage.removeItem("Gestures")
    }
}