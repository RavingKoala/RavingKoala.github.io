var VoiceLines = {
	"Affirmative": "Affirmative",
	"Agree": "Agree",
	"Radio Affirmitive": "Radio.Affirmitive",
	"Radio 10": "Radio.Num10",
}

var Colors = {
	"Default": "",
	"White": "",
	"Grey": "",
	"Light Red": "",
	"Dark Red": "",
	"Covert Red": "",
	"Orchid": "",
	"Gold": "",
	"Light Green": "",
	"Lime": "",
	"Green": "",
	"Blue": "",
	"Dark Blue": "",
}

var Commands = {
	"Radio prefix": "playerradio",
	"Newline prefix": "",
	"Player indicator": "",
	"Knife Prefix": "★",
	"StatTrak prefix": "StatTrak™",
}

function copy() {
	copyRadioCommand()
	addToHistory(getValueFromId("result"))
}

function copyRadioCommand(id = "result") {
	let copyText = document.getElementById(id)
	copyText.select()
	copyText.setSelectionRange(0, 99999)
	document.execCommand("copy")
}

function addOptionsToId(id, obj) {
	Object.keys(obj).forEach((name) => {
		let radioOption = document.createElement("option")
		radioOption.innerHTML = name
		radioOption.value = name
		document.getElementById(id).add(radioOption)
	})
}

function appendUpdateListener(elements, onAction) {
	if (typeof elements !== "object" || typeof onAction !== "string") return Error("Wrong arguments to AppendUpdateListener")

	for (let i = 0; i < elements.length; i++) {
		let element = elements[i]
		element.addEventListener(onAction, generateCommand)
	}
}

/*** History ***/

var coppiedCommands = []

function addToHistory(text) {
	coppiedCommands.unshift(text) // Add to history (front of array)
	updateHistoryUi()
	if (coppiedCommands.length > 10) removeLastFromHistory() // limit history length (max 10)
}

function updateHistoryUi() {
	let historyContainerDOM = document.getElementById("historyItemsContainer")
	// clear history
	historyContainerDOM.innerHTML = ""
	// add history
	if (coppiedCommands.length > 0) {
		let historyInnerHTML = ""
		coppiedCommands.forEach((command, index) => {
			historyInnerHTML += historyItem(index, command)
		})
		historyContainerDOM.innerHTML = historyInnerHTML
	}
	// empty? hide/show history
	coppiedCommands.length > 0 ? removeClass("historySection", "invisible") : addClass("historySection", "invisible")
}

function clearHistory() {
	coppiedCommands = []
	updateHistoryUi()
}

function removeLastFromHistory() {
	coppiedCommands.splice(coppiedCommands.length - 1, 1)
}

/*** class manipulation  ***/

function addClass(id, className) {
	let element = document.getElementById(id)
	if (element.classList.contains(className)) element.classList.add(className)
}

function removeClass(id, className) {
	let element = document.getElementById(id)
	if (element.classList.contains(className)) element.classList.remove(className)
}

/*** interactive UI commands ***/
function getValueFromId(id) {
	let element = document.getElementById(id)
	return element.value
}

function isCheckedFromId(id) {
	let element = document.getElementById(id)
	return element.checked
}

function generateCommand() {
	// build strings
	let resultString = ""
	// builld start
	let RadioCommand = VoiceLines[getValueFromId("voiceLine")]

	resultString += `${Commands["Radio prefix"]} ${RadioCommand}`

	resultString += ' "'
	// build playername
	if (isCheckedFromId("playerCheck")) {
		let newLine = isCheckedFromId("NewLineCheck") ? Commands["Newline prefix"] : ""
		let playerIndicator = isCheckedFromId("playerCheck") ? Commands["Player indicator"] : ""
		let PlayerColor = Colors[getValueFromId("playerNameDropdown")]
		let PlayerName = getValueFromId("playerName")

		resultString += `${newLine}${playerIndicator}${PlayerColor}${PlayerName} `
	}
	// build message
	let ColorPrefix = Colors[getValueFromId("MessageDropdown")]
	let TextLine = getValueFromId("message")
	resultString += `${ColorPrefix}${TextLine} `

	// build weapon
	if (isCheckedFromId("weaponCheck")) {
		let WeaponColor = Colors[getValueFromId("weaponColorDropdown")]
		let WeaponName = getValueFromId("weaponText")
		let statTrack = isCheckedFromId("stCheck") ? ` ${Commands["StatTrak prefix"]}` : ""

		resultString += `${WeaponColor}${WeaponName} ${statTrack}`
	}
	resultString += '"'

	// set command input field
	document.getElementById("result").value = resultString
}
