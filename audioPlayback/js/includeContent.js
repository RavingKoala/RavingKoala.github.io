var IncludeContentEvents = {
	onLoaded: "OnLoaded",
}

function getContent(URI, callback) {
	let result
	let xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				result = this.responseText
			}
			if (this.status == 404)
				result = "Content not found."
		}
		if (result && typeof callback == "function")
			return callback(wrapResult(result, URI))
	}
	xhttp.open("GET", URI, true)
	xhttp.send()

	let wrapResult = (content, URI) => {
		let wrapper = document.createElement("div")

		let className = URI.split(".").pop() + "Wrapper"
		wrapper.classList.add(className)
		wrapper.innerHTML = content
		return wrapper.outerHTML
	}
}

function replaceIncludes(tag = "include", attr = "src") {
	let el = document.getElementsByTagName(tag)
	for (let node of el) {
		let file = node.getAttribute(attr)
		getContent(file, (content) => {
			node.outerHTML = content
			replaceIncludes()
		})
		return
	}
	document.dispatchEvent(new Event(IncludeContentEvents.onLoaded))
}