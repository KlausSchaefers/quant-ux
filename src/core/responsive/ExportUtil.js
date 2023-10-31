import Logger from "../Logger";
import {Layout} from './Const'

export function round(x) {
    return Math.round(x)
    // FIXME: This causes some weird issues.
    //return Math.round(x * 10) / 10
}

export function isLayoutWrap (e) {
    return e.layout && e.layout.type === Layout.Wrap
}

export function isLayoutRow (e) {
    return e.layout && e.layout.type === Layout.Row
}

export function isLayoutGrid (e) {
    return e.layout && e.layout.type === Layout.Grid
}

export function isLayoutGrow (e) {
    return e.layout && e.layout.grow > 0
}


export function isLayoutAuto(e) {
    // why did check for this??? || e.layout.align !== undefined Take a look at auto fixed. This is somehow needed for the growth
    return e.layout !== undefined && (e.layout.type === Layout.AutoHorizontal || e.layout.type === Layout.AutoVertical ) //|| e.layout.align !== undefined
}

export function isLayoutAutoHorizontal(e) {
    return e.layout && e.layout.type === Layout.AutoHorizontal
}

export function isLayoutAutovertical(e) {
    return e.layout && e.layout.type === Layout.AutoVertical
}


export function getFileName(name) {
    return name.replace(/\s/g, '_');
}

export function hasNoChildren(widget) {
    return widget.children && widget.children.length === 0
}

export function hasChildren(widget) {
    return widget.children && widget.children.length > 0
}


export function isScreen(e) {
    return e.type === 'Screen'
}

export function isLastChild(widget) {

    if(widget.parent && widget.parent.children){
        let parent = widget.parent
        let last = parent.children[parent.children.length-1]
        return last.id === widget.id
    }
    return false
}

/**
 * Advanced widgets cannot have children, e.g. stacked rings
 */
export function canHaveChildren (element) {
    if (element.props && element.props.customComponent) {
        return false
    }
    if (isContainerElement(element) || isInputElement(element)) {
        return true
    }
    return false
}

export function isInputElement (element) {
    const type = element.type
    return type === 'TextBox' || type === 'TextArea' || type === 'Password' || type === 'DropDown'
}

export function isContainerElement (element) {
    const type = element.type
    return type === 'Box' || type === 'Button' || type === 'Image' || type === 'ChildrenToggle' || type === 'Repeater' || type === 'DynamicContainer' || type === 'ContainerDropDown'
}

/**
 * Check if the child can be nested in a parent
 * @param {} child The child to be nested
 * @param {*} parent The parent to receiveo
 */
export function canBeChild (child, parent) {
 
    /**
     * Costum widgets cannot have children
     */
    if (parent.props && parent.props.customComponent) {
        return false
    }
    /**
     * Box likes element can always have children
     */
    if (isContainerElement(parent)) {
        return true
    }
    /**
     * Input elements can have labels embedded. This is needed to attach the label later
     */
    if (isInputElement(parent) && child.type === 'Label') {
        return true
    }

    return false
}

/**
 * Determine if the grid is collection
 * of stacked rows. This is true of arwew no overlaps
 */
export function hasRowLayout(widget){
    if (widget){
        let nodes = widget.children
        let length = nodes.length
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                let a = nodes[i]
                let b = nodes[j]
                if (a.id !== b.id) {
                    if (isOverLappingY(a,b)) {
                        return false
                    }
                }
            }
        }
    }
    return true
}


export function isWrappedContainer(e) {
    return e.style.wrap || e.style.layout === 'Wrap'
}

export function isAutoLayoutSpaceBetween(e) {
    return e.layout && e.layout.justifyContent === 'space-between'
}


export function isGridContainer(e) {
    return e.style.grid
}

export function isDesignSystemRoot(e) {
    return e.isDesignSystemRoot
}

export function isRepeater(e) {
    if (e) {
        return e.type === 'Repeater'
    }
    return false
}

export function hasComponentScreenParent (e) {
    return e.hasComponentScreenParent
}

export function isRepeaterAuto (e) {
    if (e.type === 'Repeater' && e.props.layout == 'grid' && e.props.auto === true) {
        return true
    }
    return false
}


export function isFixedPosition (widget) {
    return widget.style.fixed && widget.type !== 'Screen'
}

export function isRepeaterGrid (e) {
    if (e.type === 'Repeater' && e.props.layout === 'grid') {
        return true
    }
    return false
}

export function isBlock(e) {
    return e && e.style && e.style.display === 'block'
}

export function hasParentRepeaterGrid (e) {
    if (e.parent) {
        return isRepeaterGrid(e.parent)
    }
    return false
}

/**
 * Determine if the grid is collection
 * of stacked rows. This is true of arwew no overlaps
 */
export function isRowGrid(widget){
    //console.debug('DEPREACTED isRowGrid()')
    if (widget){
        let nodes = widget.children
        let length = nodes.length
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                let a = nodes[i]
                let b = nodes[j]
                if (a.id !== b.id) {
                    if (isOverLappingY(a,b)) {
                        return false
                    }
                }
            }
        }
    }
    return true
}




export function isOverLappingX(pos, box) {
    return !isLeft(pos, box) && !isRight(pos, box);
}

export function isOverLappingY(pos, box) {
    return !isTop(pos, box) && !isBottom(pos, box);
}

export function  isTop(from, to) {
    return (from.y) >= (to.y + to.h);
}

export function  isStartingTop(from, to) {
    return (from.y) >= (to.y); // && (from.y + from.h) <= (to.y + to.h);
}

export function  isBottom(from, to) {
    return (from.y + from.h) <= (to.y);
}

export function  isLeft(from, to) {
    return (from.x) > (to.x + to.w);
}

export function isStartingLeft(from, to) {
    return (from.x) >= (to.x);
}

export function isRight(from, to) {
    return (from.x + from.w) < (to.x);
}

export function isFixedHorizontal(e) {
    return e.props && e.props.resize && e.props.resize.fixedHorizontal
}

export function isHugHorizontal(e) {
    return e.props && e.props.resize && e.props.resize.hugHorizontal === true
}

export function isHugVerticall(e) {
    return e.props && e.props.resize && e.props.resize.hugVertical === true
}

export function isFixedVertical(e) {
    if (e.type === 'Box' || e.type === 'Button' || e.type === 'Label' ||
        e.type === 'Container' || e.type === 'Repeater' ||
        (e.children && e.children.length > 0)
    ) {
        return e.props && e.props.resize && e.props.resize.fixedVertical
    }
    return true
}

export function isPinnedLeft(e) {
    return e.props && e.props.resize && e.props.resize.left
}

export function isPinnedRight(e) {
    return e.props && e.props.resize && e.props.resize.right
}

export function isPinnedUp(e) {
    return e.props && e.props.resize && e.props.resize.up
}

export function isPinnedDown(e) {
    return e.props && e.props.resize && e.props.resize.down
}

export function isFullWidth (e) {
    return e.props && e.props.resize && e.props.resize.fullWidth
}

export function isSingleChildInRow() {
    //if (e.parent){
    //   let inSameRow = e.parent.children.filter(c => c.r === e.r)
    //   console.debug('isSIngleChild', e.name, e.parent.name, inSameRow)
    //    //return inSameRow.length === 1
    //}
    return false
}

/*
export function isAtBottom(element, model, threshold = 10) {
    if (element && model.screenSize) {
        let dif = getDistanceFromScreenBottom(element, model)
        return dif < threshold
    }
    return false
}
*/

export function getDistanceFromScreenBottom(element, model, parentScreen) {
    if (element && model.screenSize && parentScreen) {
        let h = Math.min(parentScreen.h, model.screenSize.h)
        let dif = h - (element.y + element.h)
        return dif;
    }
    return 0
}


export function isCentered (e) {
    if (e.parent) {
        let dif = e.parent.w - (2 * e.x + e.w)
        // We have a minimum threshold of 3px
        return Math.abs(dif) < Math.max(3, e.parent.w * 0.003)
    }
    return false
}

export function getClickLine(element) {
    if (element.lines) {
        return element.lines.find(l => l.event === 'click')
    }
    return null
}

export function getLineByType(element, type) {
    if (element.lines) {
        return element.lines.find(l => l.event === type)
    }
    return null
}



export function allChildrenAreFixedHorizontal(children) {
    let fixedChildren = children.filter(f => {
        return f.props && f.props.resize && f.props.resize.fixedHorizontal
    })
    return fixedChildren.length === children.length
}

export function isOverlay(screen) {
    return screen.style && screen.style.overlay
}

export function isComponentSet (e) {
    return e.figmaType === 'COMPONENT_SET'
}

export function isChildrenToggle(e) {
    return e.type === 'ChildrenToggle' || e.smartContainerType === 'ChildrenToggle'
}

export function hasOverlayBackground(screen) {
    return screen.style && screen.style.hasBackground
}

export function hasMinMaxWdith(screen) {
    return screen.style !== undefined && (screen.style.minWidth > 0 || screen.style.maxWidth > 0)
}


export function getImages (app) {
    let images = []
    let urls = {}
    Object.values(app.widgets).forEach(w => {
        if (w.style && w.style.backgroundImage) {
            let backgroundImage = w.style.backgroundImage
            let url = getImageLocation(w, backgroundImage.url)
            if (!urls[url]) {
                images.push({
                    name: url,
                    type: 'images',
                    id: w.id,
                    src: backgroundImage.url,
                })
                urls[url] = true
            }
        }
    })
    Object.values(app.screens).forEach(w => {
        if (w.style && w.style.backgroundImage) {
            let backgroundImage = w.style.backgroundImage
            let url = getImageLocation(w, backgroundImage.url)
            if (!urls[url]) {
                images.push({
                    name: url,
                    type: 'images',
                    id: w.id,
                    src: backgroundImage.url,
                })
                urls[url] = true
            }
        }
    })
    return images
}

export function getImageLocation(w, url) {
    let parts = url.split('/')
    if (parts.length === 2) {
        return parts[1]
    }
    return url
}

export function removeCommonPath (a, b) {
    let path = []
    let aParts = a.split('/')
    let bParts = b.split('/')
    let different = false
    aParts.forEach((p, i) => {
        if (p !== bParts[i] || different) {
            path.push(p)
            different = true
        }
    })
    return path.join('/')
}




/**
 * Generates the css for a given screen. Includes the styles for the screen and all
 * its children. Certain elements, like common, might be excluded.
 *
 * @param {*} screen The screen to genearte for
 * @param {*} code The code object with the styles
 * @param {*} exclude An array of types to be exluded, e.g ['template']
 */
export function getScreenCSS (screen, code, exclude) {
    let css = ''
    let normalize = code.styles['$NORMALIZE']
    if (normalize) {
        css += normalize.map(s => s.code).join('\n')
    }
    css += screen.styles.map(s => s.code).join('\n')
    let elements = getAllChildrenForScreen(screen)
    let written = []
    elements.forEach(element => {
        let styles = code.styles[element.id]
        if (exclude) {
            styles = styles.filter(s => exclude.indexOf(s.type) < 0)
        }
        styles.forEach(s => {
            if (!written[s.css]) {
                css += s.code + '\n'
                written[s.css] = true
            }
        })
        // css += styles.map(s => s.code).join('\n')
    })
    return css
}

export function getAllChildrenForScreen(screen) {
    const result = []
    if (screen.model.children) {
        screen.model.children.forEach(child => {
            result.push(child)
            getAllChildren(child, result)
        });
    }
    if (screen.model.fixedChildren){
        screen.model.fixedChildren.forEach(child => {
            result.push(child)
        })
    }
    return result
}

export function fixAutos (style, widget) {
    if (style.fontSize === 'Auto') {
        style.fontSize = widget.h
    }
    return style
}

/**
 * FIX for old models without z-value
 */
function fixMissingZValue (box) {
    if (box.z === null || box.z === undefined) {
        box.z = 0;
    }
}

/**
 * Get children
 */
export function getOrderedWidgets (widgets) {
    var result = [];
    for (var id in widgets) {
        var widget = widgets[id];
        if (widget) {
            fixMissingZValue(widget);
            result.push(widget);
        }
    }
    sortWidgetList(result);
    return result;
}


/**
 * This method is super important for the correct rendering!
 *
 * We sort by:
 *
 *  1) style.fixed: fixed elements will be renderd last, therefore they come
 *  as the last elements in the list
 *
 * 	2) inherited : inherited values come first. They shall be rendered below the
 *  widget of the new screen
 *
 *  3) z : High z values come later
 *
 *  4) id: if the z value is the same, sort by id, which means the order the widgets have been
 *  added to the screen.
 */
export function sortWidgetList (result) {
    /**
     * Inline function to determine if a widget is fixed.
     * we have to check if style exists, because the Toolbar.onToolWidgetLayer()
     * call the method without styles.
     */
    var isFixed = function(w) {
        if (w.style && w.style.fixed) {
        return true;
        }
        return false;
    };

    result.sort(function(a, b) {
        var aFix = isFixed(a);
        var bFix = isFixed(b);

        /**
         * 1) Sort by fixed. If both are fixed or not fixed,
         * continue sorting by inherited.
         */
        if (aFix == bFix) {
        /**
         * If both a inherited or not inherited,
         * continue sorting by z & id
         */
        if ((a.inherited && b.inherited) || (!a.inherited && !b.inherited)) {
            /**
             * 4) if the have the same z, sot by id
             */
            if (a.z == b.z && (a.id && b.id)) {
                return a.id.localeCompare(b.id);
            }

            /**
             * 3) Sort by z. Attention, Chrome
             * needs -1, 0, 1 or one. > does not work
             */
            return a.z - b.z;
        }
        if (a.inherited) {
            return -1;
        }

        return 1;
        }
        if (aFix) {
        return 1;
        }
        return -1;
    });
}

export function getAllChildren(node, result){
    if (node.children) {
       node.children.forEach(child => {
            result.push(child)
            getAllChildren(child, result)
        });
    }
}

export function isContainedInBox (obj, parent) {
    if (parent) {
        if (
            obj.x >= parent.x &&
            obj.x + obj.w <= parent.w + parent.x &&
            (obj.y >= parent.y && obj.y + obj.h <= parent.y + parent.h)
            ) {
            return true;
        }
    }
    return false;
}

export function getBoundingBoxByIds (ids, model) {
    let children = ids.map(id => {
        if (model.widgets && model.widgets[id]) {
            return model.widgets[id]
        } else {
            Logger.log(1, 'ExportUtil.getBoundingBoxByIds() > No child with id', id)
        }
        return null
    }).filter(child => child !== null)
    return getBoundingBoxByBoxes(children)
}

export function getBoundingBoxByBoxes (boxes) {

    const result = { x: 100000000, y: 100000000, w: 0, h: 0, z: 100000000, props: {resize: {}}, style: {}};

    for (var i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        result.x = Math.min(result.x, box.x);
        result.y = Math.min(result.y, box.y);
        result.w = Math.max(result.w, box.x + box.w);
        result.h = Math.max(result.h, box.y + box.h);
        result.z = Math.max(result.z, box.z);
        if (isFixedHorizontal(box)) {
            result.props.resize.fixedHorizontal = true
        }
        if (isFixedVertical(box)) {
            result.props.resize.fixedVertical = true
        }
    }

    result.h -= result.y;
    result.w -= result.x;
    return result;
}


export function createInheritedModel(model) {
    /**
     * Build lookup map for overwrites
     */
    var overwritenWidgets = {};
    for (let screenID in model.screens) {
        let screen = model.screens[screenID];
        overwritenWidgets[screenID] = {};
        for (let i = 0; i < screen.children.length; i++) {
            let widgetID = screen.children[i];
            let widget = model.widgets[widgetID];
            if (widget && widget.parentWidget) {
                overwritenWidgets[screenID][widget.parentWidget] = widgetID;
            }
        }
    }


    var inModel = clone(model);
    inModel.inherited = true;

    /**
     * add container widgets
     */
    createContaineredModel(inModel)

    /**
     * add widgets from parent (master) screens
     */
    for (let screenID in inModel.screens) {
        /**
         * *ATTENTION* We read from the org model, otherwise we have
         * issues in the loop as we change the screen.
         */
        let screen = model.screens[screenID];
        if (screen.parents && screen.parents.length > 0) {
            /**
             * add widgets from parent screens
             */
            for (let i = 0; i < screen.parents.length; i++) {
                let parentID = screen.parents[i];
                if (parentID != screenID) {
                    if (model.screens[parentID]) {
                        /**
                         * *ATTENTION* We read from the org model, otherwise we have
                         * issues in the loop as we change the screen!
                         */
                        let parentScreen = model.screens[parentID];

                        let difX = parentScreen.x - screen.x;
                        let difY = parentScreen.y - screen.y;

                        let parentChildren = parentScreen.children;
                        for (var j = 0; j < parentChildren.length; j++) {
                            let parentWidgetID = parentChildren[j];

                            /**
                             * *ATTENTION* We read from the org model, otherwise we have
                             * issues in the loop as we change the screen!
                             */
                            let parentWidget = model.widgets[parentWidgetID];
                            if (parentWidget) {
                                let overwritenWidgetID = overwritenWidgets[screenID][parentWidgetID];
                                if (!overwritenWidgetID) {
                                    let copy = clone(parentWidget);

                                    /**
                                     * Super important the ID mapping!!
                                     */
                                    copy.id = parentWidget.id + "@" + screenID;
                                    copy.inherited = parentWidget.id;
                                    copy.inheritedScreen = screenID;
                                    copy.inheritedOrder = i + 1;

                                    /**
                                     * Now lets also put it at the right position!
                                     */
                                    copy.x -= difX;
                                    copy.y -= difY;

                                    /**
                                     * We write the new widget to the inherited model!
                                     *
                                     */
                                    inModel.widgets[copy.id] = copy;
                                    inModel.screens[screenID].children.push(copy.id);

                                    /**
                                     * Also add a to the inherited copies
                                     * so we can to live updates in canvas
                                     */
                                    let parentCopy = inModel.widgets[parentWidget.id];
                                    if (!parentCopy.copies) {
                                        parentCopy.copies = [];
                                    }
                                    parentCopy.copies.push(copy.id);
                                } else {
                                    let overwritenWidget = inModel.widgets[overwritenWidgetID];

                                    if (overwritenWidget) {
                                        overwritenWidget.props = mixin(clone(parentWidget.props),overwritenWidget.props,true);
                                        overwritenWidget.style = mixin(clone(parentWidget.style),overwritenWidget.style,true);
                                        if (overwritenWidget.hover) {
                                            overwritenWidget.hover = mixin(clone(parentWidget.hover),overwritenWidget.hover,true);
                                        }
                                        if (overwritenWidget.error) {
                                            overwritenWidget.error = mixin(clone(parentWidget.error), overwritenWidget.error, true);
                                        }

                                        /**
                                         * Also add a reference to the *INHERITED* copies
                                         * so we can to live updates in canvas
                                         */
                                        let parentCopy = inModel.widgets[parentWidget.id];
                                        if (!parentCopy.inheritedCopies) {
                                            parentCopy.inheritedCopies = [];
                                        }
                                        parentCopy.inheritedCopies.push(overwritenWidget.id);

                                        /**
                                         * Also inherited positions
                                         */
                                        if (overwritenWidget.parentWidgetPos) {
                                            overwritenWidget.x = parentWidget.x - difX;
                                            overwritenWidget.y = parentWidget.y - difY;
                                            overwritenWidget.w = parentWidget.w;
                                            overwritenWidget.h = parentWidget.h;
                                        }
                                        overwritenWidget._inheried = true;
                                    } else {
                                        console.error("createInheritedModel() > No overwriten widget in model");
                                    }
                                }
                            } else {
                                //console.warn("createInheritedModel() > no parent screen child with id > " + parentID + ">" + parentWidget);
                            }
                        }

                        createInheritedGroups(inModel.screens[screenID], parentScreen, model, inModel)
                    } else {
                        console.warn("createInheritedModel() > Deteced Self inheritance...", screen);
                    }
                } else {
                    console.warn("createInheritedModel() > no parent screen with id > " + parentID);
                }
            }
        }
    }

    /**
     * Inline designtokens. must come last, otherwise master screen widgets are not correctly filled.
     */
    inModel = inlineModelDesignTokens(inModel)
    return inModel;
}

function createInheritedGroups (inScreen, parentScreen, model, inModel) {
    Logger.log(4, 'ExportUtil.createInheritedGroups()')
    let parentGroups = getAllGroupsForScreen(parentScreen, model)
    let widgetParentMapping = {}
    inScreen.children.forEach(widgetID => {
        let inheritedWidget = inModel.widgets[widgetID]
        if (inheritedWidget) {
            widgetParentMapping[inheritedWidget.inherited] = widgetID
        } else {
            Logger.log(4, 'ExportUtil.createInheritedGroups() > could not find widget', widgetID)
            //console.warn('createInheritedGroups() Could not find widget', widgetID)
        }
    })
    parentGroups.forEach(group => {
        let newGroup = {
            name: group.name + "_" + inScreen.name,
            id: group.id + "@" + inScreen.id,
            inherited: group.id,
            inheritedScreen: parentScreen.id,
            props: clone(group.props),
            style: clone(group.style),
            children: []
        }
        group.children.forEach(widgetID => {
            let inheritedID = widgetParentMapping[widgetID]
            if (inheritedID) {
                newGroup.children.push(inheritedID)
            } else {
                Logger.log(4, 'ExportUtil.createInheritedGroups() > could not parent widget', widgetID)
            }
        })
        if (inModel.groups) {
            inModel.groups[newGroup.id] = newGroup
        }
    })
}

export function createContaineredModel(inModel) {
    for (let screenID in inModel.screens) {
        let screen = inModel.screens[screenID];
        for (let i = 0; i < screen.children.length; i++) {
            let widgetID = screen.children[i];
            let widget = inModel.widgets[widgetID];
            if (widget) {
                if (widget.isContainer){
                    let children = getContainedChildWidgets(widget, inModel)
                    widget.children = children.map(w => w.id)
                }
            } else {
                /**
                 * FIXME: This can happen for screen copies...
                 */
                // console.warn('Core.createContaineredModel() > cannot find widgte', widgetID)
            }
        }
    }
}

function inlineModelDesignTokens (model) {
    /**
     * This is quite costly. Can we do this smarter? Maybe we could do it in the
     * RenderFactory (beawre of hover etc). Then we would have to just add here
     * for all the reference design token the modified?
     */
    if (model.designtokens) {
        for (let widgetID in model.widgets) {
            let widget = model.widgets[widgetID]
            inlineBoxDesignToken(widget, model)
        }
        for (let screenId in model.screens) {
            let scrn = model.screens[screenId]
            inlineBoxDesignToken(scrn, model)
        }
        /**
         * FIXME Add tempaltes
         */
    }
    return model
}

function inlineBoxDesignToken (box, model) {
    /**
     * If the box is templates, we copy all the designtokens from the template
     */
    if (box && box.template && model.templates && model.templates[box.template]) {
        let template = model.templates[box.template]
        if (template.designtokens) {
            /**
             * We could mix this in....
             */
            box.designtokens = template.designtokens
        }
    }
    if (box && box.designtokens) {
        let designtokens = box.designtokens
        for (let state in designtokens) {
            if (!box[state]) {
                box[state] = {}
            }
            let stateTokens = designtokens[state]
            for (let cssProp in stateTokens) {
                let designTokenId = stateTokens[cssProp]
                let designToken = model.designtokens[designTokenId]
                if (designToken) {
                    if (designToken.isComplex) {
                        box[state][cssProp] = designToken.value[cssProp]
                    } else {
                        box[state][cssProp] = designToken.value
                    }
                } else {
                    console.warn('ModelUtil.inlineBoxDesignToken() > NO token with id or no value:' + designTokenId, designToken)
                }
            }
        }
    }
    return box
}


export function copyTemplateStyles(model) {
    if (model.templates) {
        for (let widgetID in model.widgets){
            let widget = model.widgets[widgetID]
            if (widget.template) {
                let template = model.templates[widget.template]
                widget._template = template
            }
        }
    }
    return model
}

export function inlineTemplateStyles (model) {
    for (let widgetID in model.widgets){
        let widget = model.widgets[widgetID]
        if (widget.template) {
            /**
             * FIXME: What about style?
             */
            let style = this.getTemplatedStyle(widget, model, 'style')
            if (style) {
                widget.style = style
            }
            let hover = this.getTemplatedStyle(widget, model, 'hover')
            if (hover) {
                widget.hover = hover
            }
            let error = this.getTemplatedStyle(widget, model, 'error')
            if (error) {
                widget.error = error
            }
            let focus = this.getTemplatedStyle(widget, model, 'focus')
            if (focus) {
                widget.focus = focus
            }
            let active = this.getTemplatedStyle(widget, model, 'active')
            if (active) {
                widget.active = active
            }

            console.debug(widget)
        }

    }
    return model
}

export function getTemplatedStyle(widget, model, prop) {
    if (widget.template) {
        if (model.templates) {
            var t = model.templates[widget.template];
            console.debug(t)
            if (t && t[prop]) {
                /**
                 * Merge in overwriten styles
                 */
                var merged = clone(t[prop])
                if (widget[prop]) {
                    let props = widget[prop]
                    for (var key in props) {
                        merged[key] = props[key]
                    }
                }
                return merged;
            }
        }
    }
    return widget[prop];
}


function getContainedChildWidgets (container, model) {
    let result = []
    /*
     * Loop over sorted list
     */
    let sortedWidgets = getOrderedWidgets(model.widgets)
    let found = false
    for (let i = 0; i < sortedWidgets.length; i++){
        let widget = sortedWidgets[i]
         if (container.id != widget.id) {
            if (found && isContainedInBox(widget, container)){
                widget.container = container.id
                result.push(widget)
            }
        } else {
            found = true
        }
    }
    return result;
}

export function addContainerChildrenToModel (model) {
    /**
     * Add here some function to add the virtual children, so that stuff
     * works also in the analytic canvas. This would mean we would have to
     * copy all the code from the Repeater to here...
     */
    return model
}


export function mixin(a, b, keepTrack) {
    if (a && b) {
        b = clone(b);
        if (keepTrack) {
            b._mixed = {};
        }

        for (var k in a) {
            if (b[k] === undefined || b[k] === null) {
                b[k] = a[k];
                if (keepTrack) {
                    b._mixed[k] = true;
                }
            }
        }
    }
    return b;
}

export function mixinNotOverwriten(a, b) {
    if (a && b) {
        var mixed = {};
        if (b._mixed) {
            mixed = b._mixed;
        }
        //console.debug("mixinNotOverwriten", overwriten)
        for (var k in a) {
            if (b[k] === undefined || b[k] === null || mixed[k]) {
                b[k] = a[k];
            }
        }
    }
    return b;
}

export function clone (obj) {
    if (!obj) {
        return null
    }
    let _s = JSON.stringify(obj)
    return JSON.parse(_s)
}


export function getLines (widget, model) {
    var result = [];

    if(widget.inherited && model.widgets[widget.inherited]){
        widget = model.widgets[widget.inherited];
    }

    var widgetID = widget.id;
    var lines = getFromLines(widget, model);
    if(lines && lines.length > 0){
        return lines;
    }

    var group = getParentGroup(widgetID, model);
    if(group){
        var groupLine = getFromLines(group, model);
        if(groupLine && groupLine.length > 0){
            return groupLine;
        }
    }

    /**
     * Since 2.1.3 we use might have sub groups.
     */
    var topGroup = getTopParentGroup(widgetID, model);
    if(topGroup){
        let groupLine = getFromLines(topGroup, model);
        if(groupLine && groupLine.length > 0){
            return groupLine;
        }
    }

    return result;
}

export function getTopParentGroup (id, model) {
    let group = getParentGroup(id, model)
    if (group) {
        while (group) {
            let parent = getParentGroup(group.id, model)
            if (parent) {
                group = parent
            } else {
                /**
                 * In contrast the the Layout copz of this, we do not add
                 * all children... not sure it this is needed
                 */
                return group
            }
        }
    }
    return null
}

export function getParentGroup (widgetID, model) {
    if (model.groups) {
        for (var id in model.groups) {
            var group = model.groups[id];
            var i = group.children.indexOf(widgetID);
            if (i > -1) {
                return group;
            }
            /**
             * Since 2.13 we have subgroups and check this too
             */
            if (group.groups) {
                let i = group.groups.indexOf(widgetID);
                if (i > -1) {
                    return group;
                }
            }
        }
    }
    return null;
}

export function getGroup (widgetID, model) {
    if (model.groups) {
        for (var id in model.groups) {
            var group = model.groups[id];
            var i = group.children.indexOf(widgetID);
            if (i > -1) {
                return group;
            }
        }
    }
}

export function getAllGroupChildren(group, model) {
    if (!group.children) {
        return []
    }
    let result = group.children.slice(0)
    /**
     * Check all sub groups
     */
    if (group.groups) {
        group.groups.forEach(subId => {
            let sub = model.groups[subId]
            if (sub) {
                let children = getAllGroupChildren(sub, model)
                result = result.concat(children)
            } else {
                console.warn('getAllGroupChildren() No sub group', subId)
            }
        })
    }
    return result
}


export function getAllChildrenWithPosition (group, result = []) {

    if (group.children) {
        group.children.forEach(child => {
            // groups might not have been defined with the width!
            if (child.x != undefined) {
                result.push(child)
            }
            getAllChildrenWithPosition(child, result)
        })
    }

    return result
}

export function getAllGroupsForScreen(screen, model) {
    let result = {}

    screen.children.forEach(widgetID => {
        let group = getGroup(widgetID, model)
        if (group) {
            result[group.id] = group
        }
    })

    return Object.values(result)
}

function getFromLines (box, model) {
    var result = [];
    for (var id in model.lines) {
        var line = model.lines[id];
        if (line.from == box.id) {
            result.push(line);
        }
    }
    return result;
}

export function getBoxById (id, model) {
    if (model.screens[id]) {
        return model.screens[id]
    }
    if (model.widgets[id]) {
        return model.widgets[id]
    }
}


export function print(screen, grid = false, hasXY=false) {
    let res = []

    printElement(res, screen, '', grid, hasXY)
    screen.fixedChildren.forEach(e => {
        let pos = grid ? ` > col: ${e.gridColumnStart} - ${e.gridColumnEnd} > row: ${e.gridRowStart} - ${e.gridRowEnd}` : ''
        let xw = hasXY ? `${e.x} - ${e.w}` : ''
        let actions ='' // e.lines ? ' -> ' + e.lines.map(l => l.event + ':' + l.screen.name) : ''
        res.push(`  ${e.name}*  ${pos} ${xw} ${actions} `)
    })
    return res.join('\n')
}

function printElement(res, e, space='', grid, hasXY =true) {
    let actions ='' // e.lines ? ' -> ' + e.lines.map(l => l.event + ':' + l.screen.name) : ''
    ///let parent = e.parent ? e.parent.name + ' '  + e.parent.id :  "null"
    let pos = grid ? ` > col: ${e.gridColumnStart} - ${e.gridColumnEnd} > row: ${e.gridRowStart} - ${e.gridRowEnd}` : ''

    let xw = hasXY ? `${e.x} - ${e.w}` : ''
    res.push(`${space}${e.name} - (${e.layout})  ${pos} ${xw} ${actions} `)
    if (e.children) {
        e.children.forEach(c => {
            printElement(res, c, space + '  ', grid)
        });
    }
}


export function getElementsAsRows (nodes) {
    let rows = []
    let row
    let lastRowId = null
    nodes.forEach(n => {
        let rowId = n.row ? n.row : '-1'
        if (rowId != lastRowId) {
            row = []
            rows.push(row)
        }
        row.push(n)
        lastRowId = rowId
    })
    return rows
}

export function setCSSClassNames(parent, screenName) {
	let name = parent.name
	name = name.replace(/\./g, "_")
	if (name.match(/^\d/)) {
		name = "q" + name
	}
    parent.cssScreen = `${screenName.replace(/\s+/g, "_")}`
	parent.cssClass = `${name.replace(/\s+/g, "_")}`

    let cssSelector = `.${name.replace(/\s+/g, "_")}`
	if (parent.parent) {
		cssSelector = `.${screenName.replace(/\s+/g, "_")} ${cssSelector}`
	} else {
		cssSelector = `.qux-screen${cssSelector}`
	}
	parent.cssSelector = cssSelector


	if (parent && parent.children) {
		parent.children.forEach((c) => {
			setCSSClassNames(c, screenName)
		})
	}
	if (parent && parent.fixedChildren) {
		parent.fixedChildren.forEach((c) => {
			setCSSClassNames(c, screenName)
		})
	}
}

export function stringToType (value) {
    if (value === 'true') {
        value = true
    }
    if (value === 'false') {
        value = false
    }
    return value
}

export function getAutoPaddingHorizontal (widget) {
    if (widget.layout && widget.layout.paddingLeft >= 0 &&  widget.layout.paddingRight >= 0) {
        let l = widget.layout
        return l.paddingLeft + l.paddingRight
    }
    return 0
}