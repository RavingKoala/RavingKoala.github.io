## Objects

```js
GestureSettings = {
    Sensitivity: 13, // minimum px distance before stroke is counted
    MaxStrokes: 5, // amount of stroke that can be drawn for the gestures (0 = infinite)
    Gridcomplexity: 0, // 0 = infinite, 1 = 2 rows,2 cols, 3 = 3 rows, 3 cols, etc // I'ts a value for how oftenit can go in the same direction (not consectutively)
    DrawSize: 15, // px
    DrawColor: "#618eff", // str, hexColor
    DrawUseDataEveryNUpdates: 4, // int, use draw data every n mousemove updates
    DisplaySize: 15, // px
    DisplayColor: "#618eff", // str, hexColor
    DisplayToColor: "#333",  // str, hexColor
    DisplayFps: 120, // int (0 = as high as possible)
    DisplaySpeed: 200, // int, px/s
    DisplayPause: 1000, // int, miliseconds of delay between finishing the animation, and starting the next
    DisplayPauseOnArrive: false, // true: start pause timer when head reaches the end of the animation segments // false: start pause timer when end of the tail reaches the end
    DisplayTrailLength: 60, // int, px length of the trail
    DisplaySquareOffArea: true, // bool, if displayDOM is not square, make it a square and center area
    DisplayStrokePadding: 30, // px of the displayField
    GestureCancelOnMouseLeave: true, // detect if mouse leaves the window and still use gestures if its outside the window (perhaps make it an enum scope {Element, Document, outside})

    
    /** TODO:
     * GestureConcelOnTooManyStrokes: true // true: if (MaxStrokes === 5 && drawnGesture.length === 6) cancel, false; if (MaxStrokes === 5 && drawnGesture.length === 6) use last 5 strokes
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
Gestures.GetList(): Gesture[] as int[][] // get all gestures // TODO

Gestures.SetDataStorage(instanceof DataStorage)

Gestures.SetGestureWindow(WINDOW|DOCUMENT|HTMLELEMENT)
Gestures.New()
Gestures.Save("name")
Gestures.Exists("name")
Gestures.Display("name")
Gestures.StopDisplaying()
Gestures.Forget("name")
Gestures.GestureExists(Gesture as int[])


```

```JS
// TODO:
// safely unset actionlistners if input/output doms are overridden
// use [this](https://stackoverflow.com/questions/11533098/how-to-catch-mouse-up-event-outside-of-element#answer-11533211) to detect mouseevents outside the page (look at the fiddle)
// an alternative to the drawing action (currently any mousebutton)
// an alternative to the action key that has to be pressed
// color transition displaying still has fragments (and goes to lighter color of original color, try colors: from #f00 to #333)
// would also like to go to transparent colors
// right now most code uses settings so when they live update they can break, check and save them as class properties when they do
// optional: save events to saved gestures
// think over what StopDisplaying should do and when
// think over if drawing module neest a sandbox drawing feedback state
// other contextmenu setting: contextmenuPrevention (could be an enum: always, possibleGesture, gesture, gestureAndCancel, never) prevents opening contextmenu depending on the situation (always,never are obvious, possible gesture is when any strokes have been made > 0, gesture is only when an available gesture has been drawn, gestureAndCancel is like gesture but also when amount of trokes are more than limit (dependant on setting: GestureConcelOnTooManyStrokes))
```