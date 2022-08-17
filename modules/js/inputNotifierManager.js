// 1. HARD append Notifier to dom
// give DOM
// calc center of dom
// calc center of notifier
// position it correctly

// make notifier hidable
// give smooth transitions for hide and unhide
// make the notifier be spawned and on hide remove it. (based on aria stuff of label)
// make notifier callable

class InputNotifierManager {
	static #count = 0;
	static #clearTimer;
	static #inputNotifierHTML(content, id, place = null, color = null, isHTML = false) {
		const dom = document.createElement("div")
		dom.classList.add("inputNotifier")
		dom.id = id
		if (place !== null)
			dom.classList.add(place)
		if (color !== null)
			dom.classList.add(color)

		if (isHTML)
			dom.innerHTML = content
		else
			dom.textContent = content

		return dom
	}
	static show(input, clearTime = 0) {
		if (!input instanceof HTMLElement) return
		const forceSide = false // TODO: temp forced parameter -> make parameter

		const content = input.dataset.content !== undefined ? input.dataset.content : "";
		let place = input.dataset.placement !== undefined ? input.dataset.placement : null;
		const color = input.dataset.color !== undefined ? input.dataset.color : null;
		const isHTML = input.dataset.isHTML !== undefined ? input.dataset.isHTML : false;
		const id = `inputNotifier${InputNotifierManager.#count++}`;

		if (!forceSide) {
			if (place === "left" && input.offsetLeft < 1200)
				place = "right"
			if (place === "top" && input.offsetTop < 40)
				place = "bottom"
			if (place === "right" && document.body.offsetWidth - (input.offsetLeft + input.offsetHeight) < 200)
				place = "left"
			if (place === "bottom" && document.body.offsetHeight - (input.offsetTop + input.offsetHeight) < 40)
				place = "top"
		}

		if (input.getAttribute("aria-describedby") !== null)
			InputNotifierManager.hide(input, true)
		input.setAttribute("aria-describedby", id)
		const inputNotifier = InputNotifierManager.#inputNotifierHTML(content, id, place, color, isHTML)
		//generate div append to body
		inputNotifier.style.transform = `translate(-50%, -50%)`

		// positions
		if (place === null) {
			inputNotifier.style.position = "fixed"
			inputNotifier.style.top = `50vh`
			inputNotifier.style.left = `50vw`
			return
		}

		const inputDimensions = { left: input.offsetLeft, top: input.offsetTop, width: input.offsetWidth, height: input.offsetHeight }
		document.body.appendChild(inputNotifier) // For some reason this has to come after getting input positioning variables (becuase of scrollbar stuff I think)
		const notifierDimensions = { left: null, top: null, width: inputNotifier.offsetWidth, height: inputNotifier.offsetHeight }
		const notifierMargin = {
			top: (place === "top" || place === "bottom") ? 6 : 0,
			right: (place === "left" || place === "right") ? 6 : 0,
			bottom: (place === "top" || place === "bottom") ? 6 : 0,
			left: (place === "left" || place === "right") ? 6 : 0
		}

		if (place === "top") {
			notifierDimensions.top = inputDimensions.top - (inputDimensions.height / 2) - (notifierMargin.top + notifierMargin.bottom)
			notifierDimensions.left = inputDimensions.left + (inputDimensions.width / 2)
		}
		if (place === "bottom") {
			notifierDimensions.top = inputDimensions.top + inputDimensions.height + (inputDimensions.height / 2)
			notifierDimensions.left = inputDimensions.left + (inputDimensions.width / 2)
		}
		if (place === "left") {
			notifierDimensions.left = inputDimensions.left - (inputDimensions.width / 2) - (notifierMargin.left + notifierMargin.right)
			notifierDimensions.top = inputDimensions.top + (inputDimensions.height / 2)
		}
		if (place === "right") {
			notifierDimensions.left = inputDimensions.left + inputDimensions.width + (notifierDimensions.width / 2)
			notifierDimensions.top = inputDimensions.top + (inputDimensions.height / 2)
		}
		// placement logic
		inputNotifier.style.top = notifierDimensions.top + "px"
		inputNotifier.style.left = notifierDimensions.left + "px"

		inputNotifier.classList.add("show")

		if (clearTime > 0)
			this.#setClearTimerNotifier(input, clearTime)
	}

	static #setClearTimerNotifier(inputDom, clearTime) {
		InputNotifierManager.#clearTimer = setTimeout(() => InputNotifierManager.hide(inputDom), clearTime)
	} 
	
	static #removeClearTimerNotifier() {
		if (InputNotifierManager.#clearTimer !== undefined || InputNotifierManager.#clearTimer !== null)
			clearTimeout(InputNotifierManager.#clearTimer)
	}

	static hide(inputDOM, quick = false) {
		const id = inputDOM.getAttribute("aria-describedby")
		if (id === null)
			return
			
		if (quick){
			InputNotifierManager.removeNotifier(inputDOM)
			return
		}
		
		const inputNotifier = document.getElementById(id)
		inputNotifier.classList.remove("show")
		const delay = 400 // ms // css animation duration
		setTimeout(() => InputNotifierManager.removeNotifier(inputDOM), delay)
	}

	static removeNotifier(inputDOM) {
		InputNotifierManager.#removeClearTimerNotifier()
		const id = inputDOM.getAttribute("aria-describedby")
		document.getElementById(id).remove()
		inputDOM.removeAttribute("aria-describedby")
	}
}