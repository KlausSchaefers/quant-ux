import app from './data/treeIndex.json'
import * as TestUtil from './TestUtil'

test('repro: multi-copy of plain (non-flex) widgets near original', () => {
    const [controller, model] = TestUtil.createController(app)

    const screen = Object.values(model.screens)[0]
    console.log('screen box', screen.x, screen.y, screen.w, screen.h)

    const plainIds = screen.children.filter(id => {
        const w = model.widgets[id]
        return w && w.type !== 'FlexContainer' && w.type !== 'GridContainer'
    }).slice(0, 3)
    console.log('plainIds', plainIds.map(id => [id, model.widgets[id].x, model.widgets[id].y]))

    const bbox = controller.getBoundingBox(plainIds)
    const pos = { x: bbox.x + 500, y: bbox.y + 500, w: bbox.w, h: bbox.h }
    const newIds = controller.onMultiCopyWidget(plainIds, pos)
    console.log('newIds', newIds.map(id => [id, model.widgets[id].x, model.widgets[id].y]))
    console.log('screen.children includes each newId:', newIds.map(id => [id, screen.children.includes(id)]))
})
