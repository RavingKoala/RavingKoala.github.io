export {DataStorage, LocalDataStorage, GestureDataStorage }

class DataStorage {
    static exists() {
        throw new Error('Method not implemented.');
    }
    static get(key) {
        throw new Error('Method not implemented.');
    }
    static getAll() {
        throw new Error('Method not implemented.');
    }
    static set(key, value) {
        throw new Error('Method not implemented.');
    }
    static remove(key) {
        throw new Error('Method not implemented.');
    }
    static clear() {
        throw new Error('Method not implemented.');
    }
}

class GestureDataStorage extends DataStorage {
    static #gestures = null

    static #ensureInit() {
        if (this.#gestures !== null)
            return

        let gestures = localStorage.getItem("Gestures")
        
        if (gestures  !== null)
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

class LocalDataStorage extends DataStorage {

    static exists(key) {
        return (localStorage.getItem(key) !== null)
    }

    static get(key) {
        return localStorage.getItem(key)
    }

    static getKeys() {
        return Object.keys(localStorage)
    }

    static getAll() {
        let storage = {}
        Object.entries(localStorage).forEach(([key, value]) => {
            storage[key] = value
        })
        return storage
    }

    static set(key, value) {
        localStorage.setItem(key, value)
    }

    static remove(key) {
        localStorage.removeItem(key)
    }

    static clear() {
        localStorage.clear()
    }
}

class SessionDataStorage extends DataStorage {
    static exists(key) {
        return (sessionStorage.getItem(key) !== null)
    }

    static get(key) {
        return sessionStorage.getItem(key)
    }

    static getKeys() {
        return Object.keys(sessionStorage)
    }

    static getAll() {
        let storage = {}
        Object.entries(sessionStorage).forEach(([key, value]) => {
            storage[key] = value
        })
        return storage
    }

    static set(key, value) {
        sessionStorage.setItem(key, value)
    }

    static remove(key) {
        sessionStorage.removeItem(key)
    }

    static clear() {
        sessionStorage.clear()
    }
}