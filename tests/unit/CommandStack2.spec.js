import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'


test('Test CommandStack >  changeStack() - add & delete ', async () => {

    const [controller, model] = TestUtil.createController(commandStackApp)
    const commandChangeStack = controller.commandChangeStack

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(0)


    const wA = controller.addWidget ({'name': `WidgetA`}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(1)

    const wB = controller.addWidget ({'name': `WidgetB`}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(2)


    controller.removeWidget(wB.id)
    expect(commandChangeStack.pos).toBe(2)
    expect(commandChangeStack.stack.length).toBe(3)
    expect(model.widgetCount).toBe(1)
    expect(model.screenCount).toBe(0)

    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()


    controller.undoChangeStack()
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(3)

    //console.debug('model', model.widgets)

    expect(model.widgetCount).toBe(2)
    expect(model.screenCount).toBe(0)
    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).not.toBeUndefined()

    // // last UUID is never updated
    // expect(model.lastUUID).toBe(lastUUID)

    controller.redoChangeStack()
    expect(commandChangeStack.pos).toBe(2)
    expect(commandChangeStack.stack.length).toBe(3)


    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()
    expect(model.widgetCount).toBe(1)
    expect(model.screenCount).toBe(0)  
})


// test('Test CommandStack >  shift() ', async () => {

//     const [controller, model] = TestUtil.createController(commandStackApp)
//     const stackMaxLength = controller.stackMaxLength
//     const stackElementToRemove = controller.stackElementToRemove
//     for (let i = 0; i < stackMaxLength; i++) {
//         controller.addWidget ({'name': `Widget${i}`}, {x: i, y: i, w: 10, h:10})
//     }
//     const commandStack = controller.commandStack
//     expect(commandStack.pos).toBe(stackMaxLength)
//     expect(commandStack.stack.length).toBe(stackMaxLength)

//     const commandChangeStack = controller.commandChangeStack
//     expect(commandChangeStack.pos).toBe(stackMaxLength)
//     expect(commandChangeStack.stack.length).toBe(stackMaxLength)


//     controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})
//     expect(commandStack.pos).toBe(stackMaxLength - stackElementToRemove + 1)
//     expect(commandStack.stack.length).toBe(stackMaxLength - stackElementToRemove + 1)


  
// })


// test('Test CommandStack >  shift2 ', async () => {

//     const [controller, model] = TestUtil.createController(commandStackApp)
//     const stackMaxLength = controller.stackMaxLength
//     const stackElementToRemove = controller.stackElementToRemove
//     for (let i = 0; i < stackMaxLength; i++) {
//         controller.addWidget ({'name': `Widget${i}`}, {x: i, y: i, w: 10, h:10})
//     }
//     await controller.undo()
//     await controller.undo()
//     await controller.undo()
    
//     const commandStack = controller.commandStack
//     expect(commandStack.pos).toBe(stackMaxLength-3)
//     expect(commandStack.stack.length).toBe(stackMaxLength)

//     // undo the undo
//     controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})
//     controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})
//     controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})

//     // create shift
//     controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})

//     expect(commandStack.pos).toBe(stackMaxLength - stackElementToRemove + 1)
//     expect(commandStack.stack.length).toBe(stackMaxLength - stackElementToRemove + 1)

  
// })