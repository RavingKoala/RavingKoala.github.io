function getContent(URI, callback) {
	var xhttps, result
	var xhttp = new XMLHttpRequest()
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

function replaceIncludes(tag = "include", attr = "src") {
	let el = document.getElementsByTagName(tag)
	for (let node of el) {
		let file = node.getAttribute(attr)
		getContent(file, (content) => {
			node.outerHTML = content
			replaceIncludes() // always do this for nested includes
		})
		return
	}
}