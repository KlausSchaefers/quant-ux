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
        y:resultY.y
    }
}

export function getGridContainerLinesY(model, activePoint, zoom=1, includeBorder=true) {
    const result = {
        y:[]
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

    let rowHeights
    if (model.props.rowsFixed) {
        const rowH = zoomedOrZero(model.props.rowHeight, zoom)
        rows = Math.floor((spaceH + rowGap ) / (rowH + rowGap))
        rowHeights = new Array(rows).fill(rowH)
    } else {
        const totalRowGap = (rows - 1) * rowGap
        rowHeights = getTrackSizes(rows, model.props.rowHeights, spaceH - totalRowGap, zoom)
    }

    let v = paddingTop + y + borderBottomWidth
    result.y.push(v)
    for (let r=0; r< rows; r++) {
        v = v + rowHeights[r]
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
        x:[]
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

    let columnWidths
    if (model.props.columnsFixed) {
        const columnW = zoomedOrZero(model.props.columnWidth, zoom)
        columns = Math.floor((spaceW + columnGap) / (columnW + columnGap))
        columnWidths = new Array(columns).fill(columnW)
    } else {
        const totalColumnGap = (columns - 1) * columnGap
        columnWidths = getTrackSizes(columns, model.props.columnWidths, spaceW - totalColumnGap, zoom)
    }

    // in the grid container we do not have to add the border!!!
    let v = paddingLeft + x + borderLeftWidth
    result.x.push(v)
    for (let c=0; c< columns; c++) {
        v = v + columnWidths[c]
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

/**
 * Parses a track size like "30px", "2fr" or "20%". Anything missing
 * or unrecognized defaults to "1fr", so tracks without an explicit
 * size share the remaining space equally.
 */
function parseTrackSize(raw) {
    if (typeof raw === 'string') {
        const match = /^([0-9]*\.?[0-9]+)(px|fr|%)$/.exec(raw.trim())
        if (match) {
            return { value: parseFloat(match[1]), unit: match[2] }
        }
    }
    return { value: 1, unit: 'fr' }
}

/**
 * Computes the pixel size of each track (column or row) given their
 * CSS-grid-like size specs. "px" tracks and "%" tracks (of availableSpace)
 * are fixed, the remaining space is split among the "fr" tracks
 * proportional to their fr value.
 */
function getTrackSizes(count, sizes, availableSpace, zoom) {
    const tracks = []
    for (let i = 0; i < count; i++) {
        tracks.push(parseTrackSize(sizes && sizes[i]))
    }

    let fixedSpace = 0
    let totalFr = 0
    tracks.forEach(track => {
        if (track.unit === 'px') {
            fixedSpace += zoomedOrZero(track.value, zoom) || 0
        } else if (track.unit === '%') {
            fixedSpace += availableSpace * (track.value / 100)
        } else {
            totalFr += track.value
        }
    })

    const frSpace = Math.max(availableSpace - fixedSpace, 0)

    return tracks.map(track => {
        if (track.unit === 'px') {
            return zoomedOrZero(track.value, zoom) || 0
        }
        if (track.unit === '%') {
            return Math.floor(availableSpace * (track.value / 100))
        }
        return totalFr > 0 ? Math.floor(frSpace * (track.value / totalFr)) : 0
    })
}
