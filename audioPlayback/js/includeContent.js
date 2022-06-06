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

function replaceIncludes(tag = "include") {
	var z, i, parent, node, file
	z = document.getElementsByTagName(tag)
	for (i = 0; i < z.length; i++) {
		node = z[i]
		parent = node.parentNode
		file = node.getAttribute("src")
		getContent(file, (content) => {
			parent.innerHTML = content
			replaceIncludes() // always do this for nested includes
		})
		return
	}
}