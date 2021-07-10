var VoiceLines = {
	Affirmative: "Affirmative",
	Agree: "Agree",
	"Radio Affirmitive": "Radio.Affirmitive",
	"Radio 10": "Radio.Num10",
};

var Colors = {
	"Team Color": "",
	White: "",
	Grey: "",
	"Light Red": "",
	"Dark Red": "",
	Grey: "",
	"Pale Red": "",
	Orchid: "",
	Gold: "",
	"Light Green": "",
	Lime: "",
	Green: "",
	Blue: "",
	"Dark Blue": "",
};

var coppiedCommands = [];

function copy() {}
function copyRadioCommand() {
	var copyText = document.getElementById("result");
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
}

function copyToClipboard(text) {
	var copyText = document.getElementById("copyClipboardDOM");
	copyText.value = text;
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
}

function addOptionsToId(id, obj) {
	Object.keys(obj).forEach((name) => {
		let radioOption = document.createElement("option");
		radioOption.innerHTML = name;
		radioOption.value = name;
		document.getElementById(id).add(radioOption);
	});
}

function appendUpdateListener() {
	for (let i = 0; i < arguments.length; i++) {
		let element = arguments[i];
	}
}

/*** interactive UI commands ***/
