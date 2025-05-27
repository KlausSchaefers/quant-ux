import * as TestUtil from './TestUtil'
import app from './data/gridContainerBug.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import ModelGeom from '../../src/core/ModelGeom'
import ModelUtil from '../../src/core/ModelUtil'


test('GridContainerResizeBug.spec.js - Zoom 1', async () => {
    assertResize(1)
})

test('GridContainerResizeBug.spec.js - Zoom 0.5', async () => {
    assertResize(0.5)
})

function assertResize(zoom) {
    const cntrID = 'w10063_47872'
    const childUp = 'w10064_56205'
    const childDown = 'w10065_98555'
    const selection = [cntrID, childUp, childDown]

    const scalledApp = ModelUtil.createScalledModelFast(app, zoom)

    const rl = new ResponsiveLayout(zoom)

    const resizeModel = ModelGeom.getBoundingBox(selection, scalledApp);
    resizeModel.children = selection

    rl.initSelection(scalledApp, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
   // console.debug(TestUtil.printTree(scrn))

    let cntr = TestUtil.findOneElementsByName(scrn, 'GridContainer')
    expect(cntr.grid).not.toBeFalsy()
    expect(cntr.grid).not.toBeUndefined()
    // console.debug(cntr.grid)    
    const positions = rl.resizePositions(Math.round(294 * zoom), Math.round(316 * zoom))
    console.debug(positions)

    expect(positions[childUp].h).toBe(Math.round(172 * zoom))
    expect(positions[childDown].h).toBe(Math.round(74 * zoom))
  
}

