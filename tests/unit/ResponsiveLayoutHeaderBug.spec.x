
import * as TestUtil from './TestUtil'
import app from './data/responsiveAppHeaderBug.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'


test('ResponsiveLayoutHeaderBug.spec.js - testHeader', async () => {

    const width = app.screenSize.w
    const layouter = new ResponsiveLayout(1)
    layouter.initApp(structuredClone(app))
    const responsivePositions = layouter.resize(width, -1)

    const header = responsivePositions.widgets['w10002_52028']
    console.debug('header', header.w, header)

     expect(header.w).toBe(width)
})



