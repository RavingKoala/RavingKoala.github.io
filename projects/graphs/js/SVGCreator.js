class NSComponent {
	#attrList = {}
	children = []
	#namespaceURI
	#type
	#baseAttributes = {
		"id": "id",
		"tabindex": "tabindex",
		"class": "class",
		"style": "style",
		"clip-path": "clip-path",
		"clip-rule": "clip-rule",
		"color": "color",
		"color-interpolation": "color-interpolation",
		"color-rendering": "color-rendering",
		"cursor": "cursor",
		"display": "display",
		"fill": "fill",
		"fill-opacity": "fill-opacity",
		"fill-rule": "fill-rule",
		"filter": "filter",
		"mask": "mask",
		"opacity": "opacity",
		"pointer-events": "pointer-events",
		"shape-rendering": "shape-rendering",
		"stroke": "stroke",
		"stroke-dasharray": "stroke-dasharray",
		"stroke-dashoffset": "stroke-dashoffset",
		"stroke-linecap": "stroke-linecap",
		"stroke-linejoin": "stroke-linejoin",
		"stroke-miterlimit": "stroke-miterlimit",
		"stroke-opacity": "stroke-opacity",
		"stroke-width": "stroke-width",
		"transform": "transform",
		"vector-effect": "vector-effect",
		"visibility": "visibility"
	}
	#_attributes = this.#baseAttributes
	innerHTML = ""

	constructor (namespaceURI, type) {
		this.#namespaceURI = namespaceURI
		this.#type = type
	}

	get attributes() {
		return this.#_attributes
	}
	set attributes(attrs) {
		Object.assign(this.#_attributes, this.#baseAttributes, attrs)
	}

	addAttr(attr, value) {
		if (!Object.values(this.#_attributes).includes(attr))
			return console.error("NSComponent - " + attr + " is not in the list of attributes")

		this.#attrList[attr] = value
	}

	addChild(child) {
		if (!child instanceof NSComponent)
			return console.error("NSComponent - cannot add non-NSComponent to children")

		this.children.push(child)
	}

	createComponent() {
		let thisDOM = document.createElementNS(this.#namespaceURI, this.#type)
		thisDOM.innerHTML = this.innerHTML
		for (const [attr, value] of Object.entries(this.#attrList)) {
			thisDOM.setAttribute(attr, value)
		}
		this.children.forEach((child) => {
			try {
				let childDOM = child.createComponent()
				thisDOM.appendChild(childDOM)
			} catch (error) {
				console.error("element: ")
				console.error(thisDOM)
				console.error("child: ")
				console.error(child)
				console.error(error)
			}
		})
		return thisDOM
	}

	appendComponent(DOMId) {
		let dom = document.getElementById(DOMId)
		if (dom === null || dom === undefined)
			return console.error("NSComponent - no DOM with id:" + DOMId + " was found")

		let thisDOM = this.createComponent()
		dom.appendChild(thisDOM)
	}
}

class SVGComponent extends NSComponent {
	static #NamespaceURI = "http://www.w3.org/2000/svg"

	static #_alltypes = {
		"a": "a",
		"animate": "animate",
		"animateMotion": "animateMotion",
		"animateTransform": "animateTransform",
		"circle": "circle",
		"clipPath": "clipPath",
		"defs": "defs",
		"desc": "desc",
		"discard": "discard",
		"ellipse": "ellipse",
		"feBlend": "feBlend",
		"feColorMatrix": "feColorMatrix",
		"feComponentTransfer": "feComponentTransfer",
		"feComposite": "feComposite",
		"feConvolveMatrix": "feConvolveMatrix",
		"feDiffuseLighting": "feDiffuseLighting",
		"feDisplacementMap": "feDisplacementMap",
		"feDistantLight": "feDistantLight",
		"feDropShadow": "feDropShadow",
		"feFlood": "feFlood",
		"feFuncA": "feFuncA",
		"feFuncB": "feFuncB",
		"feFuncG": "feFuncG",
		"feFuncR": "feFuncR",
		"feGaussianBlur": "feGaussianBlur",
		"feImage": "feImage",
		"feMerge": "feMerge",
		"feMergeNode": "feMergeNode",
		"feMorphology": "feMorphology",
		"feOffset": "feOffset",
		"fePointLight": "fePointLight",
		"feSpecularLighting": "feSpecularLighting",
		"feSpotLight": "feSpotLight",
		"feTile": "feTile",
		"feTurbulence": "feTurbulence",
		"filter": "filter",
		"foreignObject": "foreignObject",
		"g": "g",
		"hatch": "hatch",
		"hatchpath": "hatchpath",
		"image": "image",
		"line": "line",
		"linearGradient": "linearGradient",
		"marker": "marker",
		"mask": "mask",
		"metadata": "metadata",
		"mpath": "mpath",
		"path": "path",
		"pattern": "pattern",
		"polygon": "polygon",
		"polyline": "polyline",
		"radialGradient": "radialGradient",
		"rect": "rect",
		"script": "script",
		"set": "set",
		"stop": "stop",
		"style": "style",
		"svg": "svg",
		"switch": "switch",
		"symbol": "symbol",
		"text": "text",
		"textPath": "textPath",
		"title": "title",
		"tspan": "tspan",
		"use": "use",
		"view": "view"
	}

	static types = {
		"svg": "svg",
		"g": "g",
		"circle": "circle",
		"ellipse": "ellipse",
		"line": "line",
		"polygon": "polygon",
		"polyline": "polyline",
		"rect": "rect",
		"image": "image",
		"path": "path",
		"text": "text",
		"use": "use",
		"a": "a",
		"defs": "defs",
		"g": "g",
		"marker": "marker",
		"mask": "mask",
		"pattern": "pattern",
		"svg": "svg",
		"switch": "switch",
		"symbol": "symbol"

	}

	constructor (type) {
		super(SVGComponent.#NamespaceURI, type)
	}
}

// individuals
class svg extends SVGComponent {
	additionalAttributes = {
		"height": "height",
		"preserveAspectRatio": "preserveAspectRatio",
		"version": "version",
		"viewBox": "viewBox",
		"width": "width",
		"x": "x",
		"y": "y"
	}

	constructor (vbP, p) {
		super(SVGComponent.types.svg)
		this.attributes = this.additionalAttributes
		if (!(vbP instanceof Vec2))
			return console.error("SVG - constructor needs a Vec2 for viewbox size.")

		this.addAttr("viewBox", ("0 0 " + vbP.x + " " + vbP.y))

		if (p instanceof Vec2) {
			this.addAttr("width", p.x)
			this.addAttr("height", p.y)
		} else if (p === undefined) {
			this.addAttr("width", vbP.x)
			this.addAttr("height", vbP.y)
		}
	}
}

class circle extends SVGComponent {

	additionalAttributes = {
		"cx": "cx",
		"cy": "cy",
		"r": "r",
		"pathLength": "pathLength"
	}

	constructor (p, r) {
		super(SVGComponent.types.circle)
		this.attributes = this.additionalAttributes

		if (p instanceof Vec2) {
			this.addAttr("cx", p.x)
			this.addAttr("cy", p.y)
		}
		if (r !== undefined)
			this.addAttr("r", r)
	}
}

class ellipse extends SVGComponent {

	additionalAttributes = {
		"cx": "cx",
		"cy": "cy",
		"rx": "rx",
		"ry": "ry",
		"pathLength": "pathLength"
	}

	constructor (p1, p2) {
		super(SVGComponent.types.ellipse)
		this.attributes = this.additionalAttributes

		if (p1 instanceof Vec2) {
			this.addAttr("cx", p1.x)
			this.addAttr("cy", p1.y)
		}
		if (p2 instanceof Vec2) {
			this.addAttr("rx", p2.x)
			this.addAttr("ry", p2.y)
		}
	}
}

class line extends SVGComponent {

	additionalAttributes = {
		"x1": "x1",
		"x2": "x2",
		"y1": "y1",
		"y2": "y2",
		"pathLength": "pathLength"
	}

	constructor (p1, p2) {
		super(SVGComponent.types.line)
		this.attributes = this.additionalAttributes

		if (p1 instanceof Vec2) {
			this.addAttr("x1", p1.x)
			this.addAttr("y1", p1.y)
		}
		if (p2 instanceof Vec2) {
			this.addAttr("x2", p2.x)
			this.addAttr("y2", p2.y)
		}
	}
}

class polygon extends SVGComponent {

	additionalAttributes = {
		"points": "points",
		"pathLength": "pathLength"
	}

	constructor () {
		super(SVGComponent.types.polygon)
		this.attributes = this.additionalAttributes
	}
}

class polyline extends SVGComponent {

	additionalAttributes = {
		"points": "points",
		"pathLength": "pathLength"
	}

	constructor (points) {
		super(SVGComponent.types.polyline)
		this.attributes = this.additionalAttributes

		if (points !== undefined)
			this.addAttr("points", points)
	}
}

class rect extends SVGComponent {

	additionalAttributes = {
		"x": "x",
		"y": "y",
		"width": "width",
		"height": "height",
		"rx": "rx",
		"ry": "ry",
		"pathLength": "pathLength"
	}

	constructor (p1, p2) {
		super(SVGComponent.types.rect)
		this.attributes = this.additionalAttributes

		if (p1 instanceof Vec2) {
			this.addAttr("x", p1.x)
			this.addAttr("y", p1.y)
		}
		if (p2 instanceof Vec2) {
			this.addAttr("width", p2.x)
			this.addAttr("height", p2.y)
		}
	}
}

class image extends SVGComponent {

	additionalAttributes = {
		"x": "x",
		"y": "y",
		"width": "width",
		"height": "height",
		"href": "href",
		"preserveAspectRatio": "preserveAspectRatio",
		"crossorigin": "crossorigin"
	}

	constructor (href, p1, p2) {
		super(SVGComponent.types.image)
		this.attributes = this.additionalAttributes

		if (href !== undefined) {
			this.addAttr("href", href)
		}
		if (p1 instanceof Vec2) {
			this.addAttr("x", p1.x)
			this.addAttr("y", p1.y)
		}
		if (p2 instanceof Vec2) {
			this.addAttr("width", p2.x)
			this.addAttr("height", p2.y)
		}
	}
}

class path extends SVGComponent {

	additionalAttributes = {
		"d": "d",
		"pathLength": "pathLength"
	}

	constructor (p1, p2) {
		super(SVGComponent.types.path)
		this.attributes = this.additionalAttributes
	}
}

class text extends SVGComponent {

	additionalAttributes = {
		"x": "x",
		"y": "y",
		"dx": "dx",
		"dy": "dy",
		"rotate": "rotate",
		"lengthAdjust": "lengthAdjust",
		"textLength": "textLength",
		"text-anchor": "text-anchor"
	}

	constructor (content, p1) {
		super(SVGComponent.types.text)
		this.attributes = this.additionalAttributes

		if (content !== undefined)
			this.innerHTML = content
		if (p1 instanceof Vec2) {
			this.addAttr("x", p1.x)
			this.addAttr("y", p1.y)
		}
	}
}

class use extends SVGComponent {

	additionalAttributes = {
		"href": "href",
		"x": "x",
		"y": "y",
		"width": "width",
		"height": "height"
	}

	constructor (href, p1, p2) {
		super(SVGComponent.types.use)
		this.attributes = this.additionalAttributes

		if (href !== undefined) {
			this.addAttr("href", href)
		}
		if (p1 instanceof Vec2) {
			this.addAttr("x", p1.x)
			this.addAttr("y", p1.y)
		}
		if (p2 instanceof Vec2) {
			this.addAttr("width", p2.x)
			this.addAttr("height", p2.y)
		}
	}
}

class a extends SVGComponent {

	additionalAttributes = {
		"download": "download",
		"href": "href",
		"hreflang": "hreflang",
		"ping": "ping",
		"referrerpolicy": "referrerpolicy",
		"rel": "rel",
		"target": "target",
		"type": "type"
	}

	constructor (href, p1, p2) {
		super(SVGComponent.types.a)
		this.attributes = this.additionalAttributes
	}
}

class defs extends SVGComponent {
	constructor () {
		super(SVGComponent.types.defs)
	}
}

class g extends SVGComponent {
	constructor () {
		super(SVGComponent.types.g)
	}
}

class marker extends SVGComponent {
	additionalAttributes = {
		"markerHeight": "markerHeight",
		"markerUnits": "markerUnits",
		"markerWidth": "markerWidth",
		"orient": "orient",
		"preserveAspectRatio": "preserveAspectRatio",
		"refX": "refX",
		"refY": "refY",
		"viewBox": "viewBox"
	}

	constructor (vbP) {
		super(SVGComponent.types.marker)
		this.attributes = this.additionalAttributes
		if (!(vbP instanceof Vec2))
			return console.error("SVG - constructor needs a Vec2 for viewbox size.")

		this.addAttr("viewBox", ("0 0 " + vbP.x + " " + vbP.y))
	}
}

class mask extends SVGComponent {

	additionalAttributes = {
		"height": "height",
		"maskContentUnits": "maskContentUnits",
		"maskUnits": "maskUnits",
		"x": "x",
		"y": "y",
		"width": "width"
	}

	constructor () {
		super(SVGComponent.types.mask)
		this.attributes = this.additionalAttributes
	}
}

class pattern extends SVGComponent {

	additionalAttributes = {
		"height": "height",
		"href": "href",
		"patternContentUnits": "patternContentUnits",
		"patternTransform": "patternTransform",
		"patternUnits": "patternUnits",
		"preserveAspectRatio": "preserveAspectRatio",
		"viewBox": "viewBox",
		"width": "width",
		"x": "x",
		"y": "y"
	}

	constructor (vbP) {
		super(SVGComponent.types.pattern)
		this.attributes = this.additionalAttributes

		if (vbP instanceof Vec2)
			this.addAttr("viewBox", ("0 0 " + vbP.x + " " + vbP.y))
	}
}

class svgSwitch extends SVGComponent {
	constructor () {
		super(SVGComponent.types.switch)
	}
}

class symbol extends SVGComponent {

	additionalAttributes = {
		"height": "height",
		"preserveAspectRatio": "preserveAspectRatio",
		"refX": "refX",
		"refY": "refY",
		"viewBox": "viewBox",
		"width": "width",
		"x": "x",
		"y": "y"
	}

	constructor (vbP, p) {
		super(SVGComponent.types.symbol)
		this.attributes = this.additionalAttributes
		if (!(vbP instanceof Vec2))
			return console.error("SVG - constructor needs a Vec2 for viewbox size.")

		this.addAttr("viewBox", ("0 0 " + vbP.x + " " + vbP.y))

		if (p instanceof Vec2) {
			this.addAttr("width", p.x)
			this.addAttr("height", p.y)
		} else if (p === undefined) {
			this.addAttr("width", vbP.x)
			this.addAttr("height", vbP.y)
		}
	}
}