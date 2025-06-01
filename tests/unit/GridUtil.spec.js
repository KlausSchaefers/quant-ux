import app from './data/gridContainer.json'
import * as GridUtil from '../../src/core/GridUtil'


test('GridUtil.js - group', async () => {

    const lines = {
        x: [16, 116, 136, 236, 256, 356],
        y: [24, 74, 84, 134, 144, 194],
    }

   const cells = GridUtil.getCells(lines)
   cells.forEach(c => {
        expect(c.w).toBe(100)
        expect(c.h).toBe(50)
   })
})