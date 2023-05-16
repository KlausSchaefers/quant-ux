import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'

test('Test CommandStack >  shift() ', async () => {

    const [controller, model] = TestUtil.createController(commandStackApp)
    const stackMaxLength = controller.stackMaxLength
    const stackElementToRemove = controller.stackElementToRemove
    for (let i = 0; i < stackMaxLength; i++) {
        controller.addWidget ({'name': `Widget${i}`}, {x: i, y: i, w: 10, h:10})
    }
    const commandStack = controller.commandStack
    expect(commandStack.pos).toBe(stackMaxLength)
    expect(commandStack.stack.length).toBe(stackMaxLength)


    controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})
    expect(commandStack.pos).toBe(stackMaxLength - stackElementToRemove + 1)
    expect(commandStack.stack.length).toBe(stackMaxLength - stackElementToRemove + 1)
  
})


test('Test CommandStack >  shift2 ', async () => {

    const [controller, model] = TestUtil.createController(commandStackApp)
    const stackMaxLength = controller.stackMaxLength
    const stackElementToRemove = controller.stackElementToRemove
    for (let i = 0; i < stackMaxLength; i++) {
        controller.addWidget ({'name': `Widget${i}`}, {x: i, y: i, w: 10, h:10})
    }
    controller.undo()
    controller.undo()
    controller.undo()
    
    const commandStack = controller.commandStack
    expect(commandStack.pos).toBe(stackMaxLength-3)
    expect(commandStack.stack.length).toBe(stackMaxLength)

    // undo the undo
    controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})
    controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})
    controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})

    // create shift
    controller.addWidget ({'name': `WidgetXXX`}, {x: 1000, y: 1000, w: 10, h:10})

    expect(commandStack.pos).toBe(stackMaxLength - stackElementToRemove + 1)
    expect(commandStack.stack.length).toBe(stackMaxLength - stackElementToRemove + 1)

  
})


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