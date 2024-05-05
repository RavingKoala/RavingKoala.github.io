## Objects

```js
GestureSettings = {
    Sensitivity: 13, // minimum px distance before stroke is counted
    MaxStrokes: 5, // amount of stroke that can be drawn for the gestures (0 = infinite)
    GridComplexity: 0, // 0 = infinite, 1 = 2 rows,2 cols, 3 = 3 rows, 3 cols, etc // I'ts a value for how often it can go in the same direction (not consecutively)
    DrawSize: 15, // px
    DrawColor: "#618eff", // str, hexColor
    DrawUseDataEveryNUpdates: 6, // int, use draw data every n mousemove updates
    DisplaySize: 15, // px
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

enum GestureDirection = {
    up,
    right,
    down,
    left,
    neutral,
}

const GestureEvents = {
    addedGesture: "addedGesture", // details: { name: string, Gesture as int[] }
    gesture: "gesture", // details: { name: string, Gesture as int[] }
    failedGesture: "failedGesture",// details: { Gesture as int[] }
}
```

## Usage
```js
// functions
GestureManager.SetInputCanvas(instanceof HTMLCanvasElement)
GestureManager.SetOutputCanvas(instanceof HTMLCanvasElement)

GestureManager.GetGestures(): Gesture[] as int[][]

GestureManager.Exists("name")
GestureManager.New()
GestureManager.Save("name")
GestureManager.Cancel()
GestureManager.Display("name")
GestureManager.Forget("name")
```
```js
GestureListener.Activate() // default activates window
```


```js
// functions
GestureManager.SetInputCanvas(instanceof HTMLCanvasElement)
GestureManager.SetOutputCanvas(instanceof HTMLCanvasElement)

GestureManager.GetSetting("Setting"): any // return value
GestureManager.SetSettings(obj)
GestureManager.SetSetting("Setting", "NewValue")
GestureManager.GetSettings(): { settings: value, ...} // return obj
GestureManager.GetGestures(): { name: Gesture as int[], ...}

GestureManager.SetDataStorage(instanceof DataStorage)

GestureManager.Exists("name")
GestureManager.New()
GestureManager.Save("name")
GestureManager.Cancel()
GestureManager.Display("name")
GestureManager.StopDisplaying()
GestureManager.Forget("name")
GestureManager.GestureExists(Gesture as int[])


GestureListener.SetGestureWindow(HTMLELEMENT)
GestureListener.SetDataStorage(instanceof DataStorage)
GestureListener.Activate() // default activates window
GestureListener.Dectivate() // default activates window
```

```JS
// TODO:
// bind late (source: https://youtu.be/Rwc4fHUnGuU?si=q-IrTO3aZ3FFulkv&t=206)
// do as little as possible on main tread (source: https://youtu.be/Rwc4fHUnGuU?si=RL1PRcCVByH_Y4RS&t=246)
// other contextmenu setting: contextmenuPrevention (could be an enum: always, possibleGesture, gesture, gestureAndCancel, never) prevents opening contextmenu depending on the situation (always,never are obvious, possible gesture is when any strokes have been made > 0, gesture is only when an available gesture has been drawn, gestureAndCancel is like gesture but also when amount of trokes are more than limit (dependant on setting: GestureConcelOnTooManyStrokes))
// Touch event support

/* fix: Settings that don't live update
 *
 * DrawColor
 * DisplayColor
 * DisplayToColor // only does trail which is weird
 * DisplayFps // trail length is dependant on fps when starting animation
 * DisplaySpeed // length is dependant on speed when starting animation
 * DisplayTrailLength
 * DisplaySquareOffArea
 * DisplayStrokePadding
 */
```