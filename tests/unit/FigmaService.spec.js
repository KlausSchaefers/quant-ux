
import * as TestUtil from './TestUtil'
import figmaAnchorLinks from './data/figmaAnchorLinks.json'
import FigmaService from '../../src/services/FigmaService'

test('FigmaService.js - Add group', async () => {
  
    const f = new FigmaService()
    const model = await f.parse('id', figmaAnchorLinks, true, {w:360, h:600})

    expect(Object.values(model.widgets).length).toBe(6)
})
