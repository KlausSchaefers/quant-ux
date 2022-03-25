import ModelUtil from '../../src/core/ModelUtil'

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
