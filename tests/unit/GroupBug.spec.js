
import * as TestUtil from './TestUtil'
import groupBug from './data/groupBug.json'

test('GroupBug.spec.js - add parent group for groups', async () => {
   
    const app = TestUtil.clone(groupBug)
    const [controller, model] = TestUtil.createController(app)

    const parentId = "g10041_54802"
    const selection = ["g10006_89643", "g10003_24976"]

    const newSubGroup = controller.addGroup(selection)
    console.debug(app.groups)
    console.debug(newSubGroup)

    expect(Object.values(model.groups).length).toBe(3)
    expect(newSubGroup.groups.length).toBe(2)

})


test('GroupBug.spec.js - add parent group for widgets', async () => {
   
    const app = TestUtil.clone(groupBug)
    const [controller, model] = TestUtil.createController(app)

    const parentId = "g10041_54802"
    const selection = ['w10001_72819', 'w10002_16888', 'w10004_3656', 'w10005_95567']

    const newSubGroup = controller.addGroup(selection)
    console.debug(app.groups)
    console.debug(newSubGroup)


    expect(Object.values(model.groups).length).toBe(3)
    expect(newSubGroup.groups.length).toBe(2)

})
