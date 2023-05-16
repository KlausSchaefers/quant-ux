import app from './data/responsiveApp.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import * as Util from './ResponsiveTestUtil'

test('Test ResponsiveLayout > 1', async () => {
    
    delete app.screens['s10000_15630']
    let responsive = new ResponsiveLayout(app)
    let scrn1 = responsive.treeModel.screens[0]
   
    console.debug(Util.print(scrn1))
    let resizedApp = responsive.resize(375 * 2)
    expect(resizedApp).not.toBeNull()
    expect(resizedApp.screenSize.w).toBe(750)
    expect(resizedApp.screens['s10026_36526'].w).toBe(750)

    expect(resizedApp.widgets['w10027_11836'].w).toBe(160)
})