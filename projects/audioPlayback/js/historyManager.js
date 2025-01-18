const HistoryEvents = {
    //// onReady: "OnReady",
    //// onEnded: "OnEnded",
    //// onPlay: "onPlay",
}

var HistorySettings = {
    //// PlayASAP: new Error("PlayASAP was never set to 'true' or 'false'"), // bool
}

class HistoryManager {
    static entryCounter
    #audioObj
    #history
    constructor (settings, audioObject) {
        this.entryCounter = 0
        this.#audioObj = audioObject
        this.#history = [] // contains blob URIs
    }

    addHistoryEntry(blobURI) {
        this.#history.push(blobURI)
        this.entryCounter++
    }

    playEntry(indexOrID) {

    }

    //TODO: check if function is useful
    deleteEntry(indexOrID) {

    }

    downloadEntry(indexOrID) {

    }

    //TODO: check if function is useful
    #getHistory() {

    }

}
