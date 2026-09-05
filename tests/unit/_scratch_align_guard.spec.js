import app from './data/treeIndex.json'
import * as TestUtil from './TestUtil'

test('scratch: alignWidgets() bails with an error when source contains a FlexContainer', () => {
    const [controller, model] = TestUtil.createController(app)

    const containerId = 'w10015_11776' // FlexContainer
    const before = { ...model.widgets[containerId] }

    let errorShown = null
    controller._canvas.showError = (msg) => { errorShown = msg }

    controller.alignWidgets('left', [containerId, 'w10016_64924'], [containerId])

    const after = model.widgets[containerId]
    console.log('errorShown', errorShown)
    console.log('unchanged?', before.x === after.x && before.y === after.y)
})

test('scratch: alignWidgets() still runs normally for plain widgets', () => {
    const [controller, model] = TestUtil.createController(app)

    let errorShown = null
    controller._canvas.showError = (msg) => { errorShown = msg }

    controller.alignWidgets('left', ['w10016_64924', 'w10017_84479'], ['w10010_43885'])

    console.log('errorShown', errorShown)
})
