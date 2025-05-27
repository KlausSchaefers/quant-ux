import * as TestUtil from './TestUtil'
import app from './data/gridContainerNested.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import ModelGeom from '../../src/core/ModelGeom'
import * as SnappUtil from '../../src/core/SnappUtil'


test('GridContainerNestedBug.spec.js - Zoom 1', async () => {
    assertResize(0, 100, 1)
    assertResize(100, 0, 1)
    assertResize(100, 200, 1)
})

function assertResize(offsetW, offsetH, zoom =1) {


    const selection = [ "ParentGrid", "ChildCntr", "ChildGrid", "Child2", "Child1", "PinnedBox" ]


    const rl = new ResponsiveLayout(zoom)

    const resizeModel = ModelGeom.getBoundingBox(selection, app);
    resizeModel.children = selection
  
    rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
    //console.debug(TestUtil.printTree(scrn, r => r.id))

    let parentGrid = TestUtil.findOneElementsByName(scrn, 'ParentGrid')
    expect(parentGrid.grid).not.toBeFalsy()
    expect(parentGrid.grid).not.toBeUndefined()
    
    let gridChild = TestUtil.findOneElementsByName(scrn, 'ChildGrid')
    expect(gridChild.grid).not.toBeFalsy()
    expect(gridChild.grid).not.toBeUndefined()


    // let child2 = TestUtil.findOneElementsByName(scrn, 'Child 2')
    // console.debug(child2.id)
    
    // // console.debug(cntr.grid)    
    const positions = rl.resizePositions(resizeModel.w + offsetW, resizeModel.h + offsetH)


    const childGrid = positions['ChildGrid']
    const child1 = positions['Child1']
    const child2 = positions['Child2']

    expect(isFullContained(childGrid, child2)).toBeTruthy()
    expect(isFullContained(childGrid, child1)).toBeTruthy()
}


function isFullContained(outer, inner) {
    // add here some offset?
    return (
        outer.x <= inner.x &&
        outer.y <= inner.y &&
        outer.x + outer.w >= inner.x + inner.w &&
        outer.y + outer.h >= inner.y + inner.h
    )
}
