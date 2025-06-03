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
    "w": 644, // include border and padding
    "h": 524,
    "z" : 0,
    "props" : {
        "layout": "grid",
        "rows": 2,
        "columns": 2,
        "rowGap": 10,
        "rowHeight": 100,
        "columnWidth": 200,
        "columnGap": 20,
        "rowsFixed": true,
        "columnsFixed": true             
    },
    "actions":{},
    "style" : {
        "borderRadius": 0,
        "borderBottomWidth": 2,
        "borderTopWidth": 2,
        "borderLeftWidth": 2,
        "borderRightWidth": 2,
        "borderStyle": "solid",
        "borderColor": "@background-passive",	
        "background": "@form-background",
        "paddingBottom":10,
        "paddingLeft": 20,
        "paddingRight": 20,
        "paddingTop": 10
    }
}

test('Test GridUtil.getGridContainerLinesX() >  All', async () => {

    let result = GridUtil.getGridContainerLinesX(cntr, 'All', 1)
    expect(result.columnW).toBe(200)
  
    expect(result.x.join(',')).toBe([22,222,242,442].join(','))
 
})

test('Test GridUtil.getGridContainerLinesY() >  All', async () => {

    let result = GridUtil.getGridContainerLinesY(cntr, 'All', 1)
    console.debug(result)
    expect(result.rowH).toBe(100)
    expect(result.y.join(',')).toBe("12,112,122,222,232,332,342,442")
    console.debug(result)
})

