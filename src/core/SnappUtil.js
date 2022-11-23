export function getMinLine (lines) {
    lines = lines.filter(l => l !== null && l !== undefined)
    lines.sort((a, b) => {
        return Math.abs(a.dist) - Math.abs(b.dist)
    })
    const result = lines[0]
    if (result) {
        if (result.lineType === 'pattern') {
            delete result.snapp;
        }
        if (result.lineType === 'middle') {
            result.snapp.middle = true;
        }
    }
    return result
}

export function correctSnappDirection(line, direction) {

    if (direction == false && line?.pos === 0) {	
        direction = true
    }

    if (direction == true && line?.pos === 1) {	
        direction = false
    }     
  
    return direction
}


export function getOverlayXMiddle(from, to) {
    const xDif = to.x - from.x;
    if (to.x >= from.x && to.x + to.w <= from.x + from.w) {
        return to.x + Math.round(to.w / 2);
    } else if (from.x >= to.x && from.x + from.w <= to.x + to.w) {
        return from.x + Math.round(from.w / 2);
    } else if (to.x <= from.x) {
        let s = to.x - xDif;
        let e = to.x + to.w;
        return s + Math.round((e - s) / 2);
    } else {
        let s = from.x + xDif;
        let e = from.x + from.w;
        return s + Math.round((e - s) / 2);
    }
}

export function getOverlayYMiddle(from, to) {
    const yDif = to.y - from.y;
    if (to.y >= from.y && to.y + to.h <= from.y + from.h) {
        return to.y + Math.round(to.h / 2);
    } else if (from.y >= to.y && from.y + from.h <= to.y + to.h) {
        return from.y + Math.round(from.h / 2);
    } else if (to.y <= from.y) {
        let s = to.y - yDif;
        let e = to.y + to.h;
        return s + Math.round((e - s) / 2);
    } else {
        let s = from.y + yDif;
        let e = from.y + from.h;
        return s + Math.round((e - s) / 2);
    }
}	

/**
* Calculates the similarity between two widgets.
*/
export function isSimilar(a, b) {
   let score = 0;
   if (Math.abs(a.w - b.w) < 5) {
       score++;
   }
   if (Math.abs(a.h - b.h) < 5) {
       score++;
   }
   if (a.style && b.style && a.style.background === b.style.background) {
       score++;
   }
   if (a.type === b.type) {
       score++;
   }
   return score > 1; // or what is a good similarity threshold;
}


export function getCloseLines(min, lines, key, vales, ignoreType = false, lineType) {

    let result = null;

    for (let id in lines) {
        const line = lines[id];
        if (!ignoreType || ignoreType != line.type) {
            line.dist = 1000;
            for (let i = 0; i < vales.length; i++) {
                const v = vales[i];
                const cost = Math.abs(v - line[key])
                if (cost >= 0 && cost < min) {
                    min = cost;
                    result = line;
                    result.pos = i
                    result.dist = line[key] - v;
                    result.lineType = lineType
                }
            }
        }
    }

    return result;
}


export function snapp(absPos, diff, type) {
    //this.logger.log(0,"snapp", "enter " +diff.x + " " + diff.y + " > " + type);

    switch (type) {

        case "All":
            /**
             * Simply substract the difference
             */
            absPos.x += diff.x;
            absPos.y += diff.y;
            break;

        case "LeftUp":
            absPos.x += diff.x;
            absPos.w -= diff.x;
            absPos.y += diff.y;
            absPos.h -= diff.y;
            break;


        case "RightUp":
            absPos.w += diff.x;
            absPos.y += diff.y;
            absPos.h -= diff.y;
            break;

        case "RightDown":
            absPos.w += diff.x;
            absPos.h += diff.y;
            break;

        case "LeftDown":
            absPos.x += diff.x;
            absPos.w -= diff.x;
            absPos.h += diff.y;
            break;


        case "North":
            absPos.y += diff.y;
            absPos.h -= diff.y;
            break;

        case "South":
            absPos.h += diff.y;
            break;

        case "West":
            absPos.x += diff.x;
            absPos.w -= diff.x;
            break;

        case "East":
            absPos.w += diff.x;
            break;

        default:
            // leftup
            console.warn("Type not supported!");
            break;
    }

    return absPos;
}