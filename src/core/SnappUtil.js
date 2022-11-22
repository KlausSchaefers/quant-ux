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

