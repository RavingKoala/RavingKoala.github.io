async function getPopupTemplate() {
	return await getContent("../../modules/templates/popup.html").then((content) => content)
}

async function includePopup(id, attr = "src") {
	let popupTemplate = await getPopupTemplate()
	let popup = document.querySelector("#"+id)
	let file = popup.getAttribute(attr)
	let content = await getContent(file)
		.then((content) => content)
		.catch(() => "<p>An error occured</p>")
	popupTemplate = stringToDom(popupTemplate)
	popupTemplate.querySelector("content").outerHTML = content
	popupTemplate.setAttribute("id", id)
	popup.outerHTML = popupTemplate.outerHTML
	return document.getElementById(id)
}

function stringToDom(string) {
	return new DOMParser().parseFromString(string, 'text/html').body.childNodes[0]
}
