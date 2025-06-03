import * as GridUtil from '../../src/core/GridUtil'

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

test('Test GridUtil.getGridContainerLinesX() >  All', async () => {



    let result = GridUtil.getGridContainerLinesX(cntr, 'All', 1)

    expect(result.columnW).toBe(100)
    console.debug(result)
    expect(result.x.join(',')).toBe([26,126,146,246,266,366,386,486].join(','))
 
})

test('Test GridUtil.getGridContainerLinesY() >  All', async () => {

    let result = GridUtil.getGridContainerLinesY(cntr, 'All', 1)
    expect(result.rowH).toBe(70)
    expect(result.y.join(',')).toBe([12,82,92,162,172,242,252,322,332,402].join(','))
    console.debug(result)
})

test('Test GridUtil.getGridContainerLines() >  All', async () => {

    let result = GridUtil.getGridContainerLines(cntr, 'All', 1)
    expect(result.columnW).toBe(100)
    expect(result.rowH).toBe(70)
    expect(result.x.join(',')).toBe([26,126,146,246,266,366,386,486].join(','))
    expect(result.y.join(',')).toBe([12,82,92,162,172,242,252,322,332,402].join(','))
    console.debug(result)
})