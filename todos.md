# ToDo & ideas


- SVG editing capabilities

- Low Code components for Flutter, Angular, React (Similar to https://github.com/KlausSchaefers/vue-low-code)

- Improved user task management during test

- Ai to predict click and mouse heat maps or other UX KPIs based on the visual design.

- DesignSystem like in figma with sahred styles

- Make easier task recording!

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
    - space handler ()
    - child color updates (x)
 - copy paste (started, seems ok)
 - remove onWidgetPositionCHange ()
    - repeater will rerender all the stuff..
 - themes adding (X)
 - group move (X)
 - master screens (X)
 - comments
 - moveToScreen
 - properties live update (X)
 - analytic canvas (X)
   - clean up (X)
   - graph & clean up (X)
 - share canvas (X)
   - padd inherited model
  - upload (X)
 - undo screen does not update grid (x)

## New Toolbar
- design systsme
 - detach template. Make seperate section, could also host styles

## Bugs
  - REST Name
  - Fixed Element in group overflows seelction when resized. (http://localhost:8080/#/apps/6032e683295894053a555d3e/create.html)


## Nice to have
  - Improve render factory so we pass the scale as paramter to createWidgetHTML()
  - improve grid crispyness. Maybe render in higher resolution and shring backgroudnSize?
  - multi screen selection.
  - Selection of screens only on label or layer
  - Implement partial rendering to clean up DND and Resize End code
  - grid and ruler could use zoom to decide of to ceil or floor the labels
  - Filter mouse wheel events to prevent jumping back and forth and adopt snapp point acoording to grid (at leats50, 75, 100, 150, 200, 250, 300)
  - GridAndRuler should in case of Grid calculate the real position (distance and label)
  - Grid and ruler could somehow get snapp positon also from source model ()