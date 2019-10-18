import * as dojo2Vue from '../../src/dojo/util/dojo2Vue.js'


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

})
