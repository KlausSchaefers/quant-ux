
import * as TestUtil from './TestUtil'
import bigApp from './data/bigApp.json'


test('BigApp', async () => {
   
    const model = bigApp
    Object.values(model.screens).forEach(b => {
        if (b.props.label) {
            b.props.label = 'Screen'
        }
        b.name = 'S'
    })

    Object.values(model.widgets).forEach(b => {
        if (b.props.label) {
            b.props.label = 'ABC'
        }
        b.name = 'W'
    })

 
})