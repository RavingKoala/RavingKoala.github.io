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
    #currentState

    constructor (historyBoardDOM, audioPlayer, settings) {
        this.#currentState = States.idle
        this.entryCounter = 0
        this.#audioPlayer = audioPlayer
        this.#historyBoardDOM = historyBoardDOM
        this.#history = [] // contains blob URIs
    }

    #createHistoryEntryDom(blobURI, id) {
        let historyEntryDOM = document.getElementById('historyItemTemplate').content.cloneNode(true);

        var inputbox = historyEntryDOM.querySelector("#nameBoxInput")
        inputbox.value = `Recording ${id}`
        inputbox.id = `recording${id}`
        inputbox.dataset.audioUri = blobURI

        return historyEntryDOM
    }
    
    addHistoryEntry(blobURI) {
        let domElement = this.#createHistoryEntryDom(blobURI, this.entryCounter)
        this.#historyBoardDOM.querySelector("#historyList").prepend(domElement)
        domElement = this.#historyBoardDOM.querySelector("#historyList .historyItem:first-child")
        domElement.querySelector(".playButton").addEventListener("click", (e) => {
            this.playEntry(domElement)
        })
        domElement.querySelector(".downloadButton").addEventListener("click", (e) => {
            this.downloadEntry(domElement)
        })
        
        for (let node of domElement.querySelectorAll("include")) {
            let file = node.getAttribute("src")
            replaceNodeWithContent(node, file)
        }

        if (this.#historyBoardDOM.classList.contains("hide"))
            this.#historyBoardDOM.classList.remove("hide")
        
        this.entryCounter++
    }
    
    playEntry(entryDOM) {
        let audioBlobUri = entryDOM.querySelector(".nameBox input").dataset.audioUri
        this.#audioPlayer.play(audioBlobUri)
    }

    //TODO: check if function is useful
    deleteEntry(entryDOM) {
        
    }

    downloadEntry(entryDOM) {
        let infoInput = entryDOM.querySelector(".nameBox input")
        let audioURI = infoInput.dataset.audioUri
        let filename = `${infoInput.value}.mp3`

        const downloadLink = document.createElement('a');

        downloadLink.id = infoInput.id
        downloadLink.href = audioURI
        downloadLink.download = filename

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
    }

    #getNextState(state) {
        if (!state)
            state = this.#currentState

        switch (state) {
            case States.idle:
                return States.reviewing
            case States.reviewing:
                return States.idle
            default:
                throw Error("Unknown State")
        }
    }

    changeState(state) {
        if (!state)
            state = this.#currentState

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

        switch (state) {
            case States.idle:
                this.#audioPlayer.stop()
            case States.reviewing:
                this.#audioPlayer.play() // Automatically call playRecording on ready
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