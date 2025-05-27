import app from './data/gridContainerChange.json'
import * as TestUtil from './TestUtil'


test('Test GridContainerChange.spec >  change props', async () => {

    const [controller, model] = TestUtil.createController(app)
    
    controller.updateWidgetProperties('w10032_42448', {paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10}, 'style')
    

})