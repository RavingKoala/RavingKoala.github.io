## Objects

```js
GestureSettings = {
    Sensitivity: 20, // minimum px distance before stroke is counted
    DrawSize: 15, // px
    DrawColor: "#618eff", // str, hexColor
    DrawFps: 0, // int, 
    DrawDataUseEveryNUpdates: 5, // int, use draw data every n mousemove updates
    DisplaySize: 15, // px
    DisplayColor: "#618eff", // str, hexColor
    DisplayFps: 30, // int
    DisplaySpeed: 100, // ?? px/s ??
    DisplayPause: 2000, // int, miliseconds of delay between finishing the animation, and starting the next
    DisplayAnimationTrail: 1000, // int, ms how long the trail lasts
    MaxStrokes: 5, // amount of stroke that can be drawn for the gestures
    DisplaySquareOffArea: true, // bool, if displayDOM is not square, make it a square and center area
    DisplayStrokePadding: 10, // px of the displayField

    
    /** TODO:
     * InputActivationEvent: LeftClick,
     * ActivationEvent: rightClick
     * Gridcomplexion: 0 // 0 = infinite, 1 = 2 rows,2 cols, 3 = 3 rows, 3 cols, etc // I'ts a value for how oftenit can go in the same direction (not consectutively)
     * Datastorage: instanceof DataStorage // (from file ../../../modules/js/storageManager.js)
     * GestureWindowDetectOutside: true // detect if mouse leaves the window and still use gestures if its outside the window (perhaps make it an enum scope {Element, Document, outside})
     */
}

enum Stroke {
    up
    down
    left
    right
}
```

## Usage
```js
// functions
Gestures.SetDrawingCanvas(instanceof HTMLElement)
Gestures.SetDisplayingCanvas(instanceof HTMLElement)
Gestures.SetGestureWindow(WINDOW|DOCUMENT|HTMLELEMENT)

Gestures.GetList(): Gesture[] as int[][] // get all gestures

Gestures.New()
Gestures.Save("name")
Gestures.Exists("name")
Gestures.Display("name")
Gestures.Forget("name")

// Events
Gestures.OnListUpdate((event) => { event.data = { Item: Gesture as int[] }})
Gestures.OnEntryChange((event) => { event.data = { Item: Gesture as int[] }})
Gestures.OnGestureExecuted("name", (event) => {})
```

```js
// functions
Gestures.SetDrawingCanvas(instanceof HTMLElement)
Gestures.SetDisplayingCanvas(instanceof HTMLElement)

Gestures.GetSetting("Setting"): any // return value
Gestures.SetSettings(obj)
Gestures.SetSetting("Setting", "NewValue")
Gestures.GetSettings(): dictionary // return obj
Gestures.GetList(): Gesture[] as int[][] // get all gestures

Gestures.SetDataStorage(instanceof DataStorage)

Gestures.EnableDrawing()
Gestures.DisableDrawing()

Gestures.SetGestureWindow(WINDOW|DOCUMENT|HTMLELEMENT)
Gestures.New()
Gestures.Save("name")
Gestures.Exists("name")
Gestures.Display("name")
Gestures.StopDisplaying()
Gestures.Forget("name")
Gestures.GestureExists(Gesture as int[])

// Events
Gestures.OnListUpdate((event) => { event.data = { Item: Gesture as int[] }})
Gestures.OnEntryChange((event) => { event.data = { Item: Gesture as int[] }})
Gestures.OnGestureExecuted("name", (event) => {})

```

```JS

// TODO: use [this](https://stackoverflow.com/questions/11533098/how-to-catch-mouse-up-event-outside-of-element#answer-11533211) to detect mouseevents outside the page (look at the fiddle)
// Optional TODO: save events to saved gestures
// Separate Gesturemanager in separate file (also remove localStorage and sessionStorage managers)

```