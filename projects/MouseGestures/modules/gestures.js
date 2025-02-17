import { DataStorage } from "./dataStorage.js"
import { GestureLocalStorage } from "./gestureLocalStorage.js"


export { GestureEvents, GestureDirection, GestureSettings, GestureManager, GestureListener }


//#region types

const GestureEvents = {
    addedGesture: "addedGesture", // details: { name: string, Gesture as int[] }
    gesture: "gesture",
    failedGesture: "failedGesture",
}

/**
 * @typedef {Int} GestureDirection
 */
const GestureDirection = {
    up: 0,
    right: 1,
    down: 2,
    left: 3,
    neutral: 4,
}

/** Vec2
 * 
 * @prop X: int
 * @prop Y: int
 * 
 * @method get(): [int, int]
 * @method add(Vec2): void
 * @method sub(Vec2): void
 * @method mult(Vec2): void
 * @method div(Vec2): void
 * @method abs(): void
 * @method getDirection(): GestureDirection
 * @method clone(): Vec2
 * 
 * @name MessageQueueConnector
 * @class
 */
class Vec2 {
    x = 0
    y = 0

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    get() {
        return [this.x, this.y]
    }

    add(vec) {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2!")

        this.x += vec.x
        this.y += vec.y

        return this
    }

    sub(value) {
        if (!(value instanceof Vec2))
            throw new Error("Param vec is not of type Vec2!")

        this.x -= value.x
        this.y -= value.y

        return this
    }

    mult(value) {
        if (!(value instanceof Vec2 || typeof value === "number"))
            throw new Error("Param vec is neither of type Vec2 nor of type number")

        if (value instanceof Vec2) {
            this.x *= value.x
            this.y *= value.y
        } else {
            this.x *= value
            this.y *= value
        }

        return this
    }

    div(value) {
        if (!(value instanceof Vec2 || typeof value === "number"))
            throw new Error("Param vec is neither of type Vec2 nor of type number!")

        if (value instanceof Vec2) {
            this.x /= value.x
            this.y /= value.y
        } else {
            this.x /= value
            this.y /= value
        }

        return this
    }

    abs() {
        this.x = this.x < 0 ? -this.x : this.x
        this.y = this.y < 0 ? -this.y : this.y

        return this
    }

    length() {
        return Math.sqrt((this.x * this.x + this.y * this.y))
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y
    }

    floor() {
        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)

        return this
    }

    getDirection() {
        if (this.x === 0 && this.y === 0)
            return GestureDirection.neutral
        const thisAbs = this.clone().abs()
        if (thisAbs.x > thisAbs.y)
            if (this.x > 0)
                return GestureDirection.right
            else
                return GestureDirection.left

        if (this.y > 0)
            return GestureDirection.down
        else
            return GestureDirection.up
    }

    getDistanceInDirection(direction) {
        if (direction === GestureDirection.left && this.x < 0)
            return this.x * -1
        if (direction === GestureDirection.right && this.x > 0)
            return this.x
        if (direction === GestureDirection.up && this.y < 0)
            return this.y * -1
        if (direction === GestureDirection.down && this.y > 0)
            return this.y

        return 0;
    }

    equals(vec) {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2!")

        return this.x === vec.x && this.y === vec.y
    }

    clone() {
        return new Vec2(this.x, this.y)
    }
}

const GestureDirectionToVec2 = (gesture) => {
    if (gesture === GestureDirection.neutral)
        return new Vec2(0, 0)
    else if (gesture === GestureDirection.up)
        return new Vec2(0, -1)
    else if (gesture === GestureDirection.right)
        return new Vec2(1, 0)
    else if (gesture === GestureDirection.left)
        return new Vec2(-1, 0)
    else if (gesture === GestureDirection.down)
        return new Vec2(0, 1)
    else
        throw new Error("Gesture direction not found. Make sure to pass in a gesture!")
}

/**
 * @public
 */
const GestureSettings = {
    Sensitivity: 13, // minimum px distance before stroke is counted
    MaxStrokes: 5, // amount of stroke that can be drawn for the gestures (0 = infinite)
    GridComplexity: 0, // 0 = infinite, 1 = 2 rows,2 cols, 3 = 3 rows, 3 cols, etc // I'ts a value for how often it can go in the same direction (not consecutively)
    DrawSize: 15, // px
    DrawColor: "#618eff", // str, hexColor
    DrawUseDataEveryNUpdates: 4, // int, use draw data every n mousemove updates
    DisplaySize: 14, // px
    DisplayColor: "#618eff", // str, hexColor
    DisplayToColor: "#333",  // str, hexColor
    DisplayFps: 120, // int (0 = as high as possible)
    DisplaySpeed: 200, // int, px/s
    DisplayPause: 1000, // int, milliseconds of delay between finishing the animation, and starting the next
    DisplayPauseOnArrive: false, // true: start pause timer when head reaches the end of the animation segments // false: start pause timer when end of the tail reaches the end
    DisplayTrailLength: 60, // int, px length of the trail
    DisplayLeaveTrail: true, // leave the trail color behind at after the end of the DisplayTrailLength
    DisplaySquareOffArea: true, // bool, if displayDOM is not square, make it a square and center area
    DisplayStrokePadding: 30, // px of the displayField
    GestureCancelOnMouseLeave: true, // detect if mouse leaves the window and still use gestures if its outside the window (perhaps make it an enum scope {Element, Document, outside})
    GestureCancelOnTooManyStrokes: true, // true: if (MaxStrokes === 5 && drawnGesture.length === 6) cancel, false; if (MaxStrokes === 5 && drawnGesture.length === 6) use last 5 strokes
}

/** ValidationTypes
 * 
 * Used for setting validation of objects
 *
 * basicValidation means if variables of this type should only be validated for being this type,
 * and if equal to some value.
 * This is for variables with predetermined facts such as size and sub-values.
 */
const ValidationTypes = {
    object: (advancedValidation) => { return { typeof: "object", basicValidation: advancedValidation === null, advancedValidation: advancedValidation } },
    boolean: (advancedValidation) => { return { typeof: "boolean", basicValidation: advancedValidation === null, advancedValidation: advancedValidation } },
    number: (advancedValidation) => { return { typeof: "number", basicValidation: advancedValidation === null, advancedValidation: advancedValidation } },
    bigint: (advancedValidation) => { return { typeof: "bigint", basicValidation: advancedValidation === null, advancedValidation: advancedValidation } },
    string: (advancedValidation) => { return { typeof: "string", basicValidation: advancedValidation === null, advancedValidation: advancedValidation } },
    symbol: (advancedValidation) => { return { typeof: "symbol", basicValidation: advancedValidation === null, advancedValidation: advancedValidation } },
    function: () => ValidationTypes.object((obj) => Array.isArray(obj)),
    colorHex: () => ValidationTypes.string((str) => /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(str)),
}

const SettingValidation = {
    Sensitivity: ValidationTypes.number(null),
    MaxStrokes: ValidationTypes.number(null),
    GridComplexity: ValidationTypes.number(null),
    DrawSize: ValidationTypes.number(null),
    DrawColor: ValidationTypes.colorHex(),
    DrawUseDataEveryNUpdates: ValidationTypes.number(null),
    DisplaySize: ValidationTypes.number(null),
    DisplayColor: ValidationTypes.colorHex(),
    DisplayToColor: ValidationTypes.colorHex(),
    DisplayFps: ValidationTypes.number(null),
    DisplaySpeed: ValidationTypes.number(null),
    DisplayPause: ValidationTypes.number(null),
    DisplayPauseOnArrive: ValidationTypes.boolean(null),
    DisplayTrailLength: ValidationTypes.number(null),
    DisplayLeaveTrail: ValidationTypes.boolean(null),
    DisplaySquareOffArea: ValidationTypes.boolean(null),
    DisplayStrokePadding: ValidationTypes.number(null),
    GestureCancelOnMouseLeave: ValidationTypes.boolean(null),
    GestureCancelOnTooManyStrokes: ValidationTypes.boolean(null),
}

const GestureSettingsManager = (function() {
    const _settings = GestureSettings

    const GetSetting = (key) => {
        if (!_settings.hasOwnProperty(key))
            throw new Error(`${key} is not a valid setting!`)

        return _settings[key]
    }

    const SetSetting = (key, value) => {
        if (!_settings.hasOwnProperty(key))
            throw new Error(`${key} is not a valid setting!`)
        if (SettingValidation[key].typeof !== typeof value)
            throw new Error("invalid type! " + key + "should be of type: " + SettingValidation[key].typeof)
        if (!SettingValidation[key].basicValidation)
            if (!SettingValidation[key].advancedValidation(value))
                throw new Error("value is not valid, please make the format valid!")

        _settings[key] = value
    }

    const GetSettings = () => {
        return _settings
    }

    const SetSettings = (settings) => {
        if (!(typeof settings === "object"))
            throw new Error("settings have to be a key-value pair object!")

        for (const [key, value] of Object.entries(settings))
            SetSetting(key, value)
    }

    return {
        GetSetting: GetSetting,
        SetSetting: SetSetting,
        GetSettings: GetSettings,
        SetSettings: SetSettings,
    }
})()

//#endregion

//#region drawing

const GestureParsing = (function() {
    let _activeDirection = null // traveling consecutively in this direction
    let _deltaActiveDirection = 0 // total distance consecutively traveled in a direction
    let _lastPos = null // vec of last position, updates every UpdateData

    let _gesture = [] // list of gesture directions for this gesture

    let _settingsManager = null

    let _delayCounter = 0

    const SetSettingsManager = (settingsManager) => {
        _settingsManager = settingsManager
    }

    const UpdateData = (vec) => {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2")

        if (_lastPos === null)
            _lastPos = vec

        const delayMax = _settingsManager.GetSetting("DrawUseDataEveryNUpdates")
        if (delayMax !== 0)
            if (_delayCounter < delayMax) {
                _delayCounter++
                return
            } else
                _delayCounter = 0

        const delta = vec.clone().sub(_lastPos)
        const deltaDirection = delta.getDirection()

        if (deltaDirection !== _activeDirection || deltaDirection === _gesture[_gesture.length - 1]) {
            // reset
            _activeDirection = deltaDirection
            _deltaActiveDirection = 0
        } else {
            // continue values
            _deltaActiveDirection += delta.getDistanceInDirection(_activeDirection)

            if (_deltaActiveDirection > _settingsManager.GetSetting("Sensitivity")) {
                _gesture.push(_activeDirection)
                _activeDirection = null
                _lastPos = null
            }
        }

        _lastPos = vec
    }

    const Finish = (maxStrokes, gridComplexity, cancelOnTooManyStrokes) => {
        let returnGesture = _gesture

        _gesture = []
        _activeDirection = null
        _deltaActiveDirection = 0
        _lastPos = null

        if (cancelOnTooManyStrokes && returnGesture.length > maxStrokes)
            return null
        if (maxStrokes !== 0 && returnGesture.length > maxStrokes) // only retrieve the last n strokes (n = maxStrokes)
            returnGesture = returnGesture.slice(Math.max(returnGesture.length - maxStrokes, 0))
        if (gridComplexity !== 0) {
            const tempGesture = []
            const min = new Vec2(0, 0), max = new Vec2(0, 0), temp = new Vec2(0, 0)
            for (const direction of returnGesture.toReversed()) {
                temp.add(GestureDirectionToVec2(direction))
                if (temp.x > max.x)
                    max.x = temp.x
                if (temp.y > max.y)
                    max.y = temp.y
                if (temp.x < min.x)
                    min.x = temp.x
                if (temp.y < min.y)
                    min.y = temp.y
                if (max.x - min.x > gridComplexity || max.y - min.y > gridComplexity) {
                    returnGesture = tempGesture.reverse()
                    break
                }
                tempGesture.push(direction)
            }
        }

        return returnGesture
    }

    const Cancel = () => {
        _gesture = []
        _activeDirection = null
        _deltaActiveDirection = 0
        _lastPos = null
    }

    return {
        SetSettingsManager: SetSettingsManager,
        UpdateData: UpdateData,
        Finish: Finish,
        Cancel: Cancel,
    }
})()

const GestureDrawingUi = (function() {
    let lastPoint = null // vec to last point

    let _inputDom = null
    let _inputContext = null
    let _settingsManager = null

    const SetInputCanvas = (inputDom) => {
        _inputDom = inputDom
        _inputContext = inputDom.getContext("2d")
        Clear()
    }

    const SetSettingsManager = (settingsManager) => {
        _settingsManager = settingsManager
    }

    const DrawPoint = (vec) => {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2")
        if (_inputDom === null)
            throw new Error("Input is not set")

        if (lastPoint === null)
            lastPoint = vec

        _inputContext.beginPath()
        _inputContext.moveTo(lastPoint.x, lastPoint.y)
        _inputContext.lineWidth = _settingsManager.GetSetting("DrawSize")
        _inputContext.lineCap = "round"
        _inputContext.strokeStyle = _settingsManager.GetSetting("DrawColor")
        _inputContext.lineTo(vec.x, vec.y)
        _inputContext.stroke()

        lastPoint = vec
    }

    const Clear = () => {
        lastPoint = null

        if (!(_inputDom instanceof HTMLCanvasElement))
            throw new Error("Input DOM Element is not a Canvas!")

        _inputContext.reset()
    }

    return {
        SetInputCanvas: SetInputCanvas,
        SetSettingsManager: SetSettingsManager,
        DrawPoint: DrawPoint,
        Clear: Clear,
    }
})()

const GestureDrawing = (function() {
    let _isDrawing = false

    let _inputDom = null

    const _settingsManager = GestureSettingsManager
    const _gestureParsing = GestureParsing
    _gestureParsing.SetSettingsManager(_settingsManager)
    const _drawingUi = GestureDrawingUi
    _drawingUi.SetSettingsManager(_settingsManager)

    const SetInputCanvas = (inputDom) => {
        if (_inputDom !== null)
            CancelDrawing()

        _inputDom = inputDom
        _drawingUi.SetInputCanvas(inputDom)
    }

    const StartDrawing = (event) => {
        _isDrawing = true

        _drawingUi.Clear()

        if (event === undefined || event === null)
            return
        if (!(event instanceof MouseEvent)) {
            console.warn("Param event should be a MouseEvent")
            return
        }

        const rect = _inputDom.getBoundingClientRect()
        const newPoint = new Vec2(event.clientX - rect.left, event.clientY - rect.top)

        _gestureParsing.UpdateData(newPoint)
        _drawingUi.DrawPoint(newPoint)
    }

    const OnDraw = (event) => {
        if (!_isDrawing) return

        const rect = _inputDom.getBoundingClientRect();
        const newPoint = new Vec2(event.clientX - rect.left, event.clientY - rect.top)

        _gestureParsing.UpdateData(newPoint)
        _drawingUi.DrawPoint(newPoint)
    }

    const StopDrawing = () => {
        _isDrawing = false
        const gestureResult = _gestureParsing.Finish(_settingsManager.GetSetting("MaxStrokes"), _settingsManager.GetSetting("GridComplexity"), false)
        _drawingUi.Clear()
        return gestureResult
    }

    const CancelDrawing = () => {
        _isDrawing = false
        _gestureParsing.Cancel()
        _drawingUi.Clear()
    }

    return {
        SetInputCanvas: SetInputCanvas,
        GetSettings: _settingsManager.GetSettings,
        SetSettings: _settingsManager.SetSettings,
        GetSetting: _settingsManager.GetSetting,
        SetSetting: _settingsManager.SetSetting,
        StartDrawing: StartDrawing,
        OnDraw: OnDraw,
        StopDrawing: StopDrawing,
        CancelDrawing: CancelDrawing,
    }
})()

//#endregion

//#region Displaying

const GestureDisplayingUi = (function() {
    let _isDisplaying = false

    let _points = null
    let _currentPointI = 0;
    let _snakeChunks = null

    let _lastUpdateTime = null
    let _lastUpdateTimeLoop = null

    let _outputDom = null
    let _outputContext = null

    let _settingsManager = null

    const SetOutputCanvas = (outputDom) => {
        if (_outputDom !== null)
            _reset()

        _outputDom = outputDom
        _outputContext = outputDom.getContext("2d")

        _reset()
    }

    const SetSettingsManager = (settingsManager) => {
        _settingsManager = settingsManager
    }

    const _gestureToPoints = (gestureArr) => {
        const outputDomRect = _outputDom.getBoundingClientRect()
        const drawRadius = _settingsManager.GetSetting("DisplaySize")
        const drawRect = { left: 0, top: 0, width: outputDomRect.width, height: outputDomRect.height }

        if (_settingsManager.GetSetting("DisplaySquareOffArea") && outputDomRect.width != outputDomRect.height) {
            if (outputDomRect.width < outputDomRect.height) {
                drawRect.top = (outputDomRect.height - outputDomRect.width) / 2
                drawRect.height = outputDomRect.width
            } else {
                drawRect.left = (outputDomRect.width - outputDomRect.height) / 2
                drawRect.width = outputDomRect.height
            }
        }

        const padding = _settingsManager.GetSetting("DisplayStrokePadding") + (drawRadius / 2)
        drawRect.left += padding + (drawRadius % 2 !== 0 ? 0 : 0.5)
        drawRect.top += padding + (drawRadius % 2 !== 0 ? 0 : 0.5)
        drawRect.width -= padding * 2
        drawRect.height -= padding * 2


        let xMin = 0, x = 0, xMax = 0, yMin = 0, y = 0, yMax = 0
        gestureArr.forEach(direction => {
            if (direction === GestureDirection.neutral)
                return
            else if (direction === GestureDirection.up) {
                y -= 1
                if (y < yMin)
                    yMin = y
            } else if (direction === GestureDirection.right) {
                x += 1
                if (x > xMax)
                    xMax = x
            } else if (direction === GestureDirection.down) {
                y += 1
                if (y > yMax)
                    yMax = y
            } else if (direction === GestureDirection.left) {
                x -= 1
                if (x < xMin)
                    xMin = x
            }
        });

        const cols = xMax - xMin
        const rows = yMax - yMin
        if (cols != rows && _settingsManager.GetSetting("DisplaySquareOffArea")) {
            if (cols > rows) {
                const offset = drawRect.height / cols
                drawRect.top += offset / 2
                drawRect.height -= offset
            } else {
                const offset = drawRect.width / rows
                drawRect.left += offset / 2
                drawRect.width -= offset
            }
        }

        let xLineSize, yLineSize
        if (cols === 0) {
            xLineSize = 0
            //center
            drawRect.left += drawRect.width / 2
            drawRect.width = 0
        } else
            xLineSize = drawRect.width / cols

        if (rows === 0) {
            yLineSize = 0
            //center
            drawRect.top += drawRect.height / 2
            drawRect.height = 0
        } else
            yLineSize = drawRect.height / rows


        const retArr = []

        const lastPos = new Vec2(drawRect.left + ((cols - xMax) * xLineSize), drawRect.top + ((rows - yMax) * yLineSize))
        retArr.push(lastPos.clone().floor())

        gestureArr.forEach(direction => {
            if (direction === GestureDirection.neutral)
                return
            else if (direction === GestureDirection.left || direction === GestureDirection.right)
                lastPos.add(GestureDirectionToVec2(direction).mult(xLineSize))
            else
                lastPos.add(GestureDirectionToVec2(direction).mult(yLineSize))

            retArr.push(lastPos.clone().floor())
        })

        return retArr
    }

    const Start = (gestureArr) => {
        _reset()
        _isDisplaying = true

        _lastUpdateTime = Date.now()

        if (gestureArr.length === 0)
            return;

        _points = _gestureToPoints(gestureArr)

        _snakeChunks = []
        const chunks = 1 + (_settingsManager.GetSetting("DisplayTrailLength") / (_settingsManager.GetSetting("DisplaySpeed") * (1000 / _settingsManager.GetSetting("DisplayFps")) / 1000))

        for (let index = 0; index <= chunks; index++) {
            _snakeChunks.push({ pos: _points[0].clone(), color: _findColor(_settingsManager.GetSetting("DisplayColor"), _settingsManager.GetSetting("DisplayToColor"), (index / chunks)) })
        }
        _animate()
    }

    // param examples: (fromColorHex = "#00ff00", toColorHex = "#333", colorTransition = 0.8)
    // if (colorTransition === 0) return fromColorHex and if (colorTransition === 1) return toColorHex
    const _findColor = (fromColorHex, toColorHex, colorTransition) => {
        const fromColor = hexToRGB(fromColorHex)
        const toColor = hexToRGB(toColorHex)

        const r = Math.floor((fromColor.r * (1 - colorTransition)) + (toColor.r * colorTransition))
        const g = Math.floor((fromColor.g * (1 - colorTransition)) + (toColor.g * colorTransition))
        const b = Math.floor((fromColor.b * (1 - colorTransition)) + (toColor.b * colorTransition))
        let a = Math.ceil((fromColor.a * (1 - colorTransition)) + (toColor.a * colorTransition))
        if (a >= 255)
            a = null

        return RGBToHex(r, g, b, a)


        function hexToRGB(hex) {
            if (hex.length === 4)
                return { r: parseInt(hex[1] + hex[1], 16), g: parseInt(hex[2] + hex[2], 16), b: parseInt(hex[3] + hex[3], 16), a: 255 }
            else if (hex.length === 5)
                return { r: parseInt(hex[1] + hex[1], 16), g: parseInt(hex[2] + hex[2], 16), b: parseInt(hex[3] + hex[3], 16), a: parseInt(hex[4] + hex[4], 16) }
            else if (hex.length === 7)
                return { r: parseInt(hex.substring(1, 3), 16), g: parseInt(hex.substring(3, 5), 16), b: parseInt(hex.substring(5, 7), 16), a: 255 }
            else if (hex.length === 9)
                return { r: parseInt(hex.substring(1, 3), 16), g: parseInt(hex.substring(3, 5), 16), b: parseInt(hex.substring(5, 7), 16), a: parseInt(hex.substring(7, 9), 16) }

            return { r: 0, g: 0, b: 0, a: 255 }
        }

        function RGBToHex(red, green, blue, alpha) {
            return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}` + (alpha === undefined || alpha === null ? "" : alpha.toString(16))
        }
    }

    const _animate = () => {
        if (!_isDisplaying) return

        const deltaTime = Date.now() - _lastUpdateTime

        if (_settingsManager.GetSetting("DisplayFps") !== 0 && deltaTime < (1000 / _settingsManager.GetSetting("DisplayFps"))) {
            requestAnimationFrame(_animate)
            return
        }
        _lastUpdateTime = Date.now()


        let distance = (_settingsManager.GetSetting("DisplaySpeed") / 1000) * deltaTime

        let newPoint
        if (_currentPointI >= _points.length - 1 && _snakeChunks[0].pos.equals(_points[_points.length - 1]) || _snakeChunks[0].pos.equals(new Vec2(-1, -1))) // ending animation
            newPoint = new Vec2(-1, -1)
        else {
            const directionCurrentPath = _points[_currentPointI + 1].clone().sub(_points[_currentPointI]).getDirection()
            const deltaDistance = GestureDirectionToVec2(directionCurrentPath).mult(distance)
            if (deltaDistance.lengthSq() > _points[_currentPointI + 1].clone().sub(_snakeChunks[0].pos).lengthSq())
                newPoint = _points[_currentPointI + 1] // snap to point
            else
                newPoint = _snakeChunks[0].pos.clone().add(deltaDistance) // continue travel between points
        }

        for (let i = _snakeChunks.length - 1; i > 0; i--) {
            _snakeChunks[i].pos = _snakeChunks[i - 1].pos.clone()
        }
        _snakeChunks[0].pos = newPoint

        // clear canvas
        _outputContext.reset()
        // draw path that snake has passed
        _outputContext.strokeStyle = _settingsManager.GetSetting("DisplayToColor")
        _outputContext.lineWidth = _settingsManager.GetSetting("DisplaySize")
        _outputContext.lineJoin = "round"
        _outputContext.lineCap = "round"
        if (_settingsManager.GetSetting("DisplayLeaveTrail")) {
            _outputContext.beginPath()
            _outputContext.moveTo(_points[0].x, _points[0].y)
            for (let i = 1; i <= _currentPointI; i++)
                _outputContext.lineTo(_points[i].x, _points[i].y)
            if (!_snakeChunks[0].pos.equals(new Vec2(-1, -1)))
                _outputContext.lineTo(_snakeChunks[0].pos.x, _snakeChunks[0].pos.y)
            _outputContext.stroke()
        }
        // draw snake entirely
        for (let i = _snakeChunks.length - 1; i > 0; i--) {
            if (_snakeChunks[i - 1].pos.equals(new Vec2(-1, -1)))
                continue

            _outputContext.strokeStyle = _settingsManager.GetSetting("DisplayToColor")
            _outputContext.lineWidth = _settingsManager.GetSetting("DisplaySize")
            _outputContext.lineJoin = "round"
            _outputContext.lineCap = "round"

            _outputContext.strokeStyle = _snakeChunks[i].color
            _outputContext.beginPath()
            _outputContext.moveTo(Math.floor(_snakeChunks[i].pos.x), Math.floor(_snakeChunks[i].pos.y))
            _outputContext.lineTo(Math.floor(_snakeChunks[i - 1].pos.x), Math.floor(_snakeChunks[i - 1].pos.y))
            _outputContext.stroke()
        }


        if (_currentPointI >= _points.length - 1) {
            // restarting animation
            if (!_settingsManager.GetSetting("DisplayPauseOnArrive"))
                if (!_snakeChunks[_snakeChunks.length - 1].pos.equals(new Vec2(-1, -1))) // check if tail reached end
                    _lastUpdateTimeLoop = _lastUpdateTime
            if (Date.now() - _lastUpdateTimeLoop < _settingsManager.GetSetting("DisplayPause")) {
                requestAnimationFrame(_animate)
                return
            }

            _outputContext.reset()

            _snakeChunks.forEach((chunk) => {
                chunk.pos = _points[0].clone()
            })

            _currentPointI = 0
            distance = 0
        } else if (_snakeChunks[0].pos.equals(_points[_currentPointI + 1])) { // reached end of gesture direction
            _currentPointI++
            if (_currentPointI >= _points.length - 1) {
                _snakeChunks[0].pos = new Vec2(-1, -1)
            }
        }
        _lastUpdateTimeLoop = _lastUpdateTime

        requestAnimationFrame(_animate)
    }

    const Stop = () => {
        _reset()
    }

    const _reset = () => {
        _isDisplaying = false

        _currentPointI = 0
        _snakeChunks = null
        _points = null

        _outputContext.reset()
    }

    return {
        SetOutputCanvas: SetOutputCanvas,
        SetSettingsManager: SetSettingsManager,
        Start: Start,
        Stop: Stop,
    }
})()

const GestureDisplaying = (function() {
    let _outputDom = null

    const _settingsManager = GestureSettingsManager
    const _displayingUi = GestureDisplayingUi
    _displayingUi.SetSettingsManager(_settingsManager)

    const SetOutputCanvas = (outputDom) => {
        if (!(outputDom instanceof HTMLCanvasElement))
            throw new Error("Param outputDom is not a Canvas!")
        if (_outputDom !== null)
            Stop()

        _outputDom = outputDom
        _displayingUi.SetOutputCanvas(_outputDom)

        Stop()
    }

    const Display = (gesture) => {
        _displayingUi.Stop()

        if (!Array.isArray(gesture))
            throw new Error("Gesture has to be an Array!")
        if (gesture.length == 0)
            return
        if (!(typeof gesture[0] === 'number'))
            throw new Error("Gesture has to be an Array of numbers! Make use of the GestureDirection enum.")

        _displayingUi.Start(gesture)
    }

    const Stop = () => {
        if (_outputDom !== null)
            _displayingUi.Stop()
    }

    return {
        SetOutputCanvas: SetOutputCanvas,
        GetSettings: _settingsManager.GetSettings,
        SetSettings: _settingsManager.SetSettings,
        GetSetting: _settingsManager.GetSetting,
        SetSetting: _settingsManager.SetSetting,
        Display: Display,
        Stop: Stop,
    }
})()

//#endregion

const GestureManager = (function(window) {
    let _drawingEnabled = false
    let _drawing = false

    let _inputDom = null
    let _activeGesture = []

    const _settingsManager = GestureSettingsManager
    const _gestureDrawing = GestureDrawing
    const _gestureDisplaying = GestureDisplaying
    let _dataStorage = GestureLocalStorage

    const SetInputCanvas = (inputDom) => {
        if (!(inputDom instanceof HTMLCanvasElement))
            throw new Error("Param inputDom is not a Canvas!")

        if (_inputDom !== null)
            _removeInputEventListeners(_inputDom)

        _inputDom = inputDom

        _addInputEventListeners(_inputDom)
        _gestureDrawing.SetInputCanvas(_inputDom)
    }

    const SetOutputCanvas = (outputDom) => {
        if (!(outputDom instanceof HTMLCanvasElement))
            throw new Error("Param outputDom is not a Canvas!")

        _gestureDisplaying.SetOutputCanvas(outputDom)
    }

    const _addInputEventListeners = (inputDom) => {
        inputDom.addEventListener("mousedown", _mousedownHandler)
        inputDom.addEventListener("mousemove", _mousemoveHandler)
        inputDom.addEventListener("mouseup", _mouseupHandler)
        inputDom.addEventListener("mouseleave", _mouseleaveHandler)
    }
    const _removeInputEventListeners = (inputDom) => {
        inputDom.removeEventListener("mousedown", _mousedownHandler)
        inputDom.removeEventListener("mousemove", _mousemoveHandler)
        inputDom.removeEventListener("mouseup", _mouseupHandler)
        inputDom.removeEventListener("mouseleave", _mouseleaveHandler)
    }
    //#region  window eventListeners handlers
    const _mousedownHandler = (event) => {
        if (event.button !== 0) // left click
            return
        if (!_drawingEnabled)
            return

        _drawing = true
        _gestureDrawing.StartDrawing(event)
    }
    const _mousemoveHandler = (event) => {
        if (!_drawingEnabled)
            return
        if (_drawing)
            _gestureDrawing.OnDraw(event)
    }
    const _mouseupHandler = (event) => {
        if (event.button !== 0) // left click
            return
        if (!_drawingEnabled)
            return

        _drawing = false
        _activeGesture = _gestureDrawing.StopDrawing()
        _gestureDisplaying.Display(_activeGesture)

    }
    const _mouseleaveHandler = (_event) => {
        _drawing = false
        _gestureDrawing.CancelDrawing()
    }
    //#endregion

    const SetSettings = (settings) => {
        _settingsManager.SetSettings(settings)
        _gestureDrawing.SetSettings(settings)
        _gestureDisplaying.SetSettings(settings)
    }

    const SetSetting = (key, value) => {
        _settingsManager.SetSetting(key, value)
        _gestureDrawing.SetSetting(key, value)
        _gestureDisplaying.SetSetting(key, value)
    }

    const SetDataStorage = (dataStorage) => {
        if (!(dataStorage instanceof DataStorage))
            throw new Error("Param dataStorage is not of type DataStorage, " +
                "Use either DataStorage or use another class that extends from the interface DataStorage!")

        _dataStorage = dataStorage
    }

    const Exists = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        return _dataStorage.exists(name)
    }

    const New = () => {
        _drawingEnabled = true
        _gestureDrawing.StartDrawing()
    }

    const Save = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        _drawingEnabled = false
        _dataStorage.set(name, _activeGesture)
        window.dispatchEvent(new CustomEvent(GestureEvents.addedGesture, { detail: { name: name, gesture: _activeGesture } }))
        _activeGesture = []

    }

    const Cancel = () => {
        _drawingEnabled = false
        _activeGesture = []

        _gestureDisplaying.Stop()
    }

    const Display = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        const gesture = _dataStorage.get(name)

        _gestureDisplaying.Display(gesture)
    }

    const Forget = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        _dataStorage.remove(name)
    }

    return {
        SetInputCanvas: SetInputCanvas,
        SetOutputCanvas: SetOutputCanvas,
        GetSettings: _settingsManager.GetSettings,
        SetSettings: SetSettings,
        GetSetting: _settingsManager.GetSetting,
        SetSetting: SetSetting,
        SetDataStorage: SetDataStorage,
        Exists: Exists,
        New: New,
        Save: Save,
        Cancel: Cancel,
        Display: Display,
        StopDisplaying: _gestureDisplaying.Stop,
        Forget: Forget,
        GetGestures: _dataStorage.getAll,
    }
})(window)

const GestureListener = (function(window) {
    const _settingsManager = GestureSettingsManager
    const _gestureParsing = GestureParsing
    _gestureParsing.SetSettingsManager(_settingsManager)
    const _dataStorage = GestureLocalStorage

    let _window = window

    let _parsing = false
    let _preventContextmenu = false

    const _addWindowEventListeners = (window) => {
        window.addEventListener("mousedown", _mousedownHandler)
        window.addEventListener("mousemove", _mousemoveHandler)
        window.addEventListener("contextmenu", _contextmenuHandler)
        window.addEventListener("mouseup", _mouseupHandler)
    }
    const _removeWindowEventListeners = (window) => {
        window.removeEventListener("mousedown", _mousedownHandler)
        window.removeEventListener("mousemove", _mousemoveHandler)
        window.removeEventListener("contextmenu", _contextmenuHandler)
        window.removeEventListener("mouseup", _mouseupHandler)
    }

    //#region window eventListeners handlers
    const _mousedownHandler = (event) => {
        if (event.button !== 2) // right click
            return

        _parsing = true
        _gestureParsing.UpdateData(new Vec2(event.clientX, event.clientY))
    }
    const _mousemoveHandler = (event) => {
        if (!_parsing)
            return
        if (_settingsManager.GetSetting("GestureCancelOnMouseLeave")) {
            if (event.clientX < 0 || event.clientX > window.innerWidth
                || event.clientY < 0 || event.clientY > window.innerHeight) {
                _parsing = false
                _gestureParsing.Cancel()
                return
            }
        }

        _gestureParsing.UpdateData(new Vec2(event.clientX, event.clientY))
    }
    const _contextmenuHandler = (event) => {
        if (_preventContextmenu)
            event.preventDefault()
        _preventContextmenu = false
    }
    const _mouseupHandler = (event) => {
        if (event.button !== 2) // right click
            return

        _parsing = false
        const gesture = _gestureParsing.Finish(_settingsManager.GetSetting("MaxStrokes"), _settingsManager.GetSetting("GridComplexity"), _settingsManager.GetSetting("GestureCancelOnTooManyStrokes"))
        if (gesture !== null)
            if (gesture.length > 0)
                _onGestureEvent(gesture)
    }
    //#endregion

    const Activate = () => {
        _removeWindowEventListeners(_window) // is always safe
        _addWindowEventListeners(_window)
    }

    const Deactivate = () => {
        _removeWindowEventListeners(_window) // is always safe
    }

    const _onGestureEvent = (gesture) => {
        _preventContextmenu = true

        const allGestures = _dataStorage.getAll()
        // find event
        const eventEntry = Object.entries(allGestures).find((entry) => gesturesAreEqual(gesture, entry[1]))

        // trigger event
        if (eventEntry === undefined || eventEntry.length <= 0) {
            _window.dispatchEvent(new CustomEvent(GestureEvents.failedGesture, { detail: { gesture: gesture } }))
            return
        }
        _window.dispatchEvent(new CustomEvent(GestureEvents.gesture, { detail: { name: eventEntry[0], gesture: gesture } }))


        function gesturesAreEqual(arr1, arr2) {
            if (!Array.isArray(arr1) || !Array.isArray(arr2))
                return false;
            if (arr1.length != arr2.length)
                return false;

            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i])
                    return false;
            }
            return true
        }
    }

    const SetGestureWindow = (window) => {
        if (!(window instanceof HTMLElement))
            throw new Error("Window must be an HTMLElement")

        _window = window
    }

    return {
        SetGestureWindow: SetGestureWindow,
        GetSettings: _settingsManager.GetSettings,
        SetSettings: _settingsManager.GetSettings,
        GetSetting: _settingsManager.GetSetting,
        SetSetting: _settingsManager.GetSettings,
        Activate: Activate,
        Deactivate: Deactivate,
    }
})(window)
