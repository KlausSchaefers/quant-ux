
# MUST HAVE before shipping 4.0
- Show tasks in test
- Check why broken server does not give errors
- Nicer Gradients
  - make sliders on top
    - make gradient picker sketch...
- color token in picker?
- Improve Picture section as mutli line
- states should have data props
## Renderfacoty
  No token error for public...  https://quant-ux.com/#/examples/5a0cb67ee2fb533609d6fa7b/replay/S1517414873055_5240.html


## Deisgn Token
  - Export to adobe? https://www.adobe.com/products/xd/learn/design-systems/cloud-libraries/vscode-extension.html


## Labeled CheckBox and radio

# Nice to have
 -Make scrolling smooth snapp to 100
## Analytic Cnavas
 - Make Task drop off chart?

## New Features
 - ScreenSegments as targets
 - Auto Width for widgets with text
 - select canvas color and line color

## Vector Editor
- edit exting shaped
- draw lines
- group & substract???

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
 - Make Questionaire statitics
  - sortable table?
  - add some charts???
 - delet session

## Real Time Collaboration
 - https://ckeditor.com/blog/Lessons-learned-from-creating-a-rich-text-editor-with-real-time-collaboration/
 - https://github.com/websockets/ws
 - https://github.com/automerge/automerge

## Bugs
 - selection bug after remove: Create welcome mat group and remove



















































  - Text Tool on click does not work if last widget was an designtoken?
  - Screen rename not updates after yooming
  - Fix Downlaod dialog jumping....
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