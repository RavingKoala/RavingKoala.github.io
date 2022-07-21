/*** Calculations  ***/

function validateInputs() {
	let inputElements = ["topOffset", "leftOffset", "rightOffset", "bottomOffset", "sens", "sensX", "sensY"]
	inputElements.forEach((id) => {
		// get value
		let value = getValueFromId(id)
		// return error?
		if (isNaN(value) || isNaN(parseFloat(value))) {
			console.log(id + " " + value)
			addClass(id, "is-invalid")
			return false
		} else removeClass(id, "is-invalid")
	})
	console.log("test")
	return true
}

function calculateResult() {
	//validate
	if (!validateInputs()) return
	//get values
	let top = +getValueFromId("topOffset")
	let left = +getValueFromId("leftOffset")
	let right = +getValueFromId("rightOffset")
	let bottom = +getValueFromId("bottomOffset")

	let isRatioLocked = isCheckedFromId("lockRatio")
	let sensitivity = +getValueFromId("sens")
	let sensitivityX = +getValueFromId("sensX")
	let sensitivityY = +getValueFromId("sensY")

	if (isRatioLocked) {
		sensitivityX = sensitivity
		sensitivityY = sensitivity
	}
	//calculate
	//hug bottom
	let width = right - left
	let height = bottom - top

	let newTop = bottom - (height / sensitivityY) // height sensitized, and set to bottom
	let newBottom = bottom // set to bottom
	let newLeft = ((width - width / sensitivityX) / 2) + left // width sensitized, and /2 cuz this is for left half
	let newRight = right - (width - width / sensitivityX) / 2 // width sensitized, and /2 cuz this is for right half

	//fill fields
	setValueToId("rtop", newTop.toString())
	setValueToId("rleft", newLeft.toString())
	setValueToId("rright", newRight.toString())
	setValueToId("rbottom", newBottom.toString())
}

/*** interactive UI commands ***/
function getValueFromId(id) {
	let element = document.getElementById(id)
	return element.value
}
function setValueToId(id, value) {
	document.getElementById(id).value = value
}

function isCheckedFromId(id) {
	let element = document.getElementById(id)
	return element.checked
}

function disableInput(id) {
	let element = document.getElementById(id)
	element.disabled = true
}
function enableInput(id) {
	let element = document.getElementById(id)
	element.disabled = false
}
