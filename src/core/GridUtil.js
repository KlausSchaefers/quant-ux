export function getCells(lines) {
    const cells = []
    const cols = lines.x
    const rows = lines.y
    for (let r = 0; r < rows.length - 1; r += 2) {
        for (let c = 0; c < cols.length - 1; c += 2) {
            const cell = {
                x: cols[c],
                y: rows[r],
                w: cols[c + 1] - cols[c],
                h: rows[r + 1] - rows[r],
            };
            cells.push(cell);
        }
    }
    return cells
}

export function getGridContainerLines(model, activePoint, zoom=1, includeBorder=true) {
    const resultX = getGridContainerLinesX(model, activePoint, zoom, includeBorder)
    const resultY = getGridContainerLinesY(model, activePoint, zoom, includeBorder)
    return {
        x:resultX.x,
        y:resultY.y,
        columnW:resultX.columnW,
        rowH:resultY.rowH
    }
}

export function getGridContainerLinesY(model, activePoint, zoom=1, includeBorder=true) {
    const result = {
        y:[],
        rowH:0
    }  
    const style = model.style   
    const y = model.y
    let rows = model.props.rows

    const paddingTop = zoomedOrZero(style.paddingTop, zoom)
    const paddingBottom = zoomedOrZero(style.paddingBottom, zoom)
    const borderBottomWidth = includeBorder ?  zoomedOrZero(style.borderBottomWidth, zoom) : 0
    const borderTopWidth = includeBorder ? zoomedOrZero(style.borderTopWidth, zoom) : 0
    const rowGap = zoomedOrZero(model?.props.rowGap, zoom)
    const spaceH = model.h - (paddingTop + paddingBottom + borderTopWidth + borderBottomWidth)

    let rowH = 0
    if (model.props.rowsFixed) {
        rowH = zoomedOrZero(model.props.rowHeight, zoom)
        rows = Math.floor((spaceH + rowGap ) / (rowH + rowGap))
    } else {
        const totalRowGap = (rows - 1) * rowGap
        rowH = Math.floor((spaceH - totalRowGap) / rows)
    }

    result.rowH = rowH
    let v = paddingTop + y + borderBottomWidth
    result.y.push(v)
    for (let r=0; r< rows; r++) {
        v = v + rowH
        if (activePoint !== 'North' && activePoint !== 'RightUp' && activePoint !== 'LeftUp') {
            result.y.push(v)
        }
        if (r < rows-1) {
            v = v + rowGap
            if (activePoint !== 'South' && activePoint !== 'RightDown' && activePoint !== 'LeftDown') {
                result.y.push(v)
            }
        }
    }

    // const dif = model.y + model.h - v - paddingTop - borderBottomWidth;
    // if (Math.abs(dif) > 1) {
    //     v = v + dif
    //     result.y.pop()
    //     result.y.push(v)
    // }

    return result
}




export function getGridContainerLinesX(model, activePoint, zoom=1, includeBorder = true) {
    const result = {
        x:[],
        columnW:0
    }
  
    const style = model.style
    const x = model.x
    let columns = model.props.columns
    const paddingLeft = zoomedOrZero(style.paddingLeft, zoom)
    const paddingRight = zoomedOrZero(style.paddingRight, zoom)

    const borderLeftWidth = includeBorder ? zoomedOrZero(style.borderLeftWidth, zoom): 0
    const borderRightWidth = includeBorder ? zoomedOrZero(style.borderRightWidth, zoom): 0   

    const columnGap = zoomedOrZero(model?.props.columnGap, zoom)
    const spaceW = model.w - (paddingLeft + paddingRight + borderRightWidth + borderLeftWidth) 

    let columnW = 0
    if (model.props.columnsFixed) {
        columnW = zoomedOrZero(model.props.columnWidth, zoom)
        columns = Math.floor((spaceW + columnGap) / (columnW + columnGap))
        console.debug(`getGridContainerLinesX() > spaceW: ${spaceW}, columnW: ${columnW} + ${columnGap} = ${columns}`)
    } else {
        const totalColumnGap = (columns - 1) * columnGap
        columnW = Math.floor((spaceW - totalColumnGap) / columns)
    }
 
    result.columnW = columnW
    // in the grid container we do not have to add the border!!!
    let v = paddingLeft + x + borderLeftWidth
    result.x.push(v)
    for (let c=0; c< columns; c++) {
        v = v + columnW
        if (activePoint !== 'West' && activePoint !== 'LeftDown' && activePoint !== 'LeftUp') {
            result.x.push(v)
        }
        
        if (c < columns-1) {
            v = v + columnGap
            if (activePoint !== 'East' && activePoint !== 'RightDown' && activePoint !== 'RightUp') {
                result.x.push(v)
            }
        }
    }

    // check that the last value is alligned to right padding?
    // const dif = model.x + model.w - v - paddingRight - borderRightWidth;
    // if (Math.abs(dif) > 1) {
    //     v = v + dif
    //     result.x.pop()
    //     result.x.push(v)
    // }
    return result
}

function zoomedOrZero(v, zoom) {
    if (!v) {
        return v
    }
    return Math.floor(v * zoom)
}
