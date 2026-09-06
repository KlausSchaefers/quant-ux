import app from './data/treeIndex.json'
import * as TestUtil from './TestUtil'

test('Test FlexContainerChange.spec > change flex props', async () => {

    const [controller, model] = TestUtil.createController(app)

    const before = {
        flex2: { ...model.widgets['w10016_64924'] },
        flex3: { ...model.widgets['w10017_84479'] }
    }

    controller.updateWidgetProperties('w10015_11776', { gap: 40 }, 'style')

    const after = {
        flex2: model.widgets['w10016_64924'],
        flex3: model.widgets['w10017_84479']
    }

    // the fixed child (Flex1Fixed) stays put, but the non-fixed siblings
    // must shift right to make room for the bigger gap
    expect(after.flex2.x).not.toBe(before.flex2.x)
    expect(after.flex3.x).not.toBe(before.flex3.x)
})
