import { mount } from '@vue/test-utils'
import BoxSize from '@/canvas/toolbar/components/BoxSize.vue'

// sanitize-html ships ESM that jest does not transform
jest.mock('sanitize-html', () => (html) => html)

const model = {
  screens: { s1: { id: 's1', x: 0, y: 0, w: 400, h: 800, children: ['w1'] } },
  widgets: { w1: { id: 'w1', x: 10, y: 10, w: 100, h: 50 } }
}

function iconClasses (wrapper) {
  return wrapper.find('.MatcQIconSVG').classes()
}

describe('BoxSize keep aspect ratio', () => {
  test('the link icon shows the linked state', async () => {
    const wrapper = mount(BoxSize)
    wrapper.vm.setModel(model)
    wrapper.vm.setValue(model.widgets.w1)
    await wrapper.vm.$nextTick()

    // not linked by default: the broken link icon
    expect(wrapper.vm.isLinked).toBe(false)
    expect(iconClasses(wrapper)).toContain('LinkOff')

    // linked after a click: the link icon
    await wrapper.find('.MatcQIcon').trigger('click')
    expect(wrapper.vm.isLinked).toBe(true)
    expect(iconClasses(wrapper)).toContain('Link')
    expect(iconClasses(wrapper)).not.toContain('LinkOff')
  })
})
