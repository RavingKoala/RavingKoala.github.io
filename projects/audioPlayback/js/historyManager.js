const HistoryEvents = {
    onPlay: "onPlay",
}

var HistorySettings = {
    //// PlayASAP: new Error("PlayASAP was never set to 'true' or 'false'"), // bool
}

class HistoryManager {
    static entryCounter
    #audioPlayer
    #historyBoardDOM
    #history
    constructor (historyBoardDOM, audioPlayer, settings) {
        this.State = new HistoryStateManager(settings)
        this.UIManager = new HistoryUIStateManager(actionButtonDOM, settings)
        this.MediaManager = new HistoryMediaStateManager(audioPlayer, settings)

        this.entryCounter = 0
        this.#audioPlayer = audioPlayer
        this.#historyBoardDOM = historyBoardDOM
        this.#history = [] // contains blob URIs
    }

    #createHistoryEntryDom(blobURI, id) {
        let historyEntryDOM = document.getElementById('historyItemTemplate').content.cloneNode(true);



        var inputbox = historyEntryDOM.querySelector("#nameBoxInput")
        inputbox.value = `Reinputboxcording ${id}`
        inputbox.id = `recording${id}`
        inputbox.dataset.audioUri = blobURI

        // add event listeners
        // var playButton = historyEntryDOM.getElementById("playButton")
        // playButton.addEventListener("click", () => {
        //     
        // })

        return historyEntryDOM
    }
    
    addHistoryEntry(blobURI) {
        this.#history.push(blobURI)
        
        let domElement = this.#createHistoryEntryDom(blobURI, this.entryCounter)
        this.#historyBoardDOM.querySelector("#historyList").prepend(domElement)

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
        return this.#history
    }

}

class HistoryStateManager {
    currentState

    constructor (settings) {
        this.currentState = States.idle
    }

    getNextState(state) {
        if (!state)
            state = this.currentState

        switch (state) {
            case States.idle:
                return States.reviewing
            case States.reviewing:
                return States.idle
            default:
                throw Error("Unknown State")
        }
    }
}

class HistoryUIStateManager {
    actionButtonDOM


    constructor (actionButtonDOM, textfieldDOM, settings) {
        this.actionButtonDOM = actionButtonDOM
        this.textfieldDOM = textfieldDOM
        this.settings = settings
    }

    changeState(state) {
        switch (state) {
            case States.idle:
                this.#changeUI("./resources/SVGs/PlayButton.svg", "Recording")
                break
            case States.reviewing:
                this.#changeUI("./resources/SVGs/FullstopButton.svg", "Reviewing")
                break
            default:
                break
        }
    }

    #changeUI(actionBtnURI, labelText) {
        getContent(actionBtnURI).then((result) => {
            this.actionButtonDOM.innerHTML = result
        })
        this.textfieldDOM.innerHTML = labelText
    }
}



class HistoryMediaStateManager {
    #Audio

    constructor (audioPlayer) {
        this.#Audio = audioPlayer
    }

    changeState(state) {
        switch (state) {
            case States.idle:
                this.#Audio.stop()
            case States.reviewing:
                this.#Audio.play() // Automatically call playRecording on ready
                break
            default:
                break
        }
    }
}