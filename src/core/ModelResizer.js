import ModelGeom from './ModelGeom'

class ModelResizer {


    resize(model, ids, pos) { 

        let oldPos = ModelGeom.getBoundingBox(ids, model)
        let difW = pos.w - oldPos.w
        console.debug(difW)
    }

    /**
    * Gets the new position for a group child
    */
    getGroupChildResizePosition (widget, oldGroup, newGroup, dif) {
        console.debug('getGroupChildResizePosition', widget)
        /**
         * get relative position of the widget in group
         */
        var relPos = {
            x: ((widget.x - oldGroup.x) / oldGroup.w) * 1.0,
            y: ((widget.y - oldGroup.y) / oldGroup.h) * 1.0
        };

        /**
         * Resize rules are:
         *
         * 1) For x and y : if child box is 10 % away from border.
         *    So new x must be also that amount away.
         *
         * 2) For w and h: just multiply with new width
         */
        var newPos = {
            x: newGroup.x + newGroup.w * relPos.x,
            y: newGroup.y + newGroup.h * relPos.y,
            w: widget.w * dif.w,
            h: widget.h * dif.h
        };
        return newPos;
    }

    getResizePosition (pos, model, type, resizeModel){
			
        var newModel = {
            x:model.x, 
            y: model.y, 
            h: model.h, 
            w: model.w,
            id : model.id
        };
    
        /**
         * get min height for screens
         */
        var minH = (resizeModel.min) ? resizeModel.min.h : -1;
        var minW = (resizeModel.min) ? resizeModel.min.w : -1;
        
        // FIXME: Do something like if (leftUp || leftDown).. else...

        if(type=="LeftUp"){
            if(minH < 0 || minH < (newModel.h - pos.y)){
                newModel.h -= pos.y;
                newModel.y += pos.y;
            } else {
                newModel.y += newModel.h - minH;
                newModel.h = minH;
            }
            
            if(minW < 0 || minW < (newModel.w - pos.x)){
                newModel.w -= pos.x;
                newModel.x += pos.x;
            } else {
                newModel.w += newModel.w - minW;
                newModel.w = minW;
            }
        } else if(type=="RightUp"){
            // up
            if(minH < 0 || minH < (newModel.h - pos.y)){
                newModel.h -= pos.y;
                newModel.y += pos.y;
            } else {
                newModel.y += newModel.h - minH;
                newModel.h = minH;
            }
            
            // right
            if(minW > 0){
                newModel.w = Math.max(minW, newModel.w + pos.x);
            } else {
                newModel.w += pos.x;
            }
        } else if(type=="RightDown"){
            // down
            if(minH > 0){
                newModel.h = Math.max(minH, newModel.h + pos.y);
            } else {
                newModel.h += pos.y;
            }
            
            // right
            if(minW > 0){
                newModel.w = Math.max(minW, newModel.w + pos.x);
            } else {
                newModel.w += pos.x;
            }
        } else if(type=="LeftDown"){
            // down
            if(minH > 0){
                newModel.h = Math.max(minH, newModel.h + pos.y);
            } else {
                newModel.h += pos.y;
            }
            
            // left
            if(minW < 0 || minW < (newModel.w - pos.x)){
                newModel.w -= pos.x;
                newModel.x += pos.x;
            } else {
                newModel.w += newModel.w - minW;
                newModel.w = minW;
            }
        } else if(type=="South"){
            // down
            if(minH > 0){
                // TODO: add here some logic for screen snapping...
                newModel.h = Math.max(minH, newModel.h + pos.y);
            } else {
                newModel.h += pos.y;
            }
        } else if(type=="North"){
            // up
            if(minH < 0 || minH < (newModel.h - pos.y)){
                newModel.h -= pos.y;
                newModel.y += pos.y;
            } else {
                newModel.y += newModel.h - minH;
                newModel.h = minH;
            }
        } else if(type=="West"){
            // left
            if(minW < 0 || minW < (newModel.w - pos.x)){
                newModel.w -= pos.x;
                newModel.x += pos.x;
            } else {
                newModel.w += newModel.w - minW;
                newModel.w = minW;
            }
        } else if(type=="East"){
            // right
            if(minW > 0){
                newModel.w = Math.max(minW, newModel.w + pos.x);
            } else {
                newModel.w += pos.x;
            }
        } else {
            console.warn(type, "Not supported");
        }
        return newModel;
    }
}
export default new ModelResizer()
