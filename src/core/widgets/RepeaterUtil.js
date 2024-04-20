export function calculateGrid(cntrBox, childBox, spacingX, spacingY, isGrid=true) {

    const offsetX = childBox.x - cntrBox.x
    const offsetY = childBox.y - cntrBox.y

    const width = cntrBox.w - offsetX * 2
    const height = cntrBox.h - offsetY * 2

    const childWidth = spacingX < 0 ? childBox.w : childBox.w + spacingX
    const childHeight = spacingY < 0 ? childBox.h : childBox.h + spacingY

    const columns = Math.max(isGrid ? Math.floor(width / childWidth) : 1, 1)
    const rows =  Math.floor(height / childHeight)

    if (spacingX < 0) {
        const restWidth =  width - (columns * childWidth) 
        spacingX = Math.max(0,( Math.floor(restWidth / Math.max(1, (columns - 1)))))
    } 

    if (spacingY < 0) {
        const restHeight =  height - (rows * childHeight) 
        spacingY = Math.max(0,( Math.floor(restHeight / (rows - 1))))
    } 

    return {
        columns: columns,
        rows: rows,
        childWidth: childWidth,
        childHeight: childHeight,
        contentWidth: width,
        contentHeight: height,
        paddingLeft: offsetX,
        paddingRight: offsetX,
        paddingTop: offsetY,
        paddingBottom: offsetY,
        spacingX: spacingX,
        spacingY: spacingY
    }

}