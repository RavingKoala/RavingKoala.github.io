function addClass(id, className) {
	let element = document.getElementById(id)
	if (!element.classList.contains(className))
		element.classList.add(className)
}

function removeClass(id, className) {
	let element = document.getElementById(id)
	if (element.classList.contains(className))
		element.classList.remove(className)
}