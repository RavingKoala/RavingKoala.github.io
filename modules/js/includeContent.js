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

async function getContent(URI, wrap = false) {
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
				if (wrap)
					content = wrapResult(URI, content)

				contentDict[URI] = content
				resolve(content)
			} else {
				reject("no content found!")
			}
		}))
	})
}
async function replaceNodeWithContent(node, file) {
    await getContent(file)
        .then(async (content) => {
            node.outerHTML = content
        }).catch((err) => {
            console.error("An error occured whilst including content from " + file + ": " + err.toString());
        })
}

var replaceRetryInterval = null
const intervalMaxRetry = 20
var intervalRetryCount = 0

async function replaceIncludes(tag = "include", attr = "src") {
    replaceRetryInterval = setInterval(() => {
        let els = document.getElementsByTagName(tag)
        for (let node of els) {
            let file = node.getAttribute(attr)
            replaceNodeWithContent(node, file)
        }
        if (intervalRetryCount > intervalMaxRetry || els.length == 0) {
            document.dispatchEvent(new Event(IncludeContentEvents.onLoaded))
            clearInterval(replaceRetryInterval)
        }
        intervalRetryCount++
    }, 300)
}