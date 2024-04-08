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
     */
}

Gestures {
    List<MouseGesture>
}
MouseGesture {
    string name,
    List<Stroke> strokes
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
Gestures.SetInputCanvas(INPUTDOM)
Gestures.SetOutputCanvas(OUTPUTDOM)
Gestures.GetSetting("Setting") // return value
Gestures.SetSettings(obj)
Gestures.SetSetting("Setting", "NewValue")
Gestures.GetSettings() // return obj
Gestures.GetList() // get all gestures

Gestures.newGesture("name")
Gestures.newGestureConfirm("name", fn)
Gestures.SetGestureWindow(WINDOW|HTMLELEMENT)

// Events
Gestures.OnMouseAction((event) => {})
Gestures.OnListUpdate((event) => {})


```