import ModelResizer from '../../src/core/ModelResizer'
import ModelGeom from '../../src/core/ModelGeom'
import app_resize from '../data/app_resize.json'
/* global describe, it */

describe('Resizer', () => {
  it('Test Top Right', () => {
    let screen = app_resize.screens['s10000']
    let pos = ModelGeom.getBoundingBox(screen.children, app_resize)
    pos.w += 100
    pos.h += 100
    let positions = ModelResizer.resize(app_resize, screen.children, pos)
    console.debug(positions)
  })
})

