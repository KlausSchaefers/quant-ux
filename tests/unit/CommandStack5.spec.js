import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'


test('Test CommandStack >  changeStack() delete ', async () => {

    const [controller, model] = TestUtil.createController(commandStackApp)
    const commandChangeStack = controller.commandChangeStack

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(0)


    const wA = controller.addWidget ({'name': `WidgetA`, style: {background: "green"}}, {x: 1, y: 1, w: 10, h:10})
    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(1)

    controller.updateWidgetProperties(wA.id, {'background': "red"}, "style")
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(2)
    expect(model.widgets[wA.id].style.background).toBe("red")

    controller.undoChangeStack()
    expect(model.widgets[wA.id].style.background).toBe("green")
    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(2)

    controller.redoChangeStack()
    expect(model.widgets[wA.id].style.background).toBe("red")
    expect(commandChangeStack.pos).toBe(1)
    expect(commandChangeStack.stack.length).toBe(2)

  
})