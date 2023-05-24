import app from './data/responsiveApp.json'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import * as Util from './ResponsiveTestUtil'

// test('Test ResponsiveLayout.resize() > Row', async () => {
    

//     let responsive = new ResponsiveLayout(app)
//     let scrn1 = responsive.treeModel.screens[0]
   
//     console.debug(Util.print(scrn1))
//     let resizedApp = responsive.resize(375 * 2)
//     expect(resizedApp).not.toBeNull()
//     expect(resizedApp.screenSize.w).toBe(750)
//     expect(resizedApp.screens['s10026_36526'].w).toBe(750)

//     expect(resizedApp.widgets['w10027_11836'].w).toBe(160)
//     expect(resizedApp.widgets['w10060_48649'].w).toBe(128)
//     expect(resizedApp.widgets['w10062_42753'].w).toBe(128)
    
    
// })

test('Test ResponsiveLayout > 1', async () => {
    
    delete app.screens['s10000_15630']
    let responsive = new ResponsiveLayout(app)

    let scaledGrid = responsive.sclaleGrid({
        rows: [
            { v: 0, start: ['a'], end: [], fixed: true, l: 32 },
            { v: 16, start: ['b'], end: ['a'], fixed: false, l: 64 },
            { v: 80, start: [], end: ['b'], fixed: false, l: 16 }
        ],
        columns: [
            { v: 0, start: ['a'], end: [], fixed: false, l: 16 },
            { v: 16, start: ['b'], end: ['a'], fixed: true, l: 64 },
            { v: 80, start: [], end: ['b'], fixed: false, l: 16 }
        ]
    }, 2, 2)

    console.debug(scaledGrid)
    expect(scaledGrid.cols.length).toBe(4)
    expect(scaledGrid.cols[0]).toBe(0)
    expect(scaledGrid.cols[1]).toBe(32)
    expect(scaledGrid.cols[2]).toBe(32 + 64)
    expect(scaledGrid.cols[3]).toBe(32 + 64 + 32)

    expect(scaledGrid.rows.length).toBe(4)
    expect(scaledGrid.rows[0]).toBe(0)
    expect(scaledGrid.rows[1]).toBe(32)
    expect(scaledGrid.rows[2]).toBe(32 + 128)
    expect(scaledGrid.rows[3]).toBe(32 + 128 + 32)
    
})