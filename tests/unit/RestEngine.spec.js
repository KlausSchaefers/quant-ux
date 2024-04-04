import RestEngine from '../../src/core/RestEngine'

test('Test RestEngine() >  fillSimpleString() > simple', async () => {
    const data = {
        'a': 'AA',
        'b': 'BB'
    }
    const template = 'This ${a} should be AA, and ${b} should be BB'
    const result = RestEngine.fillSimpleString(template, data)
    expect(result).toBe("This AA should be AA, and BB should be BB")
})


test('Test RestEngine() >  fillSimpleString() > simple 2', async () => {
    const data = {
        'a': 'AA',
        'b': 'BB',
        'c': 'CC'
    }
    const template = 'This ${a} should be AA, and ${b} should be BB'
    const result = RestEngine.fillSimpleString(template, data)
    expect(result).toBe("This AA should be AA, and BB should be BB")
})

test('Test RestEngine() >  fillSimpleString() > simple 3', async () => {
    const data = {
        'a': 'AA',
        'c': 'CC'
    }
    const template = 'This ${a} should be AA, and ${b} should be BB'
    const result = RestEngine.fillSimpleString(template, data)
    expect(result).toBe("This AA should be AA, and ${b} should be BB")
})

test('Test RestEngine() >  fillSimpleString() > nested', async () => {

    const data = {
        'a': '${b}',
        'b': 'BB'
    }

    const template = 'This ${a} should be AA, and ${b} should be BB'
    const result = RestEngine.fillSimpleString(template, data)
    expect(result).toBe("This ${b} should be AA, and BB should be BB")
})