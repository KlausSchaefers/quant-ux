import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'


test('Test CommandStack >  changeStack() delete ', async () => {

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

    const wC = controller.addWidget ({'name': `WidgetC`}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(2)
    expect(commandChangeStack.stack.length).toBe(3)
    expect(model.widgetCount).toBe(3)
    expect(model.screenCount).toBe(0)

    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).not.toBeUndefined()
    expect(model.widgets[wC.id]).not.toBeUndefined()

    console.debug('1', model)

    controller.undoChangeStack()
    controller.undoChangeStack()

    console.debug('2', JSON.stringify(commandChangeStack, null, 2))

    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(3)
    expect(model.widgetCount).toBe(1)
    expect(model.screenCount).toBe(0)
    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()
    expect(model.widgets[wC.id]).toBeUndefined()

    controller.undoChangeStack()
    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(3)
    expect(model.widgets[wA.id]).toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()
    expect(model.widgets[wC.id]).toBeUndefined()

    controller.redoChangeStack()
    controller.redoChangeStack()
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(3)
    expect(model.widgetCount).toBe(2)
    expect(model.screenCount).toBe(0)
    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).not.toBeUndefined()
    expect(model.widgets[wC.id]).toBeUndefined()


    controller.undoChangeStack()
    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(3)
    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()
    expect(model.widgets[wC.id]).toBeUndefined()


    // here we will discard history
    const wD = controller.addWidget ({'name': `WidgetD`}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(2)

    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()
    expect(model.widgets[wC.id]).toBeUndefined()
    expect(model.widgets[wD.id]).not.toBeUndefined()
    //expect

    expect(controller.redoChangeStack()).toBe(false)

    // // // last UUID is never updated
    // // expect(model.lastUUID).toBe(lastUUID)

    // controller.redoChangeStack()
    // expect(commandChangeStack.pos).toBe(2)
    // expect(commandChangeStack.stack.length).toBe(3)


    // expect(model.widgets[wA.id]).not.toBeUndefined()
    // expect(model.widgets[wB.id]).toBeUndefined()
    // expect(model.widgetCount).toBe(1)
    // expect(model.screenCount).toBe(0)

  
})