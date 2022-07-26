class Vec2 {
	static get zero() { return new Vec2(0, 0) }

	constructor (x, y) {
		this.x = x
		this.y = y
	}

	add(value) {
		if (typeof value === "number") {
			this.x += value
			this.y += value
		}
		if (value instanceof Vec2) {
			this.x += value.x
			this.y += value.y
		}
		return this
	}
	subtract(value) {
		if (typeof value === "number") {
			this.x -= value
			this.y -= value
		}
		if (value instanceof Vec2) {
			this.x -= value.x
			this.y -= value.y
		}
		return this
	}
	multiply(value) {
		if (typeof value === "number") {
			this.x *= value
			this.y *= value
		}
		return this
	}
	
	clone() {
		return new Vec2(this.x, this.y)
	}

	toString() {
		return "/" + this.x + "\\\n\\" + this.y + "\/\n"
	}
}