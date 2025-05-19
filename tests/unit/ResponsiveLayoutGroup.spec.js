
import * as TestUtil from './TestUtil'
import app from './data/groupResponsiveBug.json'
import app2 from './data/groupResponsiveBug2.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import ModelGeom from '../../src/core/ModelGeom'


// test('ResponsiveLayout.js - testTree', async () => {

//     let rl = new ResponsiveLayout()

//     let selectedGroup = app.groups['g10012_51085']

//     let resizeModel = ModelGeom.getBoundingBox(selectedGroup, app);
//     // need to get all sub sets
//     resizeModel.children = ['w10013_18949', 'w10017_10872', 'w10016_34482'];

//     rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
//     let scrn = rl.treeModel.screens[0]
//     console.debug(TestUtil.printTree(scrn))
  
// })


// test('ResponsiveLayout.js - testTree 2', async () => {

//     let rl = new ResponsiveLayout()

//     let selectedGroup = app.groups['g10026_50652']

//     let resizeModel = ModelGeom.getBoundingBox(selectedGroup, app);
//     // need to get all sub sets
//     resizeModel.children = ['w10022_43863', 'w10024_81652', 'w10023_56730'];

//     rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
//     let scrn = rl.treeModel.screens[0]
//     console.debug(TestUtil.printTree(scrn))
  
// })


test('ResponsiveLayout.js - testTree 3', async () => {

    let rl = new ResponsiveLayout(1)

    let selectedGroup = app2.groups['g10090_55556']
    console.debug(selectedGroup)

    let resizeModel = ModelGeom.getBoundingBox(selectedGroup, app2);
    // need to get all sub sets
    resizeModel.children = selectedGroup.children

    rl.initSelection(app2, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
    let back = TestUtil.findOneElementsByName(scrn, 'Background')
    let fixed = back.grid.rows.map((r, i) => {
        return r.fixed
    }).join(',')
    expect(fixed).toBe('false,true,false,true,true,false,true,true,false')
})

test('ResponsiveLayout.js - testTree 4', async () => {

    let rl = new ResponsiveLayout(1)

    let selectedGroup = app2.groups['g10096_53770']
    console.debug(selectedGroup)

    let resizeModel = ModelGeom.getBoundingBox(selectedGroup, app2);
    // need to get all sub sets
    resizeModel.children = selectedGroup.children

    rl.initSelection(app2, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
    let back = TestUtil.findOneElementsByName(scrn, 'Background')
    console.debug(TestUtil.printTree(scrn, x => x.grid))

    let fixed = back.grid.rows.map((r, i) => {
        return r.fixed
    }).join(',')
    expect(fixed).toBe('true,true,false,true,true,false,true,true,false')
    
 

  
})

