
import * as TestUtil from './TestUtil'
import app from './data/groupResponsiveBug.json'
import * as Quant2Flat from '../../src/core/responsive/Quant2Flat'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import ModelGeom from '../../src/core/ModelGeom'


test('ResponsiveLayout.js - testTree', async () => {

    let rl = new ResponsiveLayout()

    let selectedGroup = app.groups['g10012_51085']

    let resizeModel = ModelGeom.getBoundingBox(selectedGroup, app);
    // need to get all sub sets
    resizeModel.children = ['w10013_18949', 'w10017_10872', 'w10016_34482'];

    rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
    console.debug(TestUtil.printTree(scrn))
  
})


test('ResponsiveLayout.js - testTree 2', async () => {

    let rl = new ResponsiveLayout()

    let selectedGroup = app.groups['g10026_50652']

    let resizeModel = ModelGeom.getBoundingBox(selectedGroup, app);
    // need to get all sub sets
    resizeModel.children = ['w10022_43863', 'w10024_81652', 'w10023_56730'];

    rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
    console.debug(TestUtil.printTree(scrn))
  
})


