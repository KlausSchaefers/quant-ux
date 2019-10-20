import LayerUtil from 'core/LayerUtil'

describe('Test Group Stuff ', () => {
  it('test Add', () => {
    let result = LayerUtil.getNewZValuePositions('w1', ['w2'], {'w1': 3, 'w2': 2, 'w3': 1})
    expect(result['w2']).toBe(3)
    expect(result['w1']).toBe(2)
    expect(result['w3']).toBe(1)

   // move w2 above w3
    result = LayerUtil.getNewZValuePositions('w3', ['w2'], {'w1': 1, 'w2': 2, 'w3': 3, 'w4': 4, 'w5': 5 })
    expect(result['w1']).toBe(1)
    expect(result['w3']).toBe(2)
    expect(result['w2']).toBe(3)
    expect(result['w4']).toBe(4)
    expect(result['w5']).toBe(5)

    // move group [w3, w2] above w4
    result = LayerUtil.getNewZValuePositions('w4', ['w3', 'w2'], {'w1': 1, 'w2': 2, 'w3': 3, 'w4': 4, 'w5': 5 }, true)
    expect(result['w1']).toBe(1)
    expect(result['w4']).toBe(2)
    expect(result['w2']).toBe(3)
    expect(result['w3']).toBe(4)
    expect(result['w5']).toBe(5)

    // move group [w3, w2] above w4, make sure oder does not matter
    result = LayerUtil.getNewZValuePositions('w4', ['w2', 'w3'], {'w1': 1, 'w2': 2, 'w3': 3, 'w4': 4, 'w5': 5 }, true)
    expect(result['w1']).toBe(1)
    expect(result['w4']).toBe(2)
    expect(result['w2']).toBe(3)
    expect(result['w3']).toBe(4)
    expect(result['w5']).toBe(5)



    // move cntr above box 4
    result = LayerUtil.getNewZValuePositions('box4', ['cntr'], {'cntr': 0, 'box1': 13, 'box2': 14, 'box3': 15, 'box4': 16})
    expect(result['cntr']).toBe(5)
    expect(result['box4']).toBe(4)
    expect(result['box3']).toBe(3)
    expect(result['box2']).toBe(2)
    expect(result['box1']).toBe(1)

    // move w3 backwards, to be above w1
    console.debug('-----------------------------------')
    result = LayerUtil.getNewZValuePositions('w1', ['w3'], {'w1': 1, 'w2': 2, 'w3': 3, 'w4': 4, 'w5': 5 }, true)
    console.debug(result)
    expect(result['w1']).toBe(1)
    expect(result['w3']).toBe(2)
    expect(result['w2']).toBe(3)
    expect(result['w4']).toBe(4)
    expect(result['w5']).toBe(5)
    

  })

})


