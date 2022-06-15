import ModelFixer from '../../src/canvas/controller/ModelFixer'
import bug from './data/evilFreeZeBug.json'

test('Test ModelFixes - fixRecursiveGroups', async () => {

    const errors = ModelFixer.fixRecursiveGroups(bug)
    expect(errors.length).toBe(1)

    const fixed = ModelFixer.fixRecursiveGroups(bug)
    expect(fixed.length).toBe(0)
 
})
