
import * as TestUtil from './TestUtil'
import lang from "../../src/dojo/_base/lang";
import subgroup from './data/subgroup.json'

test('Group.spec.js - add sub group', async () => {
   
    const [controller, model] = TestUtil.createController(TestUtil.clone(subgroup))

    const parentId = "g10041_54802"
    const selection = ["w10037_85005", "w10038_24151"]
    
    const newSubGroup = controller.addGroup(selection)
    expect(Object.values(model.groups).length).toBe(2)
    expect(newSubGroup.children.length).toBe(2)
    
    const parentGroup = model.groups[parentId]
   
    expect(parentGroup.groups.length).toBe(1)
    expect(parentGroup.children.length).toBe(2)
    selection.forEach(id => {
        expect(parentGroup.children.indexOf(id)).toBe(-1)
        expect(newSubGroup.children.indexOf(id)).toBeGreaterThan(-1)
    })

    controller.undo()

    expect(Object.values(model.groups).length).toBe(1)

    const parentGroup2 = model.groups[parentId]
   
 
    expect(parentGroup2.groups.length).toBe(0)
    expect(parentGroup2.children.length).toBe(4)
    selection.forEach(id => {
        expect(parentGroup.children.indexOf(id)).toBeGreaterThan(-1)
    })

})


test('Group.spec.js - add wrapper', async () => {
   
    const [controller, model] = TestUtil.createController(TestUtil.clone(subgroup))

    const parentId = "g10041_54802"
    const selection = ["w10037_85005", "w10038_24151", "w10039_33428", "w10040_50547", "w10049_20984"]
    
    const wrapperGroup = controller.addGroup(selection)
    expect(Object.values(model.groups).length).toBe(2)
    expect(wrapperGroup.children.length).toBe(1)
    expect(wrapperGroup.children[0]).toBe("w10049_20984")

    expect(wrapperGroup.groups.length).toBe(1)
    expect(wrapperGroup.groups[0]).toBe(parentId)


    controller.undo()
    expect(Object.values(model.groups).length).toBe(1)
    
   
})


