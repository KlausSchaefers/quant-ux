import CommandStack from '../../src/svg/CommandStack'

test('Test SVGCommandStack >  ', async () => {

    const stack = new CommandStack()
    stack.push({'id': 'a'})
    stack.push({'id': 'b'})
    stack.push({'id': 'c'})
    expect(stack.pos).toBe(2)
    expect(stack.hasUndo()).toBe(true)
    expect(stack.hasRedo()).toBe(false)

    const b = stack.undo()
    expect(stack.pos).toBe(1)
    expect(b.id).toBe('b')
    expect(stack.hasUndo()).toBe(true)
    expect(stack.hasRedo()).toBe(true)

    const a = stack.undo()
    expect(stack.pos).toBe(0)
    expect(a.id).toBe('a')
    expect(stack.hasUndo()).toBe(false)
    expect(stack.hasRedo()).toBe(true)


    const b1 = stack.redo()
    expect(stack.pos).toBe(1)
    expect(b1.id).toBe('b')
    expect(stack.hasUndo()).toBe(true)
    expect(stack.hasRedo()).toBe(true)

    const c1 = stack.redo()
    expect(stack.pos).toBe(2)
    expect(c1.id).toBe('c')
    expect(stack.hasUndo()).toBe(true)
    expect(stack.hasRedo()).toBe(false)


    stack.undo()
    expect(stack.pos).toBe(1)

    stack.push({id: 'd'})
    expect(stack.pos).toBe(2)
    expect(stack.stack.length).toBe(3)
    expect(stack.get(0).id).toBe('a')
    expect(stack.get(1).id).toBe('b')
    expect(stack.get(2).id).toBe('d')
    expect(stack.hasUndo()).toBe(true)
    expect(stack.hasRedo()).toBe(false)

    const b2 = stack.undo()
    expect(b2.id).toBe('b')
    expect(stack.pos).toBe(1)
    expect(stack.stack.length).toBe(3)
    expect(stack.hasUndo()).toBe(true)
    expect(stack.hasRedo()).toBe(true)
})