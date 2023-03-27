import Logger from '../Logger'

export function layout(app) {
    // fix here overlaps??
    // find common snapp lines
    return app
}

export function gridify(app, width, height) {
    Logger.log(1, 'Layouter.gridify()', width + '/'+ height)
    Object.values(app.screens).forEach(scrn => {
        gridifyScreen(app, scrn, width, height)
    })
    return app
}

function gridifyScreen(app, scrn, width, height) {
    scrn.children.forEach(id => {
        const w = app.widgets[id]
        if (w) {
            gridifyBox(w, width, height, scrn.x, scrn.y)
        }
    })
}

function gridifyBox(w, width, height, offsetX = 0, offsetY = 0) {
    w.x -= offsetX
    w.y -= offsetY           
    w.x = gridifyValue(w.x, width)
    w.y = gridifyValue(w.y, height)
    w.w = gridifyValue(w.w, width)
    w.h = gridifyValue(w.h, height)
    w.x += offsetX
    w.y += offsetY            
}

function gridifyValue(v, g) {
    return Math.round(v / g) * g
}