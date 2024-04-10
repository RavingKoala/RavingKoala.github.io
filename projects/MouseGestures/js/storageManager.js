export {DataStorage, LocalDataStorage }

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