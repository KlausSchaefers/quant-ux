
import * as TestUtil from './TestUtil'

test('GroupChildRemove.spec.spec.js - remove child group in group', async () => {

    let app = {
        version: 2.1,
        name: "ExportTest",
        screenSize: {
            w:100, h:100
        },
        screens: {
            "s1": {
                id: 's1',
               
                children: ['w1', 'w2', 'w3', 'w4']
            }
        },
        widgets: {
            'w1': {id: 'w1', z:1},
            'w2': {id: 'w2', z:2},
            'w3': {id: 'w3', z:3},
            'w4': {id: 'w4', z:4}
        },
        groups: {
            parent: {
                id: 'parent',
                children: ['w1', 'w2'],
                groups:['child']
            },
            child: {
                id: 'child',
                children: ['w3', 'w4']
            }
        },
        templates: {}
    }
   
    const [controller, model] = TestUtil.createController(app)
   
  
    controller.removeGroup('child')
    console.debug(model.groups)

    const parent = model.groups.parent
    expect(parent.groups.length).toBe(0)
    expect(parent.children.length).toBe(4)
    expect(parent.children).toEqual(expect.arrayContaining(['w1', 'w2', 'w3', 'w4']));
    expect(model.groups.child).toBeUndefined()

    controller.undo()
    console.debug(model.groups)

    const child = model.groups.child
    expect(child).not.toBeUndefined()
    expect(child.children).toEqual(expect.arrayContaining(['w3', 'w4']));

    expect(parent.groups.length).toBe(1)
    expect(parent.groups[0]).toBe('child')
    expect(parent.children.length).toBe(2)
    expect(parent.children).toEqual(expect.arrayContaining(['w1', 'w2']));
})


