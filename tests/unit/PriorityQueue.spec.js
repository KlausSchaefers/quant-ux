import PriorityQueue from '../../src/dash/PriorityQueue'


test('Test PriorityQueue > 1', async () => {

    const queue = new PriorityQueue()
    queue.push('d', 4)
    queue.push('a', 1)
    queue.push('b', 2)
    queue.push('e', 5)
    queue.push('c', 3)

    expect(queue.length()).toBe(5)

    let element = queue.pop()
    expect(element.element).toBe('a')
    expect(element.value).toBe(1)

    element = queue.pop()
    expect(element.element).toBe('b')
    expect(element.value).toBe(2)

    element = queue.pop()
    expect(element.element).toBe('c')
    expect(element.value).toBe(3)

    element = queue.pop()
    expect(element.element).toBe('d')
    expect(element.value).toBe(4)

    element = queue.pop()
    expect(element.element).toBe('e')
    expect(element.value).toBe(5)

    expect(queue.length()).toBe(0)
    expect(queue.empty()).toBe(true)
})


test('Test PriorityQueue > 2', async () => {

    const queue = new PriorityQueue()
    queue.push('d', 4)
    queue.push('a', 1)
    queue.push('b', 2)
    queue.push('e', 5)
    queue.push('c', 3)

    expect(queue.length()).toBe(5)

    let element = queue.pop()
    expect(element.element).toBe('a')
    expect(element.value).toBe(1)

    element = queue.pop()
    expect(element.element).toBe('b')
    expect(element.value).toBe(2)

    expect(queue.length()).toBe(3)
    expect(queue.empty()).toBe(false)

    queue.push('f', 6)
    queue.push('a', 1)

    expect(queue.length()).toBe(5)
    expect(queue.empty()).toBe(false)

    element = queue.pop()
    expect(element.element).toBe('a')
    expect(element.value).toBe(1)

    
    element = queue.pop()
    expect(element.element).toBe('c')
    expect(element.value).toBe(3)

    element = queue.pop()
    expect(element.element).toBe('d')
    expect(element.value).toBe(4)

    element = queue.pop()
    expect(element.element).toBe('e')
    expect(element.value).toBe(5)

    expect(queue.length()).toBe(1)
    expect(queue.empty()).toBe(false)

    element = queue.pop()
    expect(element.element).toBe('f')
    expect(element.value).toBe(6)

    expect(queue.length()).toBe(0)
    expect(queue.empty()).toBe(true)
})
