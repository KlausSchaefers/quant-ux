# Quant-UX File Format

The Quant-UX file format assumes an infinite canvas. All elements are positioned relative to the canvas.
The two main elements are **screens** (aka artboards) and **widgets**. They have x & y coordinates, a width (w) and height(h)
and in case of widgets also a z property. In addition there are **groups** and lines. The file format is **flat**,
there is no nesting of elements. References between elements, e.g. parent child relations, are maintained through ids. The basic structure looks as

```json
{
  "id" : "5fb68a97e2fb535abe58e70e",
  "version" : 2.1,
  "name" : "Grid Snapp",
  "description" : "",
  "screenSize" : {
    "w" : 1280,
    "h" : 720
  },
  "type" : "desktop",
  "screens" : {
    "s1": {...}
  },
  "widgets" : {
    "w1": {...}
  },
  "lines" : {
    "l1": {...}
  },
  "groups" : {
    "g1": {...}
  },
  "startScreen" : "",
  "grid" : {...}
}
```

For each prototype, the screen size and type is defined as well as information about the used grid system. This information is needed for the canvas
to function, but not for code generation. The **startScreen** property contains the id of the start screen.

## Screens
Screens are rectangles that are placed on the canvas. Screens maintain a **children** list with the ids of the contained elements. In addtion
screens have a **style** property which contains JavaScript kind of css key value pairs.

```json
  {
      "x" : 3202,
      "y" : 2202,
      "h" : 720,
      "w" : 1280,
      "name" : "Screen",
      "type" : "Screen",
      "style" : {
        "background" : "#ffffff",
        "overlay" : true
      },
      "has" : {
        "image" : true
      },
      "props" : {
        "start" : true
      },
      "children" : [ "w10009", "w10011", "w10002" ],
      "id" : "s10000"
    }
```


## Widgets

Widgets are rectangles that are placed on the canvas. Like screens, they have **style** and **props** objects.  The **props** object contains additional information that
are not related to the visual presentation. For instance the label or options. Some widgets support **hover**, **active** or **error** states. These state objects
contain JavaScript CSS key value pairs that differ from the style properties. The semantics are similar to CSS. An example for a simple rectangle looks like:

```json
{
      "id" : "w10002",
      "type" : "Button",
      "name" : "MyRectangle",
      "x" : 3650,
      "y" : 2458,
      "w" : 320,
      "h" : 384,
      "z" : 1,
      "props" : {
        "label" : "My Label"
      },
      "has" : {},
      "actions" : {
        "type" : "back"
      },
      "style" : {
        "fontSize" : 14,
        "fontFamily" : "Helvetica Neue,Helvetica,Arial,sans-serif",
        "textAlign" : "left",
        "letterSpacing" : 0,
        "lineHeight" : 1.4,
        "color" : "#ffffff",
        "borderTopRightRadius" : 0,
        "borderTopLeftRadius" : 0,
        "borderBottomRightRadius" : 0,
        "borderBottomLeftRadius" : 0,
        "borderTopWidth" : 0,
        "borderBottomWidth" : 0,
        "borderRightWidth" : 0,
        "borderLeftWidth" : 0,
        "borderTopColor" : "#333333",
        "borderBottomColor" : "#333333",
        "borderRightColor" : "#333333",
        "borderLeftColor" : "#333333",
        "background" : "#333333",
        "paddingTop" : 0,
        "paddingBottom" : 0,
        "paddingLeft" : 0,
        "paddingRight" : 0
      },
      "hover" : {
        "background" : "#872c2c"
      }

```

The **has** property contains canvas related information. The **actions** can contain a back action. The **type** defines which kind of widget should be rendered. Supported types are:

```json
supportedWidgetTypes = [
	"Button",
	"Box",
	"Label",
	"Container",
	"Icon",
	"Image",
	"CheckBox",
	"RadioBox",
	"RadioBox2",
	"HotSpot",
	"TextBox",
	"Password",
	"TextArea",
	"Repeater",
	"RadioGroup",
	"CheckBoxGroup",
	"ToggleButton",
	"Switch",
	"DropDown",
	"MobileDropDown",
	"Stepper",
	"HSlider",
	"Date",
	"DateDropDown",
	"SegmentButton",
	"Rating",
	"IconToggle",
	"LabeledIconToggle",
	"TypeAheadTextBox",
	"Table",
	"Paging",
	"BarChart",
	"PieChart",
	"MultiRingChart",
	"RingChart",
	"Vector",
	"Timeline",
	"Upload",
	"ChildrenToggle",
	"Camera",
	"UploadPreview",
	"Spinner"
]
```

Some of the widgets have non standard styles keys, e.g. 'selectedOptionColor'. The **props** object contains additional information that
are not related with the visual presentation, e.g. the label, a preselected value or options. A dropdown might look like:

```json
  {
      "id" : "w10012",
      "type" : "DropDown",
      "name" : "DropDown",
      "x" : 3330,
      "y" : 2266,
      "w" : 200,
      "h" : 40,
      "z" : 4,
      "props" : {
        "options" : [ "Option 1", "Option 2", "Option 3" ],
        "selected" : "Option 1"
      },
      "has" : {
        "onclick" : true,
        "border" : true,
        "backgroundColor" : true,
        "data" : true,
        "padding" : true,
        "label" : true
      },
      "style" : {
        "borderTopRightRadius" : 3,
        "borderTopLeftRadius" : 3,
        "borderBottomRightRadius" : 3,
        "borderBottomLeftRadius" : 3,
        "borderTopWidth" : 1,
        "borderBottomWidth" : 1,
        "borderRightWidth" : 1,
        "borderLeftWidth" : 1,
        "borderTopColor" : "#333333",
        "borderBottomColor" : "#333333",
        "borderRightColor" : "#333333",
        "borderLeftColor" : "#333333",
        "background" : "#ffffff",
        "popupBackground" : "#ffffff",
        "popupColor" : "#333333",
        "color" : "#333333",
        "fontSize" : 18,
        "fontFamily" : "Helvetica Neue,Helvetica,Arial,sans-serif",
        "textAlign" : "left",
        "paddingTop" : 5,
        "paddingBottom" : 5,
        "paddingLeft" : 6,
        "paddingRight" : 6,
        "selectedOptionColor" : "#333333",
        "selectedOptionBackground" : "#f2f2f2"
      },
      "created" : 1606342774840
    }
```

You can find detailed exampels in the [templates](https://github.com/KlausSchaefers/quant-ux/tree/master/src/themes/wireframe) folder for each of the widget types.

## Lines

A line is defined by its start (**from**) and end (**to**). In addition the trigger event is defined. The **points** property can be ignored. Please note that groups can be also referenced in the from node.

```json
{
      "id" : "l10014",
      "from" : "w10002",
      "to" : "s10013",
      "points" : [ ],
      "event" : "click"
    }
```

## Groups

Groups define a set of contained widgets by their **children** property. Groups can have subgroups, which a referenced by their IDs in the **groups** property.

```json
  {
      "id" : "g10015",
      "children" : [ "w10002", "w10009" ],
      "groups" : [ ],
      "name" : "Group"
    }
```

