class StringHelper {
	static ensureLength(str, length) {
		return this.ensureLengthFill(ensureLength, " ")
	}

	static ensureLengthCenter(str, length) {
		return this.ensureLengthCenterFill(str, length, " ")
	}

	static ensureLengthFill(str, length, char) {
		if (str > length) str = str.substring(0, length)
		while (str.length < length)
			str += char
		return str
	}

	static ensureLengthCenterFill(str, length, char) {
		if (str > length) str = str.substring(0, length)
		while (str.length < length)
			str = char + str + char
		if (str.length > length)
			str = str.substring(1)
		return str
	}

	static LengthFill(length, char) {
		let ret = ""
		while (ret.length < length)
			ret += char
		return ret
	}
}