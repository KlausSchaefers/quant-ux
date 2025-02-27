import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'


test('Test CommandStack >  changeStack() - add', async () => {

    const [controller, model] = TestUtil.createController(commandStackApp)
    const commandChangeStack = controller.commandChangeStack

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(0)

    // we can't un/redo anything
    expect(controller.redoChangeStack()).toBe(false)
    expect(controller.undoChangeStack()).toBe(false)

    const wA = controller.addWidget ({'name': `WidgetA`}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(1)

    const wB = controller.addWidget ({'name': `WidgetB`}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(2)

    // we can\t redo anything
    expect(controller.redoChangeStack()).toBe(false)

    // commandChangeStack.stack.forEach(s => {
    //     console.debug('model', s.changes)
    // })

    const lastUUID = model.lastUUID

    // FIXME: change to undo() later
    controller.undoChangeStack()
    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(2)

    expect(model.widgetCount).toBe(1)
    expect(model.screenCount).toBe(0)
    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).toBeUndefined()

    // last UUID is never updated
    expect(model.lastUUID).toBe(lastUUID)

    // undo will make widgetB reappear
    controller.redoChangeStack()
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(2)
    expect(model.widgets[wA.id]).not.toBeUndefined()
    expect(model.widgets[wB.id]).not.toBeUndefined()
    expect(model.widgetCount).toBe(2)
    expect(model.screenCount).toBe(0)


    console.debug('model', model.widgets)
  
})

