import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'

test('Test CommandStack > pop ', async () => {

    const [controller, model] = TestUtil.createController(commandStackApp)

    controller.addWidget ({'name': `Widget1`}, {x: 1, y: 1, w: 10, h:10})
    controller.addWidget ({'name': `Widget1`}, {x: 1, y: 1, w: 10, h:10})
    controller.addWidget ({'name': `Widget1`}, {x: 1, y: 1, w: 10, h:10})

    
    let commandStack = controller.commandStack
    expect(commandStack.pos).toBe(3)
    expect(commandStack.stack.length).toBe(3)

    controller.undo()

    commandStack = controller.commandStack
    expect(commandStack.pos).toBe(2)
    expect(commandStack.stack.length).toBe(3)

  
    controller.undo()
    commandStack = controller.commandStack
    expect(commandStack.pos).toBe(1)
    expect(commandStack.stack.length).toBe(3)

    controller.addWidget ({'name': `Widget2`}, {x: 1, y: 1, w: 10, h:10})
    commandStack = controller.commandStack
    expect(commandStack.pos).toBe(2)
    expect(commandStack.stack.length).toBe(2)
    
})