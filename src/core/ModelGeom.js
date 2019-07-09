/**
 * A class that should in the long run contain all the geometric functions
 * that are somehow scattered around, Core.js and Util.vue
 */
class ModelGeom {


    getBoundingBox (ids, model) {
        // console.debug('ModelGeom.getBoundingBox', ids, model)
        var result = { x: 100000000, y: 100000000, w: 0, h: 0 };

        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var box = this.getBoxById(id, model);
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

    getBoundingBoxByBoxes (boxes) {
        var result = { x: 100000000, y: 100000000, w: 0, h: 0 };

        for (var i = 0; i < boxes.length; i++) {
            var box = boxes[i];
            result.x = Math.min(result.x, box.x);
            result.y = Math.min(result.y, box.y);
            result.w = Math.max(result.w, box.x + box.w);
            result.h = Math.max(result.h, box.y + box.h);
        }

        result.h -= result.y;
        result.w -= result.x;

        return result;
    }

    getBoxById (id, model) {
        if (model.widgets[id]) {
            return model.widgets[id];
        }

        if (model.screens[id]) {
            return model.screens[id];
        }

        if (model.templates && model.templates[id]) {
            return model.templates[id];
        }

        /**
         * Ok, there seems to be an inherited model id???
         *
         *
         */
        if (!id || !id.split) {
            console.debug("getBoxById() > ID is wrong: " + id);
            return null;
        }
        var parts = id.split("@");
        if (parts.length == 2) {
            var widgetID = parts[0];
            var screenID = parts[1];

            var screen = model.screens[screenID];
            var parentWidget = model.widgets[widgetID];
            if (screen && parentWidget) {
                /**
                 * Would getParentScreen() also work???
                 */
                var parentScreen = this.getHoverScreen(parentWidget, model);

                if (parentScreen) {

                    var difX = parentScreen.x - screen.x;
                    var difY = parentScreen.y - screen.y;

                    var copiedParentWidget = this.clone(parentWidget);

                    /**
                     * Super important the ID mapping!!
                     */
                    copiedParentWidget.id = id;
                    copiedParentWidget.inherited = parentWidget.id;
                    copiedParentWidget.inheritedOrder = 1;

                    /**
                     * Now lets also put it at the right position!
                     */
                    copiedParentWidget.x -= difX;
                    copiedParentWidget.y -= difY;

                    return copiedParentWidget;
                } else {
                    console.warn('ModelGeom.getBoxById() > No parent Screen', id)
                }
            } else {
                console.warn("getBoxById() > No screen or widget for inherited id ",id);
            }
        }
        return null;
    }

    getParentScreen (widget, model) {
        for (var id in model.screens) {
            var screen = model.screens[id];
            var i = screen.children.indexOf(widget.id);
            if (i > -1) {
            return screen;
            }
        }
        return null;
    }

    getHoverScreen (box, model) {
        if (!box.w) {
            box.w = 0;
        }
        if (!box.h) {
            box.h = 0;
        }
        for (var id in model.screens) {
            var screen = model.screens[id];
            if (this._isBoxChild(box, screen)) {
                return screen;
            }
        }
        return null;
    }

    _isBoxChild (obj, parent) {
        if (
            obj.x + obj.w < parent.x ||
            parent.x + parent.w < obj.x ||
            obj.y + obj.h < parent.y ||
            parent.y + parent.h < obj.y
        ) {
            return false;
        }
        return true;
    }

    clone (obj) {
        if (!obj) {
            return null
        }
        let _s = JSON.stringify(obj)
        return JSON.parse(_s)
    }
}

export default new ModelGeom()