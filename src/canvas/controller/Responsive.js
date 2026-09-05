import Snapp from './Snapp'
import lang from '../../dojo/_base/lang'
import ResponsiveLayout from '../../core/responsive/ResponsiveLayout'
import ModelGeom from '../../core/ModelGeom'



export default class Responsive extends Snapp {


    updateLayoutContainerChange(oldWidget) {
        const widget = this.model.widgets[oldWidget.id];
        const isGridChange = widget && widget.type === "GridContainer" && this.gridPropsHaveChanged(oldWidget, widget)
        const isFlexChange = widget && widget.type === "FlexContainer" && this.flexPropsHaveChanged(oldWidget, widget)
        if (isGridChange || isFlexChange) {
            this.logger.log(-1, "updateLayoutContainerChange", widget.type + " changed, check for layout change");

            // create a resize model
            let childrenIDs = ModelGeom.getChildWidgetsIDs(this.model, widget)
            childrenIDs.push(widget.id) // add the container itself

            const resizeModel = {
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
                children: childrenIDs
            }

            // create model with old widget
            const oldModel = {
                widgets: {},
                screens: this.model.screens,
                groups: this.model.groups,
            }
            childrenIDs.forEach(id => {
                oldModel.widgets[id] = lang.clone(this.model.widgets[id]);
            })
            oldModel.widgets[oldWidget.id] = oldWidget;


            // call responsiveLayout
            const responsiveLayouter = new ResponsiveLayout(1)
            responsiveLayouter.initSelection(oldModel, resizeModel, resizeModel.children, true, true, false)

            // hackinto the treeModel and update all the props of the container
            const treeWidget = responsiveLayouter.findWidget(widget.id)
            if (!treeWidget) {
                this.logger.error("updateLayoutContainerChange", "No treeWidget found for " + widget.id);
                return
            }
            treeWidget.props = lang.clone(widget.props);
            treeWidget.style = lang.clone(widget.style);

            const newPositions = this.getResponsiveResizePositions(widget, widget, childrenIDs, responsiveLayouter)

            let errorCount = 0;
            for (let id in newPositions) {
                const pos = newPositions[id];
                const widget = this.model.widgets[id];
                // check here that this is a valid change, e.g. if columsn are redduced or so
                if (widget) {
                    widget.modified = new Date().getTime()
                    if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                        widget.x = pos.x;
                        widget.y = pos.y;
                        widget.w = pos.w
                        widget.h = pos.h;
                    } else {
                        errorCount++
                    }
                } else {
                    console.warn('updateMultiWidgetSizeResponsive() > no widget', id)
                }
            }

            if (errorCount > 0) {
                this.showError("Not all elements could be resized.")
            }

            this.render();
            return newPositions
        }
    }

    gridPropsHaveChanged(widget, oldWidget) {
        return widget.props.columns != oldWidget.props.columns ||
            widget.props.columnGap != oldWidget.props.columnGap ||
            widget.style.paddingLeft != oldWidget.style.paddingLeft ||
            widget.style.paddingRight != oldWidget.style.paddingRight ||
            widget.style.borderLeftWidth != oldWidget.style.borderLeftWidth ||
            widget.style.borderRightWidth != oldWidget.style.borderRightWidth ||
            this.arrayPropHasChanged(widget.props.columnWidths, oldWidget.props.columnWidths) ||

            widget.props.rows != oldWidget.props.rows ||
            widget.props.rowGap != oldWidget.props.rowGap ||
            widget.style.paddingTop != oldWidget.style.paddingTop ||
            widget.style.paddingBottom != oldWidget.style.paddingBottom ||
            widget.style.borderBottomWidth != oldWidget.style.borderBottomWidth ||
            widget.style.borderTopWidth != oldWidget.style.borderTopWidth ||
            this.arrayPropHasChanged(widget.props.rowHeights, oldWidget.props.rowHeights)
    }

    flexPropsHaveChanged(widget, oldWidget) {
        return widget.style.flexDirection != oldWidget.style.flexDirection ||
            widget.style.alignItems != oldWidget.style.alignItems ||
            widget.style.gap != oldWidget.style.gap ||
            widget.style.paddingLeft != oldWidget.style.paddingLeft ||
            widget.style.paddingRight != oldWidget.style.paddingRight ||
            widget.style.paddingTop != oldWidget.style.paddingTop ||
            widget.style.paddingBottom != oldWidget.style.paddingBottom ||
            widget.style.borderLeftWidth != oldWidget.style.borderLeftWidth ||
            widget.style.borderRightWidth != oldWidget.style.borderRightWidth ||
            widget.style.borderTopWidth != oldWidget.style.borderTopWidth ||
            widget.style.borderBottomWidth != oldWidget.style.borderBottomWidth
    }

    arrayPropHasChanged(a, b) {
        return (a || []).join(',') !== (b || []).join(',')
    }


    updateLayoutContainers(layoutContainerChange, movedIds) {
        if (!layoutContainerChange || (!layoutContainerChange.start && !layoutContainerChange.end)) {
            this.logger.log(-1, "updateLayoutContainers", "exit > NO CHANGE");
            return false
        }
        this.logger.log(-1, "updateLayoutContainers", "enter > ", layoutContainerChange, movedIds);

        const ids = movedIds || []
        const startId = layoutContainerChange.start && layoutContainerChange.start.id
        const endId = layoutContainerChange.end && layoutContainerChange.end.id

        /**
         * The widget could have been moved out of "start" into "end", so
         * both containers lost/gained a child and need to be freshly laid out.
         * If start and end are the same container, this just re-layouts it once,
         * without touching the moved widget's containment, since it never left.
         */
        if (startId && startId === endId) {
            this.layoutContainer(startId)
        } else {
            if (endId) {
                /**
                 * On a small/imprecise drop, the widget might only partially
                 * overlap "end" and fail the strict full-containment check that
                 * decides real flex membership (see ModelGeom.isFullContained/
                 * getChildWidgetsIDs). Snap it fully inside first, so it is
                 * genuinely nested under the container and gets laid out with
                 * the rest, instead of being silently left out.
                 */
                this.layoutContainer(endId)
            }
            if (startId) {
                // the widget left "start": exclude it even if it is still
                // geometrically borderline-contained (e.g. rounding)
                this.layoutContainer(startId, ids)
            }
        }

        return true
    }

    // snapWidgetsIntoContainer(container, ids) {
    // 	if (!container) {
    // 		return
    // 	}
    // 	ids.forEach(id => {
    // 		const widget = this.model.widgets[id]
    // 		if (widget && !ModelGeom.isFullContained(container, widget)) {
    // 			widget.x = Math.max(container.x, Math.min(widget.x, container.x + container.w - widget.w))
    // 			widget.y = Math.max(container.y, Math.min(widget.y, container.y + container.h - widget.h))
    // 		}
    // 	})
    // }

    layoutContainer(id, excludeIds = []) {
        const widget = this.model.widgets[id];
        if (!widget || (widget.type !== "FlexContainer" && widget.type !== "GridContainer")) {
            this.logger.log(-1, "layoutContainer", "exit > no widget or not a layout container > " + id);
            return
        }

        // create a resize model based on the widgets currently contained in the container
        let childrenIDs = ModelGeom.getChildWidgetsIDsFast(this.model, widget)
        if (excludeIds.length > 0) {
            childrenIDs = childrenIDs.filter(cid => !excludeIds.includes(cid))
        }
        childrenIDs.push(widget.id) // add the container itself

        const resizeModel = {
            x: widget.x,
            y: widget.y,
            w: widget.w,
            h: widget.h,
            children: childrenIDs
        }

        // call responsiveLayout
        const responsiveLayouter = new ResponsiveLayout(1)
        responsiveLayouter.initSelection(this.model, resizeModel, resizeModel.children, true, true, false)

        const newPositions = this.getResponsiveResizePositions(widget, widget, childrenIDs, responsiveLayouter)

        let errorCount = 0;
        for (let cid in newPositions) {
            const pos = newPositions[cid];
            const childWidget = this.model.widgets[cid];
            if (childWidget) {
                childWidget.modified = new Date().getTime()
                if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                    childWidget.x = pos.x;
                    childWidget.y = pos.y;
                    childWidget.w = pos.w
                    childWidget.h = pos.h;
                } else {
                    errorCount++
                }
            } else {
                console.warn('layoutContainer() > no widget', cid)
            }
        }

        if (errorCount > 0) {
            this.showError("Not all elements could be resized.")
        }
    }

    /**
     * Layout one or more screens with ResponsiveLayout.
     *
     * params.screenId  - layout just this screen
     * params.pos       - layout whatever screen is currently hovered by this pos
     * params.positions - list of pos objects; layout every distinct screen hovered by any of them
     * none of the above resolves to a screen - layout ALL screens in the model
     */
    updateScreenLayout(params = {}) {
        console.debug(params)
        const { screenId, pos, positions, widget } = params;
        let targetScreens = [];
        if (screenId) {
            const screen = this.model.screens[screenId];
            if (screen) {
                targetScreens = [screen]
            }
        } else if (pos) {
            const screen = this.getHoverScreen(pos);
            if (screen) {
                targetScreens = [screen]
            }
        } else if (widget) {
            const screen = this.getHoverScreen(widget);
            if (screen) {
                targetScreens = [screen]
            }
        } else if (positions) {
            const screensById = {};
            positions.forEach(p => {
                const screen = this.getHoverScreen(p);
                if (screen) {
                    screensById[screen.id] = screen
                }
            })
            targetScreens = Object.values(screensById)
        }
        const screens = targetScreens.length > 0 ? targetScreens : Object.values(this.model.screens);
        this.logger.log(-1, "updateScreenLayout", "enter", targetScreens, screens)


        /**
         * TODO: If there is no taregt screen, there could be still a layout container
         */


        let allPositions = {};
        screens.forEach(screen => {
            const screenPositions = this.layoutScreen(screen)
            Object.assign(allPositions, screenPositions)
        })

        this.onModelChanged(Object.keys(allPositions).map(id => {
            return { type: 'widget', action: "change", "prop": "position", id: id }
        }))

        return allPositions
    }

    layoutScreen(screen) {
        if (!screen) {
            this.logger.log(-1, "layoutScreen", "exit > no screen");
            return {}
        }
        this.logger.log(-1, "layoutScreen", "enter", screen.name, screen)

        const hasFlexContainer = screen.children.some(id => this.model.widgets[id]?.type === "FlexContainer")
        if (!hasFlexContainer) {
            this.logger.log(-1, "layoutScreen", "exit > no FlexContainer in screen > " + screen.id);
            return {}
        }

        /**
         * Carry the screen's own style along, so ResponsiveLayout.initSelection()
         * treats this as "a screen" (isBoundingBoxScreen()) and keeps its x/y/w/h
         * as-is, instead of shrinking it down to the bounding box of its children
         * like it does for a plain container selection.
         */
        const resizeModel = {
            x: screen.x,
            y: screen.y,
            w: screen.w,
            h: screen.h,
            style: screen.style || {},
            children: screen.children
        }

        // call responsiveLayout
        const responsiveLayouter = new ResponsiveLayout(1)
        responsiveLayouter.initSelection(this.model, resizeModel, resizeModel.children, true, true, false)

        const newPositions = this.getResponsiveResizePositions(resizeModel, resizeModel, resizeModel.children, responsiveLayouter)

        let errorCount = 0;
        for (let id in newPositions) {
            const pos = newPositions[id];
            const widget = this.model.widgets[id];
            if (widget) {
                widget.modified = new Date().getTime()
                if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                    widget.x = pos.x;
                    widget.y = pos.y;
                    widget.w = pos.w
                    widget.h = pos.h;
                } else {
                    errorCount++
                }
            } else {
                console.warn('layoutScreen() > no widget', id)
            }
        }

        if (errorCount > 0) {
            this.showError("Not all elements could be resized.")
        }

        return newPositions
    }

}