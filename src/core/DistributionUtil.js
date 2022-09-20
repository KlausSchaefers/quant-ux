
// import lang from 'dojo/_base/lang'

export function getLines(model, selection) {
    let boundingBox = getBoundingBox(model, selection)
    let xLines = {}
    let yLines = {}
    selection.forEach(id => {
        let box = getBoxById(model, id)
        if (box) {
            let left = box.x - boundingBox.x
            addLine(xLines, left, id, 'left', boundingBox.w)

            let right = box.x + box.w - boundingBox.x
            addLine(xLines, right, id, 'right', boundingBox.w)

            let top = box.y - boundingBox.y
            addLine(yLines, top, id, 'top', boundingBox.h)

            let bottom = box.y + box.h - boundingBox.y
            addLine(yLines, bottom, id, 'bottom', boundingBox.h)
        }
    });
    return {
        xLines: xLines,
        yLines: yLines,
        boundingBox: boundingBox
    }
}

function addLine (result, line, id, attach, max) {
    if (line > 0 && line < max){
        if (!result[line]) {
            result[line] = {
                lines: []
            }
        }
        result[line].lines.push({
            id: id,
            attach: attach
        })
    }
    
}


function getBoundingBox (model, ids) {
    var result = { x: 100000000, y: 100000000, w: 0, h: 0 , isBoundingBox: true, ids: ids};

    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var box = getBoxById(model, id);
      if (box) {
        result.x = Math.min(result.x, box.x);
        result.y = Math.min(result.y, box.y);
        result.w = Math.max(result.w, box.x + box.w);
        result.h = Math.max(result.h, box.y + box.h);
      } else {
        console.warn("getBoundingBox() > No box with id", id);
      }
    }
    result.h -= result.y;
    result.w -= result.x;
    return result;
}


function getBoxById (model, id) {
    if (model.widgets[id]) {
        return model.widgets[id];
    }

    if (model.screens[id]) {
        return model.screens[id];
    }

    if (model.templates && model.templates[id]) {
        return model.templates[id];
    }
    return null;
}