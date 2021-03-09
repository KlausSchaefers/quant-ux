# ToDo & ideas


- SVG editing capabilities

- Low Code components for Flutter, Angular, React (Similar to https://github.com/KlausSchaefers/vue-low-code)

- Improved user task management during test

- Ai to predict click and mouse heat maps or other UX KPIs based on the visual design.

- DesignSystem like in figma with sahred styles

- Make easier task recording!


## New Toolbar
- prototype view
  - after link is added select widget
- Layerlist shoul dbe one big tree... also selecting a screen should
- Actions could have ScreenContaoner as target!
- LayerList open should have effect on Scroll
## Design Token
- Make model better with specila keys like _color, _background and a flag

- Toggle Widgets
  - Background
  - text
  - boder (both)
  - shadpow
  - padding

- Show List
- unlink
- link
- templates

 - live update when changing?
 - How to show?
  - Color -> have special popup
  - Text hide block and show name


## Template to Cpmponents
 - show in LayerList differen symbol. Mark also the source component!
  - All changes from this one should be copied to the other instances? Check Figma...
 - detach template. Make seperate section, could also host styles
 - grousp shoudl have actions

## Labeled CheckBox and radio

## SVG Widgets
## Vector Editor

## Bugs
  - ESC closes all popups, but triggers flush of temp values. Is this really wanted?
 - _BaseConreoller.renderWidget() > make method to inline all templates and design tokens
 - Toolbar Pop jumps for Header in Qdate data xsectzion
 - remove onWidgetPositionCHange ()
    - repeater will rerender all the stuff..
  - Focxus will trigger screen transition
  - REST rename (caused bug in layerl listr)
  - Fixed Element in group overflows seelction when resized. (http://localhost:8080/#/apps/6032e683295894053a555d3e/create.html)


## CSS Render
 - dnd (x)
 - tools (x)
 - add (*)
 - grid (X)
 - Select resize (X)
 - screen resize (X)
 - lines also with reize and mvoe (X)
 - replicate (X)
 - distribute (X)
 - repeater
    - update on props (X)
    - space handler (removed)
    - child color updates (x)
 - copy paste (started, seems ok)

 - themes adding (X)
 - group move (X)
 - master screens (X)
 - comments (X)
 - moveToScreen
 - properties live update (X)
 - analytic canvas (X)
   - clean up (X)
   - graph & clean up (X)
 - share canvas (X)
   - padd inherited model
  - upload (X)
 - undo screen does not update grid (x)
 - updateDND should just resize
 - Zooming should not call toolbar selected ()!

## Pages

## Nice to have
  - remove canvas listener
  - Improve render factory so we pass the scale as paramter to createWidgetHTML()
  - improve grid crispyness. Maybe render in higher resolution and shring backgroudnSize?
  - multi screen selection.
  - Selection of screens only on label or layer
  - Implement partial rendering to clean up DND and Resize End code
  - grid and ruler could use zoom to decide of to ceil or floor the labels
  - Filter mouse wheel events to prevent jumping back and forth and adopt snapp point acoording to grid (at leats50, 75, 100, 150, 200, 250, 300)
  - GridAndRuler should in case of Grid calculate the real position (distance and label)
  - Grid and ruler could somehow get snapp positon also from source model ()