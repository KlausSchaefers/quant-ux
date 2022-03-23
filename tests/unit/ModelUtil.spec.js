import ModelUtil from '../../src/core/ModelUtil'

test('Test ModelUtil.setMergedTemplateStyle() > unlink template ', async () => {


  let widget = {
      style: {
          a: 11,
      }
  }

  let template = {
    style: {
        a: 1,
        b: 2,
        c: 3
    },
    hover: {
        a: 4,
        b: 5,
        c: 6
    }
  }

  ModelUtil.setMergedTemplateStyle(widget, template, 'style')
  ModelUtil.setMergedTemplateStyle(widget, template, 'hover')
  expect(widget.style.a).toBe(11)
  expect(widget.style.b).toBe(2)
  expect(widget.hover.a).toBe(4)
})

test('Test ModelUtil.setStylesNotInTemplate() > relink template ', async () => {


    let widget = {
        style: {
            a: 11,
            b: 2,
            c: 3
        },
        hover: {
            a: 4,
            b: 5,
            c: 66
        }
    }
  
    let template = {
      style: {
          a: 1,
          b: 2,
          c: 3
      },
      hover: {
          a: 4,
          b: 5,
          c: 6
      }
    }
  
    ModelUtil.setStylesNotInTemplate(widget, template, 'style')
    ModelUtil.setStylesNotInTemplate(widget, template, 'hover')
    expect(widget.style.a).toBe(11)
    expect(widget.style.b).toBe(undefined)
    expect(widget.style.c).toBe(undefined)
    expect(widget.hover.a).toBe(undefined)
    expect(widget.hover.c).toBe(66)
})
