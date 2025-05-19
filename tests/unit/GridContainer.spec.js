import * as TestUtil from './TestUtil'
import app from './data/gridContainer.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import ModelGeom from '../../src/core/ModelGeom'

test('ResponsiveLayout.js - group', async () => {

    let rl = new ResponsiveLayout(1)


    let resizeModel = ModelGeom.getBoundingBox(["w10002_20409", "w10015_91723" ], app);
    // need to get all sub sets
    resizeModel.children = ["w10002_20409", "w10015_91723" ]

    rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
    let scrn = rl.treeModel.screens[0]
    console.debug(TestUtil.printTree(scrn))

    let cntr = TestUtil.findOneElementsByName(scrn, 'GridContainer')
    expect(cntr.grid).not.toBeFalsy()
    expect(cntr.grid).not.toBeUndefined()
    //console.debug(cntr.grid)
    
    let fixed = cntr.grid.columns.map((r, i) => {
        return r.fixed
    }).join(',')
    expect(fixed).toBe('true,false,true,false,true,false,true')
})

// test('ResponsiveLayout.js - multi', async () => {

//     let rl = new ResponsiveLayout()

//     let selectedGroup = app.groups['g10042_28527']
//     console.debug(selectedGroup)

//     let resizeModel = ModelGeom.getBoundingBox(selectedGroup.children, app);
//     // need to get all sub sets
//     resizeModel.children = selectedGroup.children

//     rl.initSelection(app, resizeModel, resizeModel.children, true, true, false)
    
//     let scrn = rl.treeModel.screens[0]
//     console.debug(TestUtil.printTree(scrn))
    
//     // let back = TestUtil.findOneElementsByName(scrn, 'Background')
//     // let fixed = back.grid.rows.map((r, i) => {
//     //     return r.fixed
//     // }).join(',')
//     // expect(fixed).toBe('false,true,false,true,true,false,true,true,false')
// })