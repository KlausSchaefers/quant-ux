
import * as TestUtil from './TestUtil'
import groupAdd from './data/groupAdd.json'
import groupAdd2 from './data/groupAdd2.json'

test('Grouo.js - Add group', async () => {
   
    const [controller] = TestUtil.createController(groupAdd)

    controller.addGroup([ "w10009_70595", "w10012_1340", "w10008_17582", "w10016_27970", "w10017_20112", "w10018_10954", "w10019_1716", "w10020_18756"])

    let model = controller.model
    expect(Object.values(model.groups).length).toBe(1)
    expect(Object.values(model.groups)[0].children.length).toBe(8)

    expectZ(model, 'Box1', 8)
    expectZ(model, 'Box2', 7)
    expectZ(model, 'Box3', 6)
    expectZ(model, 'Box4', 5)
    expectZ(model, 'Box5', 4)
    expectZ(model, 'Box6', 3)
    expectZ(model, 'Box7', 2)
    expectZ(model, 'Box8', 1)
   
    expectZ(model, 'Box9', 9)
})

test('Grouo.js - Add group 2', async () => {
   
    const [controller] = TestUtil.createController(groupAdd2)

    controller.addGroup([ "w10009_70595", "w10012_1340", "w10008_17582", "w10016_27970", "w10017_20112", "w10018_10954", "w10019_1716", "w10020_18756"])

    let model = controller.model
    expect(Object.values(model.groups).length).toBe(1)
    expect(Object.values(model.groups)[0].children.length).toBe(8)

    expectZ(model, 'Box1', 9)
    expectZ(model, 'Box2', 8)
    expectZ(model, 'Box3', 7)
    expectZ(model, 'Box4', 6)
    expectZ(model, 'Box5', 5)
    expectZ(model, 'Box6', 4)
    expectZ(model, 'Box7', 3)
    expectZ(model, 'Box8', 2)
   
    expectZ(model, 'Box9', 1)
})

function expectZ(model, name, expected) {
    let widget = Object.values(model.widgets).find(w => w.name === name)
    expect(widget).not.toBeNull()
    expect(widget.z).toBe(expected)
}
