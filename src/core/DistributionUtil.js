
import ModelUtil from "./ModelUtil";
import ModelGeom from "./ModelGeom";
import Logger from "./Logger";

export function getDistributionMatrix(model, ids) {
    return {
        horizontal: getDistributionSets(model, 'vertical', ids).length,
        vertical: getDistributionSets(model, 'horizontal', ids).length
    }
}

export function getDistributionSets (model, type, ids) {
    Logger.log(1, 'DistributionUtil.getDistributionSets() > enter')
    /**
     * 1) get all subsets (rows or columns) depending on type
     */
    const sets = [];
    for (let i = 0; i < ids.length; i++) {
        const widgetID = ids[i];
        const widget = model.widgets[widgetID];
        if (widget) {
            /**
             * Attention: This seems counter intuitive. But for vertical,
             * we have to find columns (x axis) and for horizontal we need
             * rows (z - axis).
             */
            if (type == "vertical") {
                const start = widget.x;
                const end = widget.x + widget.w;
                _addToDisSet(sets, widget, start, end);
            } else {
                const start = widget.y;
                const end = widget.y + widget.h;
                _addToDisSet(sets, widget, start, end);
            }
        }
    }
    return sets
}

export function distributedPositions(model, type, ids, boundingBox) {
    Logger.log(1, 'DistributionUtil.distributedPositions() > enter')
    /**
     * 1) get all subsets (rows or columns) depending on type
     */
    const sets = getDistributionSets(model, type, ids, boundingBox)

    /**
     * Now resize for every set!
     */
    const result = {};
    let distances = [];
    for (let i = 0; i < sets.length; i++) {
        const set = sets[i];
        const temp = _distributedPositionsInSubSet(model, type, set.children, boundingBox);
        const tempPositions = temp.positions;
        for (let id in tempPositions) {
            if (!result[id]) {
                result[id] = tempPositions[id];
            }
        }
        distances = distances.concat(temp.distances);
    }



    return {
        positions: result,
        distances: distances
    };
}


function _addToDisSet(sets, widget, start, end) {
    const overlapps = [];

    for (let i = 0; i < sets.length; i++) {
        const set = sets[i];
        const overlap = _getDisOverlap(start, end, set.start, set.end);
        if (overlap > 0) {
            set.start = Math.min(set.start, start);
            set.end = Math.max(set.end, end);
            set.children.push(widget.id);
            set.pos = i;
            overlapps.push(set);
        }
    }
    if (overlapps.length == 0) {
        sets.push({
            start: start,
            end: end,
            children: [widget.id]
        });
    }

    /**
     * If an element is in two sets, the sets should be merged!
     * It is not super important, as we would have in worst
     * case one set, which would fuck up rending in worst case...
     * Actually it should not happen often (or at all)
     */
    if (overlapps.length > 1) {
        const merged = {
            start: start,
            end: end,
            children: []
        };
        for (let i = 0; i < overlapps.length; i++) {
            const temp = overlapps[i];
            merged.start = Math.min(merged.start, temp.start);
            merged.end = Math.max(merged.end, temp.end);
            merged.children = merged.children.concat(temp.children);
            sets.splice(temp.pos, 1);
        }
    }
}

function _getDisOverlap(a, b, c, d) {
    //return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2))
    return (
        Math.min(Math.max(a, b), Math.max(c, d)) -
        Math.max(Math.min(c, d), Math.min(a, b))
    );
}


function _distributedPositionsInSubSet(model, type, ids, boundingBox) {
    const result = {};

    /**
     * 1) find groups... This can be bounding boxes or single widgets
     */
    const boxes = _getSelectionGroupPositions(model, ids);

    /**
     * 2) Now we calculate the positions
     */
    const positions = _getDistributedPositions(type, boxes, boundingBox);
    const distances = [];
    /**
     * 3) now we fit the group children to their parents...
     */
    for (let id in positions) {
        const newPos = positions[id];
        if (newPos.children) {
            for (var widgetID in newPos.children) {
                var widgetPos = newPos.children[widgetID];
                widgetPos.x = newPos.x + widgetPos.offSetX;
                widgetPos.y = newPos.y + widgetPos.offSetY;
                result[widgetID] = widgetPos;
            }
        } else {
            result[id] = newPos;
        }

        if (newPos.distanceX || newPos.distanceY) {
            distances.push({
                x: newPos.distanceX,
                y: newPos.distanceY
            });
        }
    }

    return {
        positions: result,
        distances: distances
    };
}


function _getDistributedPositions(type, boxes, boundingBox) {
    const positions = {};

    boxes.sort(function (a, b) {
        if (type == "vertical") {
            return a.y - b.y;
        } else {
            return a.x - b.x;
        }
    });
    let sum = 0;
    for (let i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        if (type == "vertical") {
            sum += box.h;
        } else {
            sum += box.w;
        }
    }
    let last = boxes[boxes.length - 1];
    if (type == "vertical") {
        sum = boundingBox.h - sum;
    } else {
        sum = boundingBox.w - sum;
    }

    let space = sum / (boxes.length - 1);
    last = 0;
    let lastBox = null;
    for (let i = 0; i < boxes.length; i++) {
        const widget = boxes[i];

        const widgetPos = {
            x: widget.x,
            y: widget.y,
            h: widget.h,
            w: widget.w,
            children: widget.children
        };
        if (i == 0) {
            if (type == "vertical") {
                widgetPos.y = boundingBox.y;
                last = widgetPos.y + widgetPos.h;
            } else {
                widgetPos.x = boundingBox.x;
                last = widgetPos.x + widgetPos.w;
            }
        } else if (i == boxes.length - 1) {
            if (type == "vertical") {
                widgetPos.y = Math.round(boundingBox.y + boundingBox.h - widget.h);
            } else {
                widgetPos.x = Math.round(boundingBox.x + boundingBox.w - widget.w);
            }
        } else {
            if (type == "vertical") {
                widgetPos.y = Math.round(last + space);
                last = Math.round(widgetPos.y + widgetPos.h);
            } else {
                widgetPos.x = Math.round(last + space);
                last = Math.round(widgetPos.x + widgetPos.w);
            }
        }

        /**
         * Also store distance so we can show later!
         */
        if (lastBox) {
            if (type == "vertical") {
                widgetPos.distanceY = {
                    y: lastBox.y + lastBox.h,
                    h: widgetPos.y - (lastBox.y + lastBox.h),
                    x: Math.round(widgetPos.x + widgetPos.w / 2)
                };
            } else {
                //console.debug("distHor", widgetPos.x - (lastBox.x +lastBox.w))
                widgetPos.distanceX = {
                    x: lastBox.x + lastBox.w,
                    w: widgetPos.x - (lastBox.x + lastBox.w),
                    y: Math.round(widgetPos.y + widgetPos.h / 2)
                };
            }
        }

        positions[widget.id] = widgetPos;
        lastBox = widgetPos;
    }
    return positions;
}

/**
* Get widget positions and bounding boxes for groups...
*/
function _getSelectionGroupPositions(model, ids) {
   const groups = {};
   for (let i = 0; i < ids.length; i++) {
        const widgetID = ids[i];
        const widget = model.widgets[widgetID];
        const group = ModelUtil.getParentGroup(model, widgetID);
        if (group) {
            const bbx = ModelGeom.getBoundingBox(group.children, model);
            if (!groups[group.id]) {
               bbx.children = {};
               groups[group.id] = bbx;
            }
           
            groups[group.id].children[widgetID] = {
                x: widget.x,
                y: widget.y,
                h: widget.h,
                w: widget.w,
                offSetX: widget.x - bbx.x,
                offSetY: widget.y - bbx.y
            };
            
       } else {
           groups[widgetID] = {
               x: widget.x,
               y: widget.y,
               h: widget.h,
               w: widget.w
           };
       }
   }

  
   return ModelUtil.getArrayFromObject(groups, "id");
}



export function _distributedPositionsBak (model, type, widgets, boundingBox) {
    var positions = {};

    var temp = [];
    for (let i = 0; i < widgets.length; i++) {
      let widgetID = widgets[i];
      let widget = model.widgets[widgetID];
      temp.push(widget);
    }

    temp.sort(function(a, b) {
      if (type == "vertical") {
        return a.y - b.y;
      } else {
        return a.x - b.x;
      }
    });

    var sum = 0;
    for (let i = 0; i < widgets.length; i++) {
      let widget = temp[i];
      if (type == "vertical") {
        sum += widget.h;
      } else {
        sum += widget.w;
      }
    }
    var last = temp[temp.length - 1];
    if (type == "vertical") {
      sum = boundingBox.h - sum;
    } else {
      sum = boundingBox.w - sum;
    }

    var space = sum / (widgets.length - 1);
    last = 0;

    for (let i = 0; i < temp.length; i++) {
      let widget = temp[i];
      var widgetPos = { x: widget.x, y: widget.y, h: widget.h, w: widget.w };
      if (i == 0) {
        if (type == "vertical") {
          widgetPos.y = boundingBox.y;
          last = widgetPos.y + widgetPos.h;
        } else {
          widgetPos.x = boundingBox.x;
          last = widgetPos.x + widgetPos.w;
        }
      } else if (i == temp.length - 1) {
        if (type == "vertical") {
          widgetPos.y = Math.round(boundingBox.y + boundingBox.h - widget.h);
        } else {
          widgetPos.x = Math.round(boundingBox.x + boundingBox.w - widget.w);
        }
      } else {
        if (type == "vertical") {
          widgetPos.y = Math.round(last + space);
          last = Math.round(widgetPos.y + widgetPos.h);
        } else {
          widgetPos.x = Math.round(last + space);
          last = Math.round(widgetPos.x + widgetPos.w);
        }
      }
      positions[widget.id] = widgetPos;
    }

    Logger.log(0,"DistrubtionUtil.calculateDistributedPositions", "enter > " +type +" > space : " + space);

    return positions;
  }


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