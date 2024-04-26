import { DataStorage } from "./dataStorage.js"
import { GestureLocalStorage } from "./gestureLocalStorage.js"


export { GestureManager, GestureSettings, GestureDirection, GestureListener, GestureEvents }


//#region types

const GestureEvents = {
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
        return 𝙼𝚊𝚝𝚑.𝚜𝚚𝚛𝚝((this.x * this.x + this.y * this.y))
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y
    }
    
    getDirection() {
        if (this.x === 0 && this.y === 0)
            return GestureDirection.neutral
        let thisAbs = this.clone().abs()
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
    Gridcomplexity: 0, // 0 = infinite, 1 = 2 rows,2 cols, 3 = 3 rows, 3 cols, etc // I'ts a value for how oftenit can go in the same direction (not consectutively)
    UseDataEveryNUpdates: 4, // int, use draw data every n mousemove updates
    DrawSize: 15, // px
    DrawColor: "#618eff", // str, hexColor
    DisplaySize: 15, // px
    DisplayColor: "#618eff", // str, hexColor
    DisplayToColor: "#333",  // str, hexColor
    DisplayFps: 120, // int (0 = as high as possible)
    DisplaySpeed: 200, // int, px/s
    DisplayPause: 1000, // int, miliseconds of delay between finishing the animation, and starting the next
    DisplayPauseOnArrive: false, // true: start pause timer when head reaches the end of the animation segments // false: start pause timer when end of the tail reaches the end
    DisplayTrailLength: 60, // int, px length of the trail
    DisplayLeaveTrail: true, // leave the trail color behind at after the end of the DisplayTrailLength
    DisplaySquareOffArea: true, // bool, if displayDOM is not square, make it a square and center area
    DisplayStrokePadding: 30, // px of the displayField
    GestureCancelOnMouseLeave: true, // detect if mouse leaves the window and still use gestures if its outside the window (perhaps make it an enum scope {Element, Document, outside})
    GestureConcelOnTooManyStrokes: true, // true: if (MaxStrokes === 5 && drawnGesture.length === 6) cancel, false; if (MaxStrokes === 5 && drawnGesture.length === 6) use last 5 strokes
}

/** ValidationTypes
 * 
 * Used for setting validation of objects
 *
 * basicValidation means if variables of this type should only be validatied for being this type,
 * and if equal to some value.
 * This is for variables with predetermined facts such as size and subvalues.
 */
const ValidationTypes = {
    object: (advancedValiation) => { return { typeof: "object", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    boolean: (advancedValiation) => { return { typeof: "boolean", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    number : (advancedValiation) => { return { typeof: "number", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    bigint : (advancedValiation) => { return { typeof: "bigint", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    string : (advancedValiation) => { return { typeof: "string", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    symbol : (advancedValiation) => { return { typeof: "symbol", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    function: () => ValidationTypes.object((obj) => Array.isArray(obj)),
    colorHex: () => ValidationTypes.string((str) => /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(str)),
}

const SettingValidation = {
    Sensitivity: ValidationTypes.number(null),
    MaxStrokes: ValidationTypes.number(null),
    Gridcomplexity: ValidationTypes.number(null),
    DrawSize: ValidationTypes.number(null),
    DrawColor: ValidationTypes.colorHex(),
    UseDataEveryNUpdates: ValidationTypes.number(null),
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
    GestureConcelOnTooManyStrokes: ValidationTypes.boolean(null),
}

const GestureSettingsManager = (function() {
    let _settings = GestureSettings

    let GetSetting = (key) => {
        if (!_settings.hasOwnProperty(key))
            throw new Error(`${key} is not a valid setting!`)

        return _settings[key]
    }

    let SetSetting = (key, value) => {
        if (!_settings.hasOwnProperty(key))
            throw new Error(`${key} is not a valid setting!`)
        if (SettingValidation[key].typeof !== typeof value)
            throw new Error("invalid type! " + key + "should be of type: " + SettingValidation[key].typeof)
        if (!SettingValidation[key].basicValidation)
            if (!SettingValidation[key].advancedValiation(value))
                throw new Error("value is not valid, please make the format valid!")

        _settings[key] = value
    }

    let GetSettings = () => {
        return _settings
    }

    let SetSettings = (settings) => {
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
    let _deltaActiveDirection = 0 // total distance consecutively traveld in a direction
    let _lastPos = null // vec of last position, updates every UpdateData
    
    let _gesture = [] // list of gesture directions for this gesture

    let _settingsManager = null

    let _delayCounter = 0

    let SetSettingsManager = (settingsManager) => {
        _settingsManager = settingsManager
    }

    let UpdateData = (vec) => {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2")

        if (_lastPos === null)
            _lastPos = vec

        let delayMax = _settingsManager.GetSetting("UseDataEveryNUpdates")
        if (delayMax !== 0)
            if (_delayCounter < delayMax){
                _delayCounter++
                return
            } else 
                _delayCounter = 0


        let delta = vec.clone().sub(_lastPos)
        let deltaDirection = delta.getDirection()
        
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

    let Finish = (maxStrokes, gridComplexity, cancelOnTooManyStrokes) => {
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
            let tempGesture = []
            let min = new Vec2(0, 0), max = new Vec2(0, 0), temp = new Vec2(0, 0)
            for (let direction of returnGesture.toReversed()) {
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

    let Cancel = () => {
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

    let SetInputCanvas = (inputDom) => {
        _inputDom = inputDom
        _inputContext = inputDom.getContext("2d")
        Clear()
    }

    let SetSettingsManager = (settingsManager) => {
        _settingsManager = settingsManager
    }

    let DrawPoint = (vec) => {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2")
        if (_inputDom === null)
            throw new Error("Input is not set")
        
        if (lastPoint === null)
            lastPoint = vec

        _inputContext.beginPath()
        _inputContext.moveTo(lastPoint.x, lastPoint.y)
        _inputContext.lineWidth = 15
        _inputContext.lineCap = "round"
        _inputContext.strokeStyle = _settingsManager.GetSetting("DrawColor")
        _inputContext.lineTo(vec.x, vec.y)
        _inputContext.stroke()
        
        lastPoint = vec
    }

    let Clear = () => {
        lastPoint = null
        
        if(!(_inputDom instanceof HTMLCanvasElement))
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

    let SetInputCanvas = (inputDom) => {
        _inputDom = inputDom

        _drawingUi.SetInputCanvas(inputDom)
    }

    let StartDrawing = (event) => {
        _isDrawing = true

        _drawingUi.Clear()
    
        if (event === undefined || event === null)
            return 
        if (!(event instanceof MouseEvent)) {
            console.warn("Param event should be a MouseEvent")
            return
        }
        
        var rect = _inputDom.getBoundingClientRect()
        let newPoint = new Vec2(event.clientX - rect.left, event.clientY - rect.top)

        _gestureParsing.UpdateData(newPoint)
        _drawingUi.DrawPoint(newPoint)
    }

    let OnDraw = (event) => {
        if (!_isDrawing) return

        var rect = _inputDom.getBoundingClientRect();
        let newPoint = new Vec2(event.clientX - rect.left, event.clientY - rect.top)

        _gestureParsing.UpdateData(newPoint)
        _drawingUi.DrawPoint(newPoint)
    }

    let StopDrawing = () => {
        _isDrawing = false
        let gestureResult = _gestureParsing.Finish(_settingsManager.GetSetting("MaxStrokes"), _settingsManager.GetSetting("Gridcomplexity"), false)
        _drawingUi.Clear()
        return gestureResult
    }

    let CancelDrawing = () => {
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
    
    const requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame

    let SetOutputCanvas = (outputDom) => {
        _outputDom = outputDom
        _outputContext = outputDom.getContext("2d")
        Reset()
    }

    let SetSettingsManager = (settingsManager) => {
        _settingsManager = settingsManager
    }

    let _gestureToPoints = (gestureArr) => {
        const outputDomRect = _outputDom.getBoundingClientRect()
        let drawradius = _settingsManager.GetSetting("DisplaySize")
        let drawRect = { left: 0, top: 0, width: outputDomRect.width, height: outputDomRect.height }

        if (_settingsManager.GetSetting("DisplaySquareOffArea") && outputDomRect.width != outputDomRect.height) {
            if (outputDomRect.width < outputDomRect.height) {
                drawRect.top = (outputDomRect.height - outputDomRect.width) / 2
                drawRect.height = outputDomRect.width
            } else {
                drawRect.left = (outputDomRect.width - outputDomRect.height) / 2
                drawRect.width = outputDomRect.height
            }    
        }

        const padding = _settingsManager.GetSetting("DisplayStrokePadding") + (drawradius / 2)
        drawRect.left += padding + (drawradius % 2 !== 0 ? 0 : 0.5)
        drawRect.top += padding + (drawradius % 2 !== 0 ? 0 : 0.5)
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

        let cols = xMax - xMin
        let rows = yMax - yMin
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


        let retArr = []
        
        let lastPos = new Vec2(drawRect.left + ((cols - xMax) * xLineSize), drawRect.top + ((rows - yMax) * yLineSize))
        retArr.push(lastPos.clone())

        gestureArr.forEach(direction => {
            if (direction === GestureDirection.neutral)
                return
            else if (direction === GestureDirection.left || direction === GestureDirection.right)
                lastPos.add(GestureDirectionToVec2(direction).mult(xLineSize))
            else
                lastPos.add(GestureDirectionToVec2(direction).mult(yLineSize))

            retArr.push(lastPos.clone())
        })

        return retArr
    }

    let Start = (gestureArr) => {
        Reset()
        _isDisplaying = true

        _lastUpdateTime = Date.now()

        if (gestureArr.length === 0)
            return;

        _points = _gestureToPoints(gestureArr)

        _snakeChunks = []
        const chunks = 1 + (_settingsManager.GetSetting("DisplayTrailLength") / (_settingsManager.GetSetting("DisplaySpeed") * (1000 / _settingsManager.GetSetting("DisplayFps")) / 1000))
        
        _snakeChunks.push({ pos: _points[0].clone(), color: _settingsManager.GetSetting("DisplayColor") })
        for (let index = 1; index < chunks; index++) {
            _snakeChunks.push({ pos: _points[0].clone(), color: _findColor(_settingsManager.GetSetting("DisplayColor"), _settingsManager.GetSetting("DisplayToColor"), (index / chunks)) })
        }
        _snakeChunks.push({ pos: _points[0].clone(), color: _settingsManager.GetSetting("DisplayToColor") })
        
        _animate()
    }

    // param examples: (fromColorHex = "#00ff00", toColorHex = "#333", colorTransition = 0.8)
    // if (colorTransition === 0) return fromColorHex and if (colorTransition === 1) return toColorHex
    let _findColor = (fromColorHex, toColorHex, colorTransition) => {
        let fromColor = hexToRGB(fromColorHex)
        let toColor = hexToRGB(toColorHex)

        let r = Math.floor((fromColor.r * (1 - colorTransition)) + (toColor.r * colorTransition))
        let g = Math.floor((fromColor.g * (1 - colorTransition)) + (toColor.g * colorTransition))
        let b = Math.floor((fromColor.b * (1 - colorTransition)) + (toColor.b * colorTransition))
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

    let _animate = () => {
        if (!_isDisplaying) return

        let deltaTime = Date.now() - _lastUpdateTime

        if (_settingsManager.GetSetting("DisplayFps") !== 0 && deltaTime < (1000 / _settingsManager.GetSetting("DisplayFps"))) {
            requestAnimationFrame(_animate)
            return
        }
        _lastUpdateTime = Date.now()

        // clear canvas
        _outputContext.reset()
        // draw path that snake has passed
        _outputContext.strokeStyle = _settingsManager.GetSetting("DisplayToColor")
        _outputContext.lineWidth = _settingsManager.GetSetting("DrawSize")
        _outputContext.lineJoin = "round";
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
        _outputContext.strokeStyle = _settingsManager.GetSetting("DisplayToColor")
        _outputContext.lineWidth = _settingsManager.GetSetting("DrawSize")
        for (let i = _snakeChunks.length - 1; i > 0; i--) {
            if (_snakeChunks[i - 1].pos.equals(new Vec2(-1, -1)))
                continue
            
            _outputContext.strokeStyle = _snakeChunks[i - 1].color
            _outputContext.beginPath()
            _outputContext.moveTo(Math.floor(_snakeChunks[i].pos.x), Math.floor(_snakeChunks[i].pos.y))
            _outputContext.lineTo(Math.floor(_snakeChunks[i-1].pos.x), Math.floor(_snakeChunks[i-1].pos.y))
            _outputContext.stroke()
        }

        let distance = (_settingsManager.GetSetting("DisplaySpeed") / 1000) * deltaTime


        let newPoint
        if (_currentPointI >= _points.length - 1 && _snakeChunks[0].pos.equals(_points[_points.length - 1]) || _snakeChunks[0].pos.equals(new Vec2(-1, -1))) // ending animation
            newPoint = new Vec2(-1, -1)
        else {
            let direnctionCurrentPath = _points[_currentPointI + 1].clone().sub(_points[_currentPointI]).getDirection()
            let deltaDistance = GestureDirectionToVec2(direnctionCurrentPath).mult(distance)
            if (deltaDistance.lengthSq() > _points[_currentPointI + 1].clone().sub(_snakeChunks[0].pos).lengthSq())
                newPoint = _points[_currentPointI + 1]
            else
                newPoint = _snakeChunks[0].pos.clone().add(deltaDistance)
        }

        for (let i = _snakeChunks.length - 1; i > 0; i--) {
            _snakeChunks[i].pos = _snakeChunks[i - 1].pos.clone()
        }
        _snakeChunks[0].pos = newPoint


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
    
    let Stop = () => {
        Reset()
    }
    
    let Reset = () => {
        _isDisplaying = false
        
        _currentPointI = 0
        _snakeChunks = null
        _points = null
        
        _clear()
    }

    let _clear = () => {
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
    const _settingsManager = GestureSettingsManager
    const _displayingUi = GestureDisplayingUi
    _displayingUi.SetSettingsManager(_settingsManager)

    let SetOutputCanvas = (outputDom) => {
        if (!(outputDom instanceof HTMLCanvasElement))
            throw new Error("Output DOM Element is not a Canvas!")

        _displayingUi.SetOutputCanvas(outputDom)
    }

    let Display = (gesture) => {
        _displayingUi.Stop()
        
        if (!Array.isArray(gesture))
            throw new Error("Gesture has to be an Array!")
        if (gesture.length == 0)
            return
        if (!(typeof gesture[0] === 'number'))
            throw new Error("Gesture has to be an Array of numbers! Make use of the GestureDirection enum.")

        _displayingUi.Start(gesture)
    }

    let Stop = () => {
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

const GestureManager = (function() {
    let _drawingEnabled = false
    let _drawing = false

    let _activeGesture = []

    const _settingsManager = GestureSettingsManager
    const _gestureDrawing = GestureDrawing
    const _gestureDisplaying = GestureDisplaying
    let _dataStorage = GestureLocalStorage
    
    let SetInputCanvas = (inputDom) => {
        if (!(inputDom instanceof HTMLCanvasElement))
            throw new Error("Input DOM Element is not a Canvas!")
        
        _addInputEventListners(inputDom)
        _gestureDrawing.SetInputCanvas(inputDom)
    }

    let SetOutputCanvas = (outputDom) => {
        if (!(outputDom instanceof HTMLCanvasElement))
            throw new Error("Input DOM Element is not a Canvas!")

        _gestureDisplaying.SetOutputCanvas(outputDom)
    }

    let _addInputEventListners = (inputDom) => {
        inputDom.addEventListener("mousedown", (event) => {
            if (event.button !== 0) // left click
                return
            if (!_drawingEnabled)
                return

            _drawing = true
            _gestureDrawing.StartDrawing(event)
        })

        inputDom.addEventListener("mousemove", (event) => {
            if (!_drawingEnabled)
                return
            if (_drawing)
                _gestureDrawing.OnDraw(event)
        })

        inputDom.addEventListener("mouseup", (event) => {
            if (event.button !== 0) // left click
                return
            if (!_drawingEnabled)
                return
            
            _drawing = false
            _activeGesture = _gestureDrawing.StopDrawing()
            _gestureDisplaying.Display(_activeGesture)
            
        })

        inputDom.addEventListener("mouseleave", (event) => {
            _drawing = false
            _gestureDrawing.CancelDrawing()
        })
    }

    let SetSettings = (settings) => {
        _settingsManager.SetSettings(settings)
        _gestureDrawing.SetSettings(settings)
        _gestureDisplaying.SetSettings(settings)
    }

    let SetSetting = (key, value) => {
        _settingsManager.SetSetting(key, value)
        _gestureDrawing.SetSetting(key, value)
        _gestureDisplaying.SetSetting(key, value)
    }

    let SetDataStorage = (dataStorage) => {
        if (!(dataStorage instanceof DataStorage))
            throw new Error("Param dataStorage is not of type Datastorage, " +
            "Use either DataStorage or use another class that extends from the interface DataStorage!")
        
        _dataStorage = dataStorage
    }

    let Exists = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        return _dataStorage.exists(name)
    }

    let New = () => {
        _drawingEnabled = true
        _gestureDrawing.StartDrawing()
    }

    let Save = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        _drawingEnabled = false
        _dataStorage.set(name, _activeGesture)
        _activeGesture = []

    }

    let Cancel = () => {
        _drawingEnabled = false
        _activeGesture = []
        
        _gestureDisplaying.Stop()
    }

    let Display = (name) => {
        if (typeof name !== "string")
            throw new Error("param name must be a string!")

        let gesture = _dataStorage.get(name)

        _gestureDisplaying.Display(gesture)
    }

    let Forget = (name) => {
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
        StopDisplaying: _gestureDisplaying.Stop,
        Exists: Exists,
        New: New,
        Save: Save,
        Cancel: Cancel,
        Display: Display,
        Forget: Forget,
    }
})()

const GestureListener = (function(window, document) {
    const _settingsManager = GestureSettingsManager
    const _gestureParsing = GestureParsing
    _gestureParsing.SetSettingsManager(_settingsManager)
    let _dataStorage = GestureLocalStorage

    let _window = window

    let _parsing = false
    let _preventContextmenu = false

    let _addWindowEventListners = (window) => {
        window.addEventListener("mousedown", (event) => {
            if (event.button !== 2) // right click
                return

            _parsing = true
            _gestureParsing.UpdateData(new Vec2(event.clientX, event.clientY))
        })

        window.addEventListener("mousemove", (event) => {
            if (!_parsing)
                return
            if (_settingsManager.GetSetting("GestureCancelOnMouseLeave")) {
                if (event.clientX < 0 || event.clientX > window.innerWidth
                    || event.clientY < 0 || event.clientY > window.innerHeight ) {
                    _parsing = false
                    _gestureParsing.Cancel()
                    return
                }
            }

            _gestureParsing.UpdateData(new Vec2(event.clientX, event.clientY))
        })
        window.addEventListener("contextmenu", (event) => {
            if (_preventContextmenu)
                event.preventDefault()
            _preventContextmenu = false
        })

        window.addEventListener("mouseup", (event) => {
            if (event.button !== 2) // right click
                return

            _parsing = false
            let gesture = _gestureParsing.Finish(_settingsManager.GetSetting("MaxStrokes"), _settingsManager.GetSetting("Gridcomplexity"), _settingsManager.GetSetting("GestureConcelOnTooManyStrokes"))
            if (gesture !== null)
                if (gesture.length > 0)
                    _onGestureEvent(gesture)
        })
    }

    let Activate = () => {
        _addWindowEventListners(_window)
    }

    let _onGestureEvent = (gesture) => {
        _preventContextmenu = true

        const allGestures = _dataStorage.getAll()
        // find event
        const eventEntry = Object.entries(allGestures).find((entry) => gesturesAreEqual(gesture, entry[1]))

        // trigger event
        if (eventEntry === undefined || eventEntry.length <= 0) {
            _window.dispatchEvent(new CustomEvent(GestureEvents.gesture, { detail: { gesture: gesture } }))
            return
        }
        _window.dispatchEvent(new CustomEvent(GestureEvents.failedGesture, { detail: { name: eventEntry[0], gesture: gesture } }))

        
        function gesturesAreEqual(arr1, arr2) {
            if (!Array.isArray(arr1) || !Array.isArray(arr2))
                return false;
            if (arr1.length != arr2.length)
                return false;

            for (var i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i])
                    return false;
            }
            return true
        }
    }

    let SetGestureWindow = (window) => {
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
    }
})(window, document)