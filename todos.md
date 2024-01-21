

## Renderfacoty
  No token error for public...  https://quant-ux.com/#/examples/5a0cb67ee2fb533609d6fa7b/replay/S1517414873055_5240.html

# Collab
  - Adding templates causes issue. For some reason the templates are not added!

## Design Token
  - Export to adobe? https://www.adobe.com/products/xd/learn/design-systems/cloud-libraries/vscode-extension.html

## Labeled CheckBox and radio

## Analytic Cnavas
 - Make Task drop off chart?

## New Features
 - ScreenSegments as targets
 - Auto Width for widgets with text
 - select canvas color and line color

## Vector Editor
- check out Konvajs https://lavrton.com/case-study-image-labeling-for-machine-learning/
- edit exting shaped
- draw lines
- group & substract???

# Missed Click in analytic canbas

## Template to Cpmponents
 - Changes in the template root should be updated in all instances? We could get rid of the update button?
 - show in LayerList differen symbol. Mark also the source component!
    - flag the source component,.
    - changes to this widhet should be updated in the template
    - when copiying or creating, we should remove the flaf!

- All changes from this one should be copied to the other instances? Check Figma...
 - detach template. Make seperate section, could also host styles
 - grousp shoudl have actions

## Fast Render
- avoid toolbar selection on zoom
- create inhereited model is called to often.... in render and in modelChange in BaseController

## Dash
 - Improve Questionaire statitics
  - sortable table?
  - add some charts???
 - delet session

## Real Time Collaboration
 - https://ckeditor.com/blog/Lessons-learned-from-creating-a-rich-text-editor-with-real-time-collaboration/
 - https://github.com/websockets/ws
 - https://github.com/automerge/automerge

## Bugs
 - selection bug after remove: Create welcome mat group and remove
 - Sometimes screen ruler undo doe snot work... dunno why

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