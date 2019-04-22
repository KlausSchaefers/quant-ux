import topic from '../../src/dojo/topic'

describe('Test Dojo Helper classes', () => {
  it('dojo/topic', () => {
    let counter1 = 0
    let counter2 = 0
    let listener1 = topic.on('t1', x => {
        console.debug('counter1 ', x)
        counter1 += x
    })
    let listener2 = topic.on('t1', x => {
        counter2 += x * 2
    })
    expect(listener1.id).toBe(0)
    expect(listener2.id).toBe(1)
    topic.publish('t1', 1)
    topic.publish('t1', 2)
    topic.publish('t2', 2)
    expect(counter1).toBe(3)
    expect(counter2).toBe(6)
    listener1.remove()

    topic.publish('t1', 3)
    expect(counter1).toBe(3)
    expect(counter2).toBe(12)
  })
})
