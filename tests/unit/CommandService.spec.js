// import commandStackApp from './data/commandStackApp.json'
// import * as TestUtil from './TestUtil'
// import * as SchemaUtil from '../../src/core/SchemaUtil'
import CommandService from './mocks/MockCommandService'

test('Test CommandStack > test pruneStacks()  ', async () => {

    const stacks = {
        "e": {
            appID: 'e',
            modified: 5
        },
        "c": {
            appID: 'c',
            modified: 3
        }, 
        "a": {
            appID: 'a',
            modified: 1
        },       
        "d": {
            appID: 'd',
            modified: 4
        },
        "b": {
            appID: 'b',
            modified: 2
        }
    }
  
    const cmds = new CommandService()

    let res = cmds.pruneStacks(structuredClone(stacks))
    expect(res['e']).toBeDefined()
    expect(res['d']).toBeDefined()
    
    expect(res['a']).toBeUndefined()
    expect(res['b']).toBeUndefined()
    expect(res['c']).toBeUndefined()


    res = cmds.pruneStacks(structuredClone(stacks), 4)
    expect(res['e']).toBeDefined()
    expect(res['d']).toBeDefined()
    expect(res['b']).toBeDefined()
    expect(res['c']).toBeDefined()

    expect(res['a']).toBeUndefined()

})