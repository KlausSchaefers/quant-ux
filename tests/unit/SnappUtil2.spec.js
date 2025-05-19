import * as SnappUtil from '../../src/core/SnappUtil'

const cntr = {
    "id" : "GridContainer",
    "type" : "GridContainer",
    "category": "Advanced",
    "subcategory" : "AAA",
    "_type" : "Widget",
    "name" : "Grid Container",
    "x" : 0,
    "y" : 0,
    "w": 512, // include border and padding
    "h": 414,
    "z" : 0,
    "props" : {
        "layout": "grid",
        "rows": 5,
        "columns": 4,
        "rowGap": 10,
        "columnGap": 20            
    },
    "actions":{},
    "style" : {
        "borderRadius": 0,
        "borderBottomWidth": 2,
        "borderTopWidth": 2,
        "borderLeftWidth": 1,
        "borderRightWidth": 1,
        "borderStyle": "solid",
        "borderColor": "@background-passive",	
        "background": "@form-background",
        "paddingBottom":10,
        "paddingLeft": 25,
        "paddingRight": 25,
        "paddingTop": 10
    }
}

test('Test SnappUtil.getGridContainerLinesX() >  All', async () => {



    let result = SnappUtil.getGridContainerLinesX(cntr, 'All', 1)

    expect(result.columnW).toBe(100)
    console.debug(result)
    expect(result.x.join(',')).toBe([26,126,146,246,266,366,386,486].join(','))
 
})

test('Test SnappUtil.getGridContainerLinesY() >  All', async () => {

    let result = SnappUtil.getGridContainerLinesY(cntr, 'All', 1)
    expect(result.rowH).toBe(70)
    expect(result.y.join(',')).toBe([12,82,92,162,172,242,252,322,332,402].join(','))
    console.debug(result)
})

test('Test SnappUtil.getGridContainerLines() >  All', async () => {

    let result = SnappUtil.getGridContainerLines(cntr, 'All', 1)
    expect(result.columnW).toBe(100)
    expect(result.rowH).toBe(70)
    expect(result.x.join(',')).toBe([26,126,146,246,266,366,386,486].join(','))
    expect(result.y.join(',')).toBe([12,82,92,162,172,242,252,322,332,402].join(','))
    console.debug(result)
})