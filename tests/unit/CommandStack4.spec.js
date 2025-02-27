import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'


test('Test CommandStack >  changeStack() - return false ', async () => {

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


    // 3x undo works
    expect(controller.undoChangeStack()).toBe(true)
    expect(controller.undoChangeStack()).toBe(true)
    expect(controller.undoChangeStack()).toBe(true)

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(3)

    expect(model.widgets[wA.id]).toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()
    expect(model.widgets[wC.id]).toBeUndefined()

    // undo on empty stack does not work
    expect(controller.undoChangeStack()).toBe(false)

    // we redo 3x
    expect(controller.redoChangeStack()).toBe(true)
    expect(controller.redoChangeStack()).toBe(true)
    expect(controller.redoChangeStack()).toBe(true)

    expect(commandChangeStack.pos).toBe(2)
    expect(commandChangeStack.stack.length).toBe(3)

    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).not.toBeUndefined()
    expect(model.widgets[wC.id]).not.toBeUndefined()
  
    // redo on end does not work
    expect(controller.redoChangeStack()).toBe(false)
})
