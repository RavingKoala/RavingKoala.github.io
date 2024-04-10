export {DataStorage, LocalDataStorage, SessionDataStorage }

var storageTypes = {
    localStorage: "localStorage",
    sessionStorage: "sessionStorage"
    // cookie: "cookie" // not available yet
}
const StorageEvents = {
    onChange: "onChange"// storageType, key, oldValue newValue
}

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
        return (localStorage.getItem(key) !== undefined)
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
        return (sessionStorage.getItem(key) !== undefined)
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

class CookieCollection {
    collection
    constructor () {
        this.collection = []
    }

    add(cookie) {
        if (!cookie instanceof Cookie)
            throw new Error("Parameter 'cookie' is not of type 'Cookie'!")

        this.collection.push(cookie)
    }

    remove(item) {
        let key
        if (item instanceof Cookie)
            key = item.key
        else if (typeof item === "string")
            key = item
        else
            throw new Error("Parameter is an unexpected type, only type 'Cookie' and 'string' are allowed")

        this.collection = this.collection.filter((entry) => entry.key !== key)
    }
}
class Cookie {
    Key
    Value
    Flags
    constructor (key, value = "", flags = new CookieFlags()) {
        if (!flags instanceof CookieFlags)
            throw new Error("flags must be of type 'CookieFlags'!")

        this.key = key
        this.Value = value
        this.Flags = flags
    }
    toString() {
        return encodeURIComponent(this.Key) + "=" + encodeURIComponent(this.Value) + " " + this.Flags.toString()
    }
}
class CookieFlags {
    Expires
    MaxAge
    Domain
    Path
    Secure
    HttpOnly
    SameSite
    constructor (expires = new Date().setMonth(new Date().getMonth() + 1), maxAge = undefined, domain = undefined, path = "/", secure = true, httpOnly = true, sameSite = undefined) {
        if (!expires instanceof Date)
            throw new Error("Parameter 'expires' is not of type 'Date'!")

        this.Expires = expires
        this.MaxAge = maxAge
        this.Secure = secure
        this.HttpOnly = httpOnly
        this.Domain = domain
        this.Path = path
        this.SameSite = sameSite
    }

    toString() {
        let string = ""
        if (this.Expires !== undefined) string += this.Expires + " "
        if (this.MaxAge !== undefined) string += this.MaxAge + " "
        if (this.Domain !== undefined) string += this.Domain + " "
        if (this.Path !== undefined) string += this.Path + " "
        if (this.Secure) string += "Secure "
        if (this.HttpOnly) string += "HttpOnly "

        if (string.length > 1)
            string = string.slice(0, -2) //trim last " "

        return string
    }
}
class CookieDataStorage extends Storage {
    static #CookiesAllowed = false
    static get CookiesAllowed() { return CookieDataStorage.#CookiesAllowed }
    static #cookieCollection = new CookieCollection()

    static exists(key) {
        if (!CookieDataStorage.#CookiesAllowed)
            throw new Error("Cookies are not allowed!")
        key = encodeURIComponent(key)

        return document.cookie.split(";").some((item) => item.trim().startsWith(key + "="))
    }

    static get(key) {
        if (!CookieDataStorage.#CookiesAllowed)
            throw new Error("Cookies are not allowed!")
        key = encodeURIComponent(key)

        let cookies = document.cookie.split(";")

        let cookie = cookies.find(row => row.startsWith(encodeURIComponent(key)))
        let value = cookie?.split('=')[1]
        return decodeURIComponent(value)
    }

    static set(cookie) {
        if (!CookieDataStorage.#CookiesAllowed)
            throw new Error("Cookies are not allowed!")
        if (!cookie instanceof Cookie)
            throw new Error("Can only set a cookie of type Cookie()!")

        document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value)
    }

    static remove(key) {
        if (!CookieDataStorage.#CookiesAllowed)
            throw new Error("Cookies are not allowed!")
        if (typeof key !== "string")
            throw new Error("Parameter is not of type string!")
        key = encodeURIComponent(key)

        document.cookie = key + "= Max-Age=-1"
    }

    static clear() {
        if (!CookieDataStorage.#CookiesAllowed)
            throw new Error("Cookies are not allowed!")

        var cookies = document.cookie.split(";")

        for (let cookie in cookies) {
            var eqPos = cookie.indexOf("=")
            var key = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie
            document.cookie = key + "= Max-Age=-1"
        }
    }
}