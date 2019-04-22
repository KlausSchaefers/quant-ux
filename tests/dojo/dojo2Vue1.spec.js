import * as dojo2Vue from '../../src/dojo/util/dojo2Vue.js'

const mapping = {
  replace: {
      'dojo/dom-class': 'dojo/css',
  },
  rewrite: {
    'de/vommond': 'common'
  },
  cut: ['de/vommond/matc/']
}

describe('HelloWorld.vue', () => {
  it('dojo2Vue parse() Test 1', () => {
    let result = dojo2Vue.parse(process.cwd(),  'tests/data/Test.dojo')
    expect(result.globals.length).toBe(2);
    expect(result.privates.length).toBe(3);
    expect(result.mixins.length).toBe(2);
    expect(result.imports.length).toBe(2);
    expect(result.template.length).toBe(4);
    expect(result.body.length).toBe(13);
    expect(result.path).toBe('tests/data')
    expect(result.name).toBe('Test.dojo')
  })

  it('dojo2Vue convert() Test Single VUE', () => {
    let widget = dojo2Vue.convert(process.cwd() ,'./tests/data/Test.dojo', {})
    expect(widget.result.length).toBeGreaterThan(0)
  })

  it('dojo2Vue convert() Test Single 2 VUE', () => {
    let widget = dojo2Vue.convert(process.cwd() ,'./tests/data/Test3.dojo', {})
    expect(widget.result.length).toBeGreaterThan(0)
    expect(widget.imports.length).toBe(19)
    expect(widget.privates.length).toBe(7)
  })

  it('dojo2Vue convert() Test Single JS', () => {
    let widget = dojo2Vue.convert(process.cwd(), './tests/data/Test2.dojo', {})
    expect(widget.result.length).toBeGreaterThan(0)
    // console.debug(result)
  })

  it('dojo2Vue rewriteImport()', () => {
    let result = dojo2Vue.rewriteImport('de/vommond/Dialog', mapping)
    expect(result).toBe('common/Dialog')

    result = dojo2Vue.rewriteImport('dojo/dom-class', mapping)
    expect(result).toBe('dojo/css')

    result = dojo2Vue.rewriteImport('de/vommond/matc/canvas', mapping)
    expect(result).toBe('canvas')

    result = dojo2Vue.rewriteImport('abc/de/ef', mapping)
    expect(result).toBe('abc/de/ef')
  })
})
