import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'

test('Test CommandStack >  changeStack() test compact ', async () => {

    const [controller, model, data] = TestUtil.createController(commandStackApp)

    const commandChangeStack = controller.commandChangeStack

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(0)

    for (let i = 0; i < 50; i++) {
        controller.addWidget ({'name': `WidgetA`, style: {background: "green"}, props:{}}, {x: 1, y: 1, w: 10, h:10})
    }

    expect(commandChangeStack.pos).toBe(24)
    expect(commandChangeStack.stack.length).toBe(25)
  
})