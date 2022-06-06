import ScriptAPI from '../../src/core/engines/ScriptAPI'

test('Test ScriptAPI() >  Roundtrip', async () => {

    let app = {
        "version": 2.1,
        "screens": {
            's1': {
                id: 's1',
                name: 'a',
                style: {
                    background: '#fff'
                },
                children: ['w1']
            }
        },
        "widgets": {
            'w1': {
                id: 'w1',
                name: 'b',
                style: {
                    background: 'red'
                }
            }
        },
        "groups": {},
        "templates": {}
    }
    const viewModel = {}
    const api = new ScriptAPI(app, viewModel)
    const screenA = api.getScreen('a')
    expect(screenA).not.toBeUndefined()
    expect(screenA.getName()).toBe('a')
   

    const widgetB = screenA.getWidget('b')
    expect(widgetB).not.toBeUndefined()
    expect(widgetB.getName()).toBe('b')


    screenA.setStyle({'background': 'black'})

    const deltas = api.getAppDeltas()
    expect(deltas.length).toBe(1)
    expect(deltas[0].type).toBe('Screen')
    expect(deltas[0].id).toBe('s1')
    expect(deltas[0].style.background).toBe('black')

    
})