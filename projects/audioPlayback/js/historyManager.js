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

    constructor (historyBoardDOM, audioPlayer, settings) {
        this.entryCounter = 0
        this.#audioPlayer = audioPlayer
        this.#historyBoardDOM = historyBoardDOM

        document.addEventListener(AudioPlayerEvents.onEnded, () => {
            for (var historyItem of this.#historyBoardDOM.querySelectorAll(".historyItem")) {
                if (!settings.manualContinue)
                    this.changeState(historyItem, States.idle)
            }
        })
    }

    #createHistoryEntryDom(blobURI, id) {
        let historyEntryTemplate = document.getElementById('historyItemTemplate').content.cloneNode(true);

        var historyEntryDOM = historyEntryTemplate.querySelector(".historyItem")
        historyEntryDOM.dataset.state = States.idle
        historyEntryDOM.dataset.audioUri = blobURI

        var inputbox = historyEntryTemplate.querySelector("#nameBoxInput")
        inputbox.value = `Recording ${id}`
        inputbox.id = `recording${id}`

        return historyEntryTemplate
    }
    
    addHistoryEntry(blobURI) {
        let domElement = this.#createHistoryEntryDom(blobURI, this.entryCounter)
        this.#historyBoardDOM.querySelector("#historyList").prepend(domElement)
        domElement = this.#historyBoardDOM.querySelector("#historyList .historyItem:first-child")
        domElement.querySelector(".historyActionButton").addEventListener("click", (e) => {
            let state = this.#getNextState(domElement, domElement.dataset.state)
            this.changeState(domElement, state)
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

    //TODO: check if function is useful
    deleteEntry(entryDOM) {
        
    }

    downloadEntry(entryDOM) {
        let audioURI = entryDOM.dataset.audioUri
        let infoInput = entryDOM.querySelector(".nameBox input")
        let filename = `${infoInput.value}.wav`

        // const audioFile = new File([audioURI], filename, {type: "audio/wav"})

        const downloadLink = document.createElement('a');

        downloadLink.id = infoInput.id
        downloadLink.href = audioURI
        downloadLink.download = filename

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    #getNextState(entryDOM, state) {
        if (!state)
            state = entryDOM.dataset.state

        switch (state) {
            case States.idle:
                return States.reviewing
            case States.reviewing:
                return States.idle
            default:
                throw Error("Unknown State")
        }
    }

    changeState(entryDOM, state) {
        if (!state)
            state = entryDOM.dataset.state
        
        switch (state) {
            case States.idle:
                this.#audioPlayer.stop()
                this.#changeUI(entryDOM, "./resources/SVGs/PlayButton.svg")
                break
            case States.reviewing:
                let audioBlobUri = entryDOM.dataset.audioUri
                this.#audioPlayer.play(audioBlobUri)
                this.#changeUI(entryDOM, "./resources/SVGs/FullstopButton.svg")
                break
            default:
                break
        }

        entryDOM.dataset.state = state
    }

    #changeUI(entryDOM, actionBtnURI) {
        getContent(actionBtnURI).then((result) => {
            entryDOM.querySelector(".historyActionButton").innerHTML = result
        })
    }
}