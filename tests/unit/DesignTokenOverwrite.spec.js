import app from './data/designSystemOverwrite.json'
import * as TestUtil from './TestUtil'

const id = 'w10002_45284'

test('DesignToken > setting background removes the linked token', () => {
    const [controller, model] = TestUtil.createController(app)
    expect(model.widgets[id].designtokens.style.background).toBe('dt10001_37609')

    controller.updateWidgetProperties(id, {background: '#ff0000'}, 'style')

    expect(model.widgets[id].style.background).toBe('#ff0000')
    expect(model.widgets[id].designtokens).toBeUndefined()
})

test('DesignToken > other props keep the token', () => {
    const [controller, model] = TestUtil.createController(app)

    controller.updateWidgetProperties(id, {fontSize: 20}, 'style')

    expect(model.widgets[id].designtokens.style.background).toBe('dt10001_37609')
})

test('DesignToken > setting color removes the color token only', () => {
    const [controller, model] = TestUtil.createController(app)
    model.widgets[id].designtokens.style.color = 'dt_color'

    controller.updateWidgetProperties(id, {color: '#00ff00'}, 'style')

    expect(model.widgets[id].designtokens.style.color).toBeUndefined()
    expect(model.widgets[id].designtokens.style.background).toBe('dt10001_37609')
})
