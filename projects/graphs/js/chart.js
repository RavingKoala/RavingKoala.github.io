function generateNumArr(from, to, interval) {
    if (to == undefined) {
        to = from
        from = 0
    }
    interval = interval === undefined || interval < 0 ? 1 : interval

    let retArr = []
    if (to > from)
        for (let i = from; i <= to; i += interval) { retArr.push(i) }
    if (from > to)
        for (let i = from; i >= to; i -= interval) { retArr.push(i) }
    return retArr
    // return Array.from(Array.from(Array(((to - from - 1) * steps) + 1).keys(), x => x / steps + from))
}

class Chart {
    /* consts (structs and enums) */
    static #axisDirection = {
        XRight: 1,
        YUp: -1,
        XLeft: -1,
        YDown: 1
    }
    // static #roundNumbers = [
    // 	1, 2, 5, 10
    // ]
    static #minDensity = {
        small: 20,
        medium: 35,
        large: 50
    }
    static #gridAidOptions = {
        none: 0,
        dot: 1,
        line: 2
    }
    static #axisLineOptions = {
        positive: 1,
        negative: -1,
        center: 0
    }

    /* global vars */
    static #chartWindowSize = new Vec2(600, 600) /* setting */
    static #chartSize = new Vec2(400, 400) // Vec2(): canvas size /* setting */
    static #chartStartpoint = new Vec2((this.#chartWindowSize.x - this.#chartSize.x) / 2, (this.#chartWindowSize.y - this.#chartSize.y) / 2) // (topleft) startpoint of chart area
    static #chartPositive = new Vec2(this.#axisDirection.XRight, this.#axisDirection.YUp) // canvas direction /* setting */
    static #gridAid = this.#gridAidOptions.line /* setting */

    static #axisLineSide // Vec2(): chart point (0 point) of axis on canvas
    static #axisLineStartValue // Vec2(): start value for chart interval numbers
    static #axisLineEndValue // Vec2(): max value for chart interval numbers

    /* temps? */
    static #dataStartpoint // Vec2(): (topleft) startpoint of chart data
    static #dataSize // Vec2(): Side of data area
    static #dataMaxValue // Vec2(): max value of data
    static #dataMinValue // Vec2(): min value of data
    static #dataIncrementValue // increment of chart label values (chars have a size so could be rough)
    static #gridDensity = new Vec2(this.#minDensity.medium, this.#minDensity.medium) // quick setting (maybe settable later) /* setting */
    static #gridIncrements // Vec2(): the amount of increments there are
    static #gridOffset // distance between nodes in px


    static createChart(data, parentDOMid) {
        if (!this.validateData(data)) return
        let parent = document.getElementById(parentDOMid)
        if (parent === undefined)
            return console.error("CHART - no element exists with id " + parentDOMid)

        this.prepareChartValues(data)
        this.printVarData() // debug
        this.drawChart(data, parentDOMid)
    }

    static printVarData() {
        console.log("-- chart vars --")
        console.log("chartWindowSize:", this.#chartWindowSize, "chartSize", this.#chartSize)
        console.log("chart Startpoint:", this.#chartStartpoint, "chart size:", this.#chartSize)
        console.log("positive direction:", "x:", this.#chartPositive.x, "y:", this.#chartPositive.y)
        console.log("values ", "from:", this.#dataMinValue, "increment:", this.#dataIncrementValue, "to:", this.#dataMaxValue)
        console.log("")
        console.log("0 point:", this.#axisLineSide)
        console.log("value range", this.#axisLineStartValue, this.#axisLineEndValue)
        console.log("amount of increment:", this.#gridIncrements)
        console.log("grid offset (px):", this.#gridOffset)
        console.log("  ----------  ")
    }

    static drawChart(data, parentDOMid) {
        let svgObj = new svg(this.#chartWindowSize)

        let zeroPoint = new Vec2(this.#chartStartpoint.x + (((this.#axisLineSide.x * this.#chartPositive.x) + 1) * this.#chartSize.x / 2), this.#chartStartpoint.y + (((this.#axisLineSide.y * this.#chartPositive.y) + 1) * this.#chartSize.y / 2))

        let axisGroup = new g()
        svgObj.addChild(axisGroup)
        axisGroup.addAttr("fill", "none")
        axisGroup.addAttr("stroke", "currentColor")
        axisGroup.addAttr("stroke-width", "3")

        //#region grid aid
        let gridLinesGroup = new g()
        svgObj.addChild(gridLinesGroup)
        gridLinesGroup.addAttr("class", "gridLines")
        if (this.#gridAid === this.#gridAidOptions.dot) {
            for (let i = 0; i < this.#gridIncrements.x; i++) {
                let xoffset = this.#chartStartpoint.x + (this.#gridOffset.x * i)

                let from = new Vec2(xoffset, this.#chartStartpoint.y)
                let to = new Vec2(xoffset, this.#chartStartpoint.y + this.#chartSize.y)
                let l = new line(from, to)
                l.addAttr("stroke-dasharray", "0 " + this.#gridOffset.y)
                l.addAttr("stroke-linecap", "round")
                l.addAttr("stroke-width", "4")
                gridLinesGroup.addChild(l)
            }
        }
        if (this.#gridAid === this.#gridAidOptions.line) {
            for (let i = 0; i <= this.#gridIncrements.x; i++) {
                let xoffset = this.#chartStartpoint.x + (this.#gridOffset.x * i)

                let from = new Vec2(xoffset, this.#chartStartpoint.y)
                let to = new Vec2(xoffset, this.#chartStartpoint.y + this.#chartSize.y)
                let l = new line(from, to)
                gridLinesGroup.addChild(l)
            }
            for (let i = 0; i <= this.#gridIncrements.y; i++) {
                let yoffset = this.#chartStartpoint.y + (this.#gridOffset.y * i)
                let from = new Vec2(this.#chartStartpoint.x, yoffset)
                let to = new Vec2(this.#chartStartpoint.x + this.#chartSize.x, yoffset)
                let l = new line(from, to)
                gridLinesGroup.addChild(l)
            }
        }

        axisGroup.addChild(new line(
            new Vec2(this.#chartStartpoint.x, zeroPoint.y),
            new Vec2(this.#chartStartpoint.x + this.#chartSize.x, zeroPoint.y)
        ))
        axisGroup.addChild(new line(
            new Vec2(zeroPoint.x, this.#chartStartpoint.y),
            new Vec2(zeroPoint.x, this.#chartStartpoint.y + this.#chartSize.y)
        ))
        //#endregion

        //#region axis numbers
        let numberGroup = new g()
        svgObj.addChild(numberGroup)
        numberGroup.addAttr("class", "numbers")
        numberGroup.addAttr("fill", "currentColor")
        // numberGroup.addAttr("transform", "translate(-4, 21)")

        let zero = new text("0", new Vec2(zeroPoint.x, zeroPoint.y))
        zero.addAttr("text-anchor", "end")
        numberGroup.addChild(zero)

        Array("x", "y").forEach((axis) => {
            for (let i = 0; i <= this.#gridIncrements[axis]; i++) {
                let startValue = (this.#chartPositive[axis] === 1 ? this.#dataMinValue[axis] : this.#dataMaxValue[axis])
                let value = startValue + ((this.#dataIncrementValue[axis] * i) * this.#chartPositive[axis])
                value = Number(parseFloat(value).toFixed((this.#determineDecimalDepth(this.#dataIncrementValue[axis]) + "").length - 1)) // fix for bad float calculations (eg. 0.4 + 0.2 == 0.6000000000000001)

                if (value === 0) continue

                let pos = new Vec2()
                pos[axis] = this.#dataStartpoint[axis] + (i * this.#gridOffset[axis])
                let otherAxis = axis === "x" ? "y" : "x"
                pos[otherAxis] = zeroPoint[otherAxis]

                let num = new text(value, pos)
                num.addAttr("text-anchor", "middle")
                num.addAttr("class", "num")
                if (axis === "x")
                	num.addAttr("transform", "rotate(-90, " + pos.x + ", " + pos.y + ")")
                numberGroup.addChild(num)
            }
        })
        //#endregion

        //#region axis titles
        let axisTitleGroup = new g()
        svgObj.addChild(axisTitleGroup)
        axisTitleGroup.addAttr("class", "primary-fill")

        let xTitle = new text("X axis", new Vec2(300, 535)) // temp static values
        xTitle.addAttr("text-anchor", "middle")
        axisTitleGroup.addChild(xTitle)

        let yTitle = new text("Y axis", new Vec2(65, 300)) // temp static values
        yTitle.addAttr("text-anchor", "middle")
        yTitle.addAttr("transform", "rotate(-90, 65, 300)") // temp static values
        axisTitleGroup.addChild(yTitle)
        //#endregion

        //#region Data
        let dataGroup = new g()
        svgObj.addChild(dataGroup)
        axisTitleGroup.addAttr("class", "primary-fill")

        let pLine = new polyline()
        dataGroup.addChild(pLine)
        pLine.addAttr("stroke", "var(--md-primary)")
        pLine.addAttr("stroke-width", "3")
        let points = " "
        data.forEach((dataPoint) => {
            let dataPos = new Vec2()

            let fromValue = new Vec2(0, 0), toValue = new Vec2(0, 0)
            fromValue.x = this.#chartPositive.x === 1 ? this.#dataMinValue.x : this.#dataMaxValue.x
            fromValue.y = this.#chartPositive.y === 1 ? this.#dataMinValue.y : this.#dataMaxValue.y
            toValue.x = this.#chartPositive.x === 1 ? this.#dataMaxValue.x : this.#dataMinValue.x
            toValue.y = this.#chartPositive.y === 1 ? this.#dataMaxValue.y : this.#dataMinValue.y

            if (this.#chartPositive.x === 1)
                dataPos.x = this.#dataStartpoint.x + (((dataPoint.x - this.#dataMinValue.x) / (this.#dataMaxValue.x - this.#dataMinValue.x)) * this.#dataSize.x)
            else
                dataPos.x = this.#dataStartpoint.x + (((1 - ((dataPoint.x - this.#dataMinValue.x) / (this.#dataMaxValue.x - this.#dataMinValue.x))) * this.#dataSize.x))
            if (this.#chartPositive.y === 1)
                dataPos.y = this.#dataStartpoint.y + (((dataPoint.y - this.#dataMinValue.y) / (this.#dataMaxValue.y - this.#dataMinValue.y)) * this.#dataSize.y)
            else
                dataPos.y = this.#dataStartpoint.y + (((1 - ((dataPoint.y - this.#dataMinValue.y) / (this.#dataMaxValue.y - this.#dataMinValue.y))) * this.#dataSize.y))
            points += dataPos.x + "," + dataPos.y + " "

            let dot = new circle(dataPos, 7)
            dot.addAttr("class", "primary-fill")
            dataGroup.addChild(dot)
        })
        pLine.addAttr("points", points)
        //#endregion

        svgObj.appendComponent(parentDOMid)
    }

    static prepareChartValues(data) {
        // determine value range
        this.#dataMaxValue = new Vec2(data[0].x, data[0].y)
        this.#dataMinValue = new Vec2(data[0].x, data[0].y)
        data.forEach(vec2 => {
            if (vec2.x > this.#dataMaxValue.x)
                this.#dataMaxValue.x = vec2.x
            else if (vec2.x < this.#dataMinValue.x)
                this.#dataMinValue.x = vec2.x

            if (vec2.y > this.#dataMaxValue.y)
                this.#dataMaxValue.y = vec2.y
            else if (vec2.y < this.#dataMinValue.y)
                this.#dataMinValue.y = vec2.y
        })
        // determine startpoint
        this.#axisLineSide = new Vec2(this.#axisLineOptions.center, this.#axisLineOptions.center)
        if (this.#dataMinValue.x < 0)
            this.#axisLineSide.x -= this.#axisLineOptions.negative
        if (this.#dataMinValue.y < 0)
            this.#axisLineSide.y -= this.#axisLineOptions.negative
        if (this.#dataMaxValue.x > 0)
            this.#axisLineSide.x -= this.#axisLineOptions.positive
        if (this.#dataMaxValue.y > 0)
            this.#axisLineSide.y -= this.#axisLineOptions.positive
        // determine max intervals
        let nth = new Vec2(1, 1)
        if (this.#dataMaxValue.x < 0) nth.x = -1
        if (this.#dataMaxValue.y < 0) nth.y = -1
        while (nth.x * 10 < this.#dataMaxValue.x - this.#dataMinValue.x) { nth.x *= 10 }
        while (nth.y * 10 < this.#dataMaxValue.y - this.#dataMinValue.y) { nth.y *= 10 }
        if (nth.x === 1)
            while (nth.x / 10 > this.#dataMaxValue.x - this.#dataMinValue.x) { nth.x /= 10 }
        if (nth.y === 1)
            while (nth.y / 10 > this.#dataMaxValue.y - this.#dataMinValue.y) { nth.y /= 10 }
        /* TODO: change this ^  to use determineIntHeight and determineDecimalDepth */
        this.#axisLineEndValue = new Vec2(nth.x, nth.y)
        this.#axisLineStartValue = new Vec2(nth.x, nth.y)

        /* TODO: update the min and max values so they round the weird decimal end values */
        /* probably should use determineIntHeight and determineDecimalDepth */
        // this.#roundNumbers.forEach((n) => {
        // 	// max values
        // 	let newMax = Math.floor(this.#maxValue.x, nth.x * 10) + (nth.x * (10 / n))
        // 	if (this.#maxValue.x <= newMax)
        // 		this.#axisLineEndValue.x = newMax
        // 	newMax = Math.floor(this.#maxValue.y, nth.y * 10) + (nth.y * (10 / n))
        // 	if (this.#maxValue.y <= newMax)
        // 		this.#axisLineEndValue.y = newMax
        // 	// min values
        // 	let newMin = Math.ceil(this.#minValue.x, nth.x * 10) - (nth.x * (10 / n))
        // 	if (this.#minValue.x >= newMin)
        // 		this.#axisLineStartValue.x = newMin
        // 	newMin = Math.ceil(this.#minValue.y, nth.y * 10) - (nth.y * (10 / n))
        // 	if (this.#minValue.y >= newMin)
        // 		this.#axisLineStartValue.y = newMin
        // })

        // determine interval
        let maxGridIncrements = new Vec2(this.#chartSize.x / this.#gridDensity.x, this.#chartSize.y / this.#gridDensity.y)
        if (this.#dataMinValue.x > 0 || this.#dataMaxValue.x < 0)
            maxGridIncrements.x -= 1
        if (this.#dataMinValue.y > 0 || this.#dataMaxValue.y < 0)
            maxGridIncrements.y -= 1


        this.#dataIncrementValue = new Vec2(0, 0)
        this.#gridIncrements = new Vec2(0, 0)
        let [gridIncValX, gridIncsX] = this.#determineIncrements((this.#dataMaxValue.x - this.#dataMinValue.x), Math.floor(maxGridIncrements.x)) // floor maxGridIncrements because it can be a decimal
        this.#dataIncrementValue.x = gridIncValX
        this.#gridIncrements.x = gridIncsX
        let [gridIncValY, gridIncsY] = this.#determineIncrements((this.#dataMaxValue.y - this.#dataMinValue.y), Math.floor(maxGridIncrements.y)) // floor maxGridIncrements because it can be a decimal
        this.#dataIncrementValue.y = gridIncValY
        this.#gridIncrements.y = gridIncsY

        // determine distance of intervals
        this.#gridOffset = new Vec2(0, 0)
        this.#gridOffset.x = this.#dataMinValue.x > 0 || this.#dataMaxValue.x < 0 ? this.#chartSize.x / (this.#gridIncrements.x + 1) : this.#chartSize.x / this.#gridIncrements.x
        this.#gridOffset.y = this.#dataMinValue.y > 0 || this.#dataMaxValue.y < 0 ? this.#chartSize.y / (this.#gridIncrements.y + 1) : this.#chartSize.y / this.#gridIncrements.y


        // determine data area
        this.#dataStartpoint = new Vec2(this.#chartStartpoint.x, this.#chartStartpoint.y)
        this.#dataSize = new Vec2(this.#chartSize.x, this.#chartSize.y)
        // TODO this depends on which way is positive (this.#chartPositive)
        Array("x", "y").forEach((axis) => {
            if (this.#chartPositive[axis] === 1) {
                if (this.#dataMinValue[axis] > 0)
                    this.#dataStartpoint[axis] += this.#gridOffset[axis]
                if (this.#dataMinValue[axis] > 0 || this.#dataMaxValue[axis] < 0)
                    this.#dataSize[axis] -= this.#gridOffset[axis]
            } else{
                if (this.#dataMaxValue[axis] < 0)
                    this.#dataStartpoint[axis] += this.#gridOffset[axis]
                if (this.#dataMaxValue[axis] < 0 || this.#dataMinValue[axis] > 0)
                    this.#dataSize[axis] -= this.#gridOffset[axis]
            }
        })
    }

    //#region prepareChartValues funcs
    static #determineIncrements(distance, n) {
        let newN = parseInt((distance + "").split(".").join(""))
        let nth = this.#determineDecimalDepth(distance)
        for (let r = n; r >= 1; r--) {
            let newR = r * nth
            if (((newN / r) * 10) % 1 == 0) {
                return [(newN / newR), r] // [0] = Interval increment value   [1] = amount of intervals
            }
        }
        return [0, 0]
    }

    static #determineIntHeight(n) { // 3456 -> 1000 (a num in the 1000's) , 75 -> 10 (a num in the 10's)
        return Math.pow(10, parseInt((n + "").split(".")[0].length))
    }

    static #determineDecimalDepth(n) {
        let [pos, dec] = (n + "").split(".")
        if (dec === undefined)
            return 1

        return Math.pow(10, parseInt(dec.length))
    }

    //#endregion

    static validateData(data) {
        if (!Array.isArray(data))
            return console.error("CHART - To create a chart, give data!")
        if (data.length < 1)
            return console.error("CHART - data is empty!")
        if (!data[0] instanceof Vec2)
            return console.error("CHART - Data has to be made up of Vec2's!")
        return true
    }
}