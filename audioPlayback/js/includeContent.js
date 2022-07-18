var IncludeContentEvents = {
	onLoaded: "OnLoaded",
}

var contentDict = {}

function getContentAjax(URI, callback) {
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
			return callback(result)
	}
	xhttp.open("GET", URI, true)
	xhttp.send()
}

async function getContent(URI, raw = false) {
	if (contentDict[URI])
		return contentDict[URI]

	function wrapResult(URI, content) {
		let wrapper = document.createElement("div")

		let className = URI.split(".").pop() + "Wrapper"
		wrapper.classList.add(className)
		wrapper.innerHTML = content
		return wrapper.outerHTML
	}
	
	return new Promise((resolve, reject) => {
		getContentAjax(URI, (content => {
			if (content) {
				// if (!raw)
				// 	content = wrapResult(URI, content)

				contentDict[URI] = content
				resolve(content)
			} else {
				reject("no content found")
			}
		}))
	})
}

async function replaceIncludes(tag = "include", attr = "src") {
	let els = document.getElementsByTagName(tag)
	for (let node of els) {
		let file = node.getAttribute(attr)
		await getContent(file)
		.then(async (content) => {
			node.outerHTML = content
			await replaceIncludes(tag, attr)
		}).catch((err) => {
			if (node)
				node.outerHTML = "error"
			throw new Error("An error occured whilst including content: " + Error.toString())
		})
		return
	}
	document.dispatchEvent(new Event(IncludeContentEvents.onLoaded))
}