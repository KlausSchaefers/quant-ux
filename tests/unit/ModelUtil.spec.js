import ModelUtil from '../../src/core/ModelUtil'

test('Test ModelUtil.scaleToSelection() >  ', async () => {
    const result = ModelUtil.scaleToSelection({w:100, h: 200, x:1000, y:1000}, {w:200, h: 200}, 'RightDown')
    expect(result.w).toBe(200)
    expect(result.h).toBe(400)


    const result2 = ModelUtil.scaleToSelection({w:200, h: 100, x:1000, y:1000}, {w:100, h: 200}, 'LeftUp')
    expect(result2.h).toBe(50)
    expect(result2.w).toBe(100)


    const result3 = ModelUtil.scaleToSelection({w:200, h: 100, x:1000, y:1000}, {w:100, h: 200}, 'South')
    expect(result3.h).toBe(200)
    expect(result3.w).toBe(400)

    const result4 = ModelUtil.scaleToSelection({w:200, h: 100, x:1000, y:1000}, {w:100, h: 200}, 'North')
    expect(result4.h).toBe(200)
    expect(result4.w).toBe(400)
})

test('Test ModelUtil.scaleToSelectionWidthOrHeight() >  ', async () => {
    const result = ModelUtil.scaleToSelectionWidthOrHeight({w:100, h: 200, x:1000, y:1000}, {w:200, h: 200}, 'South')
    expect(result.w).toBe(200)
    expect(result.h).toBe(400)


    const result2 = ModelUtil.scaleToSelectionWidthOrHeight({w:200, h: 100, x:1000, y:1000}, {w:100, h: 200, snapp:{type: 'RightDown'}}, 'RightDown')
    expect(result2.h).toBe(200)
    expect(result2.w).toBe(400)
})

test('Test ModelUtil.getViewModeStyle() >  No Template', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    let widget = {
        style: {a:4, b:5, c:6},
        hover: {}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'style')

    expect(style.a).toBe(4)
    expect(style.b).toBe(5)
    expect(style.c).toBe(6)
})

test('Test ModelUtil.getViewModeStyle() >  Template', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    let widget = {
        template: 't1',
        style: {},
        hover: {}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'style')

    expect(style.a).toBe(1)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)
})

test('Test ModelUtil.getViewModeStyle() >  Template:hover', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    let widget = {
        template: 't1',
        style: {},
        hover: {}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'hover')

    expect(style.a).toBe(11)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)
})

test('Test ModelUtil.getViewModeStyle() >  Template Overwrite', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    let widget = {
        template: 't1',
        style: {a:111},
        hover: {}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'style')

    expect(style.a).toBe(111)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)
})


test('Test ModelUtil.getViewModeStyle() >  Template:Hover Overwrite', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    let widget = {
        template: 't1',
        style: {a:111},
        hover: {c:333}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'hover')

    expect(style.a).toBe(11)
    expect(style.b).toBe(2)
    expect(style.c).toBe(333)
})

test('Test ModelUtil.getViewModeStyle() >  Template:Hover Bug', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    let widget = {
        template: 't1',
        style: {a:111}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'hover')

    expect(style.a).toBe(11)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)
})

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


test('Test ModelUtil.getMergedTemplate() > No Variant', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11, b:22},
                error: {c:33}
            },
            't2': {
                variantOf: 't1',
                style: {a:4},
                hover: {a:111},
                error: {a:1111, c:333}
            }
        }
    }

    const template = ModelUtil.getMergedTemplate('t1', app)
    const style = template.style
    expect(style.a).toBe(1)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)

    const hover = template.hover
    expect(hover.a).toBe(11)
    expect(hover.b).toBe(22)

    const error = template.error
    expect(error.a).toBeUndefined()
    expect(error.c).toBe(33)
})


test('Test ModelUtil.getMergedTemplate() > variant', async () => {



    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11, b:22},
                error: {c:33}
            },
            't2': {
                variantOf: 't1',
                style: {a:4},
                hover: {a:111},
                error: {a:1111, c:333}
            }
        }
    }

    const template = ModelUtil.getMergedTemplate('t2', app)
    const style = template.style
    expect(style.a).toBe(4)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)

    const hover = template.hover
    expect(hover.a).toBe(111)
    expect(hover.b).toBe(22)

    const error = template.error
    expect(error.a).toBe(1111)
    expect(error.c).toBe(333)
})



test('Test ModelUtil.getViewModeStyle() > variant no overwrites', async () => {



    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11, b:22}
            },
            't2': {
                variantOf: 't1',
                style: {a:4},
                hover: {a:111}
            }
        }
    }
    let widget = {
        template: 't2',
        style: {},
        hover: {}
    }
    const style = ModelUtil.getViewModeStyle(widget, app, 'style')
    expect(style.a).toBe(4)
    expect(style.b).toBe(2)
    expect(style.c).toBe(3)

    const hover = ModelUtil.getViewModeStyle(widget, app, 'hover')
    expect(hover.a).toBe(111)
    expect(hover.b).toBe(22)
})

