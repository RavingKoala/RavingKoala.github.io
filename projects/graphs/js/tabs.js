(function() {
	selectTab = (tabContainer, tab) => {
		// attach DOMcontent
		if (tab.DOMcontent === undefined || tab.DOMcontent === null)
				tab.DOMcontent = tabContainer.querySelector("#" + tab.dataset.tabId)
		// if couldnt find -> return
		if (tab.DOMcontent === null)
			return
		// unselect previous
		if (tabContainer.selectedTab !== undefined)
		unselectTab(tabContainer.selectedTab)
		// show current
		tab.classList.add("selected")
		tab.DOMcontent.classList.add("show")
		tabContainer.selectedTab = tab
	}
	unselectTab = (tab) => {
		tab.classList.remove("selected")
		tab.DOMcontent.classList.remove("show")
	}

	// make tabs clickable
	let tabContainers = document.querySelectorAll(".tabContainer")
	tabContainers.forEach((tabContainer) => {
		let tabs = tabContainer.querySelectorAll(".tab")
		tabs.forEach((tab) => {
			tab.addEventListener("click", () => selectTab(tabContainer, tab), false)
		})
		
		let selectedList = tabContainer.querySelectorAll(".tab.selected")
		if (selectedList.length > 0) // select first selected tab
			selectTab(tabContainer, selectedList[0])
		else if (tabs.length > 0) // select first
			selectTab(tabContainer, tabs[0])
	})
})()
