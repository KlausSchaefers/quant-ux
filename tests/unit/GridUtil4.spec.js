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
    "w": 320,
    "h": 100,
    "z" : 0,
    "props" : {
        "layout": "grid",
        "rows": 2,
        "columns": 3,
        "rowGap": 0,
        "columnGap": 10,
        "columnWidths": ["60px", "1fr", "2fr"],
        "rowHeights": ["30%", "1fr"]
    },
    "actions":{},
    "style" : {
        "borderRadius": 0,
        "borderBottomWidth": 0,
        "borderTopWidth": 0,
        "borderLeftWidth": 0,
        "borderRightWidth": 0,
        "borderStyle": "solid",
        "borderColor": "@background-passive",
        "background": "@form-background",
        "paddingBottom": 0,
        "paddingLeft": 0,
        "paddingRight": 0,
        "paddingTop": 0
    }
}

test('Test GridUtil.getGridContainerLinesX() > columnWidths (px/fr/fr)', async () => {
    let result = GridUtil.getGridContainerLinesX(cntr, 'All', 1)
    // 60px fixed, remaining 240px split 1fr/2fr -> 80 / 160
    expect(result.x.join(',')).toBe([0, 60, 70, 150, 160, 320].join(','))
})

test('Test GridUtil.getGridContainerLinesY() > rowHeights (percent/fr)', async () => {
    let result = GridUtil.getGridContainerLinesY(cntr, 'All', 1)
    // 30% of 100 -> 30, remaining 70 goes to the 1fr row
    expect(result.y.join(',')).toBe([0, 30, 30, 100].join(','))
})

test('Test GridUtil.getGridContainerLinesX() > missing columnWidths entries default to 1fr', async () => {
    const model = JSON.parse(JSON.stringify(cntr))
    model.props.columnWidths = ["60px"] // only first column has an explicit size
    let result = GridUtil.getGridContainerLinesX(model, 'All', 1)
    // 60px fixed, remaining 240px split evenly across the two implicit 1fr columns -> 120 / 120
    expect(result.x.join(',')).toBe([0, 60, 70, 190, 200, 320].join(','))
})
