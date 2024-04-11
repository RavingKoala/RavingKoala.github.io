import { DataStorage } from "./dataStorage.js"
import { GestureLocalStorage } from "./gestureLocalStorage.js"


export { Gestures, GestureSettings, GestureDirection }

//#region types

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
    X = 0
    Y = 0
    
    constructor(x, y) {
        this.X = x
        this.Y = y
    }

    get() {
        return [this.X, this.Y]
    }
    
    add(vec) {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2!")

        this.X += vec.X
        this.Y += vec.Y

        return this
    }

    sub(value) {
        if (!(value instanceof Vec2))
            throw new Error("Param vec is not of type Vec2!")

        this.X -= value.X
        this.Y -= value.Y

        return this
    }

    mult(value) {
        if (!(value instanceof Vec2 || typeof value === "number"))
            throw new Error("Param vec is neither of type Vec2 nor of type number")

        if (value instanceof Vec2) {
            this.X *= value.X
            this.Y *= value.Y
        } else {
            this.X *= value
            this.Y *= value
        }

        return this
    }

    div(value) {
        if (!(value instanceof Vec2 || typeof value === "number"))
            throw new Error("Param vec is neither of type Vec2 nor of type number!")

        if (value instanceof Vec2) {
            this.X /= value.X
            this.Y /= value.Y
        } else {
            this.X /= value
            this.Y /= value
        }

        return this
    }

    abs() {
        this.X = this.X < 0 ? -this.X : this.X
        this.Y = this.Y < 0 ? -this.Y : this.Y

        return this
    }

    length() {
        return 𝙼𝚊𝚝𝚑.𝚜𝚚𝚛𝚝((this.X * this.X + this.Y * this.Y))
    }

    lengthSq() {
        return this.X * this.X + this.Y * this.Y
    }
    
    getDirection() {
        if (this.X === 0 && this.Y === 0)
            return GestureDirection.neutral
        let thisAbs = this.clone().abs()
        if (thisAbs.X > thisAbs.Y)
            if (this.X > 0)
                return GestureDirection.right
            else
                return GestureDirection.left

        if (this.Y > 0)
            return GestureDirection.down
        else
            return GestureDirection.up
    }

    getDistanceInDirection(direction) {
        if (direction === GestureDirection.left && this.X < 0)
            return this.X * -1
        if (direction === GestureDirection.right && this.X > 0)
            return this.X
        if (direction === GestureDirection.up && this.Y < 0)
            return this.Y * -1
        if (direction === GestureDirection.down && this.Y > 0)
            return this.Y
        
        return 0;
    }

    equals(vec) {
        if (!(vec instanceof Vec2))
            throw new Error("Param vec is not of type Vec2!")

        return this.X === vec.X && this.Y === vec.Y
    }

    clone() {
        return new Vec2(this.X, this.Y)
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
        throw new Error("Gesture not found. Make sure to pass in a gesture!")
}

/**
 * @public
 */
const GestureSettings = {
    Sensitivity: 13, // minimum px distance before stroke is counted
    DrawSize: 15, // px
    DrawColor: "#618eff", // str, hexColor
    DrawFps: 0, // int, 
    DrawDataUseEveryNUpdates: 4, // int, use draw data every n mousemove updates
    DisplaySize: 15, // px
    DisplayColor: "#618eff", // str, hexColor
    DisplayToColor: "#333",  // str, hexColor
    DisplayFps: 0, // int
    DisplaySpeed: 200, // px/sec
    DisplayPause: 1000, // int, miliseconds of delay between finishing the animation, and starting the next
    DisplayTrail: 40, // int, px length of the trail
    MaxStrokes: 1000, // amount of stroke that can be drawn for the gestures
    DisplaySquareOffArea: true, // bool, if displayDOM is not square, make it a square and center area
    DisplayStrokePadding: 10, // px of the displayField
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
    function : (advancedValiation) => { return { typeof: "function", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    object : (advancedValiation) => { return { typeof: "object", basicValidation: advancedValiation === null, advancedValiation: advancedValiation } },
    colorHex: () => ValidationTypes.string((str) => /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(str))
}

const SettingValidation = {
    Sensitivity: ValidationTypes.number(null),
    DrawSize: ValidationTypes.number(null),
    DrawColor: ValidationTypes.colorHex(),
    DrawFps: ValidationTypes.number(null),
    DrawDataUseEveryNUpdates: ValidationTypes.number(null),
    DisplaySize: ValidationTypes.number(null),
    DisplayColor: ValidationTypes.colorHex(),
    DisplayToColor: ValidationTypes.colorHex(),
    DisplayFps: ValidationTypes.number(null),
    DisplaySpeed: ValidationTypes.number(null),
    DisplayPause: ValidationTypes.number(null),
    DisplayTrail: ValidationTypes.number(null),
    MaxStrokes: ValidationTypes.number(null),
    DisplaySquareOffArea: ValidationTypes.boolean(null),
    DisplayStrokePadding: ValidationTypes.number(null),
}

const GestureSettingsManager = (function() {
    let _settings = GestureSettings

    let GetSetting = (key) => {
        if (!_settings.hasOwnProperty(key))
            throw new Error(`${key} is not a valid setting!`)

        return _settings[key]
    }

    let SetSetting = (key, value) => {
        if (SettingValidation[key].typeof !== typeof value)
            throw new Error("invalid type")
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
        
        for (const [key, value] of Object.entries(settings)) {
            if (!Object.hasOwnProperty(_settings, key))
                throw new Error(`${key} is not a valid setting!`)

            SetSetting(key, value)
        }
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
    
    let _directions = [] // list of gesture directions for this gesture

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

        let delayMax = _settingsManager.GetSetting("DrawDataUseEveryNUpdates")
        if (delayMax !== 0)
            if (_delayCounter < delayMax){
                _delayCounter++
                return
            } else 
                _delayCounter = 0

        let delta = vec.clone().sub(_lastPos)
        let deltaDirection = delta.getDirection()
        
        if (deltaDirection !== _activeDirection || deltaDirection === _directions[_directions.length - 1]) {
            // reset
            _activeDirection = deltaDirection
            _deltaActiveDirection = 0
        } else {
            // continue values
            _deltaActiveDirection += delta.getDistanceInDirection(_activeDirection)

            if (_deltaActiveDirection > _settingsManager.GetSetting("Sensitivity")) {
                _directions.push(_activeDirection)
                _activeDirection = null
                _lastPos = null
            }
        }
       
       _lastPos = vec
    }

    let Finish = () => {
        let returnDirections = _directions
        
        _directions = []
        _activeDirection = null
        _deltaActiveDirection = 0
        _lastPos = null

        let maxStrokes = _settingsManager.GetSetting("MaxStrokes")
        if (maxStrokes !== 0 && returnDirections.length > maxStrokes) // only retrieve the last n strokes (n = maxStrokes)
            returnDirections = returnDirections.slice(Math.max(returnDirections.length - maxStrokes, 0))
        return returnDirections
    }

    let Cancel = () => {
        _directions = []
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
        _inputContext.moveTo(lastPoint.X, lastPoint.Y)
        _inputContext.lineWidth = 15
        _inputContext.lineCap = "round"
        _inputContext.strokeStyle = _settingsManager.GetSetting("DrawColor")
        _inputContext.lineTo(vec.X, vec.Y)
        _inputContext.stroke()
        
        lastPoint = vec
    }

    let Clear = () => {
        lastPoint = null
        
        if(!(_inputDom instanceof HTMLCanvasElement))
            throw new Error("Input DOM Element is not an SVG!")

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
    
    const _gestureParsing = GestureParsing
    const _drawingUi = GestureDrawingUi

    let SetInputCanvas = (inputDom) => {
        _inputDom = inputDom

        _drawingUi.SetInputCanvas(inputDom)
    }

    let SetSettingsManager = (settingsManager) => {
        _gestureParsing.SetSettingsManager(settingsManager)
        _drawingUi.SetSettingsManager(settingsManager)
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
        let gestureResult = _gestureParsing.Finish()
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
        SetSettingsManager: SetSettingsManager,
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
    let _lastPoint = null

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
        const paddingSetting = 30 // px // TODO: make settings

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

        const padding = paddingSetting + (drawradius / 2)
        drawRect.left += padding
        drawRect.top += padding
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
                const offset = drawRect.height * rows / cols
                drawRect.top += offset / 2
                drawRect.height -= offset
            } else {
                const offset = drawRect.width * cols / rows
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
        _points = null
        _isDisplaying = true

        if (gestureArr.length === 0)
            return;

        _points = _gestureToPoints(gestureArr)

        _animate()
    }

    let _animate = () => {
        if (!_isDisplaying) return

        let deltaTime
        if (_lastUpdateTime === null) {
            _lastUpdateTime = Date.now()
            deltaTime = 0
        } else
            deltaTime = Date.now() - _lastUpdateTime
            
        if (deltaTime < (1000 / _settingsManager.GetSetting("DisplayFps") && _settingsManager.GetSetting("DisplayFps") !== 0)) {
            requestAnimationFrame(_animate)
            return
        }
        _lastUpdateTime = Date.now()
        
        let distance = _settingsManager.GetSetting("DisplaySpeed") * deltaTime / 1000
        
        if (_lastPoint !== null) {
            _outputContext.globalAlpha = distance / _settingsManager.GetSetting("DisplayTrail")
            _outputContext.strokeStyle = _settingsManager.GetSetting("DisplayToColor")
            _outputContext.lineWidth = 16
            // _outputContext.lineCap = "round"
            _outputContext.lineJoin = "round";

            _outputContext.beginPath()
            _outputContext.moveTo(_points[0].X, _points[0].Y)
            for (let i = 1; i <= _currentPointI; i++)
                _outputContext.lineTo(_points[i].X, _points[i].Y)
            
            _outputContext.lineTo(_lastPoint.X, _lastPoint.Y)

            _outputContext.stroke()
            _outputContext.globalAlpha = 1
            
            
            // restarting animation
            if (_currentPointI + 1 >= _points.length) {
                if (Date.now() - _lastUpdateTimeLoop < _settingsManager.GetSetting("DisplayPause")) {
                    requestAnimationFrame(_animate)
                    return
                }
                
                _outputContext.reset()
                _currentPointI = 0
                distance = 0
                _lastPoint = null
            }
            
        }
        
        _lastUpdateTimeLoop = _lastUpdateTime
        
        let newPoint
        if (_lastPoint !== null) {
            let direnctionCurrentPath = _points[_currentPointI + 1].clone().sub(_points[_currentPointI]).getDirection()
            let deltaDistance = GestureDirectionToVec2(direnctionCurrentPath).mult(distance)
            if (deltaDistance.lengthSq() > _points[_currentPointI + 1].clone().sub(_lastPoint).lengthSq())
                newPoint = _points[_currentPointI + 1]
            else
                newPoint = _lastPoint.clone().add(deltaDistance)
        } else {
            newPoint = _points[0]
            _lastPoint = _points[0]
        }

        _outputContext.beginPath()
        _outputContext.moveTo(_lastPoint.X, _lastPoint.Y)
        _outputContext.lineWidth = 15
        _outputContext.lineCap = "round"
        _outputContext.strokeStyle = _settingsManager.GetSetting("DisplayColor")
        _outputContext.lineTo(newPoint.X, newPoint.Y)
        _outputContext.stroke()
        
        _lastPoint = newPoint
        if (_lastPoint.equals(_points[_currentPointI + 1])) {
            _currentPointI++
        }
        
        requestAnimationFrame(_animate)
    }
    
    let Stop = () => {
        Reset()
    }
    
    let Reset = () => {
        _isDisplaying = false
        
        _currentPointI = 0
        _lastPoint = null
        _points = null
        
        _clear()
    }

    let _clear = () => {
        if (!(_outputDom instanceof HTMLCanvasElement))
            throw new Error("Output DOM Element is not an SVG!")

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
    const _displayingUi = GestureDisplayingUi

    let SetOutputCanvas = (outputDom) => {
        if (!(outputDom instanceof HTMLCanvasElement))
            throw new Error("Output DOM Element is not an SVG!")

        _displayingUi.SetOutputCanvas(outputDom)
    }

    let SetSettingsManager = (settingsManager) => {
        _displayingUi.SetSettingsManager(settingsManager)
    }

    let Display = (gesture) => {
        _displayingUi.Stop()
        
        if (!Array.isArray(gesture))
            throw new Error("Gesture has to be an Array!")
        if (gesture.length == 0)
            return
        if (!(typeof gesture[0] === 'number'))
            throw new Error("Gesture has to be an Array of numbers!")

        _displayingUi.Start(gesture)
    }

    let Stop = () => {
        _displayingUi.Stop()
    }

    return {
        SetOutputCanvas: SetOutputCanvas,
        SetSettingsManager: SetSettingsManager,
        Display: Display,
        Stop: Stop,
    }
})()

//#endregion

const Gestures = (function() {
    let _drawingEnabled = false
    let _drawing = false

    let _activeGesture = []

    const _settingsManager = GestureSettingsManager
    const _gestureDrawing = GestureDrawing
    _gestureDrawing.SetSettingsManager(_settingsManager)
    const _gestureDisplaying = GestureDisplaying
    _gestureDisplaying.SetSettingsManager(_settingsManager)
    let _dataStorage = GestureLocalStorage
    
    let SetInputCanvas = (inputDom) => {
        if (!(inputDom instanceof HTMLCanvasElement))
            throw new Error("Input DOM Element is not an SVG!")
        
        _addInputEventListners(inputDom)

        _gestureDrawing.SetInputCanvas(inputDom)
    }

    let SetOutputCanvas = (outputDom) => {
        if (!(outputDom instanceof HTMLCanvasElement))
            throw new Error("Input DOM Element is not an SVG!")

        _gestureDisplaying.SetOutputCanvas(outputDom)
    }

    let _addInputEventListners = (inputDom) => {
        inputDom.addEventListener("mousedown", (event) => {
            event.preventDefault()

            if (!_drawingEnabled)
                return

            _drawing = true
            _gestureDrawing.StartDrawing(event)
        })
        inputDom.addEventListener("mousemove", (event) => {
            event.preventDefault()

            if (_drawing)
                _gestureDrawing.OnDraw(event)
        })
        inputDom.addEventListener("mouseup", (event) => {
            event.preventDefault()

            if (!_drawingEnabled)
                return
            
            _drawing = false

            _activeGesture = _gestureDrawing.StopDrawing()

            _gestureDisplaying.Display(_activeGesture)
            
        })
        inputDom.addEventListener("mouseleave", (event) => {
            event.preventDefault()

            _drawing = false

            _gestureDrawing.CancelDrawing()
        })
    }

    let SetDataStorage = (dataStorage) => {
        if (!(dataStorage instanceof DataStorage))
            throw new Error("Param dataStorage is not of type Datastorage, " +
            "please either LocalDataStorage or SessionDataStorage. " +
            "Or use another class that extends from the interface DataStorage!")
        
        _dataStorage = dataStorage
    }

    let SetGestureWindow = (el) => {
        
    }

    let Exists = (name) => {
        return _dataStorage.exists(name)
    }

    let New = () => {
        _drawingEnabled = true
        _gestureDrawing.StartDrawing()
    }

    let Save = (name) => {
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
        // param validation

        let gesture = _dataStorage.get(name)

        _gestureDisplaying.Display(gesture)
    }

    let Forget = (name) => {
        _dataStorage.remove(name)
    }

    return {
        SetInputCanvas: SetInputCanvas,
        SetOutputCanvas: SetOutputCanvas,
        GetSettings: _settingsManager.GetSettings,
        SetSettings: _settingsManager.SetSettings,
        GetSetting: _settingsManager.GetSetting,
        SetSetting: _settingsManager.SetSetting,
        SetDataStorage: SetDataStorage,
        SetGestureWindow: SetGestureWindow,
        EnableDrawing: _gestureDrawing.Enable,
        DisableDrawing: _gestureDrawing.Disable,
        StopDisplaying: _gestureDisplaying.Stop,
        Exists: Exists,
        New: New,
        Save: Save,
        Cancel: Cancel,
        Display: Display,
        Forget: Forget,
    }
})()