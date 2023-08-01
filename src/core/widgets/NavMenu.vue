<template>
    <div class="MatcWidgetTypeDropDown">
        <div data-dojo-attach-point="button" class="MatcWidgetTypeDropDownCntr">
            <div class="MatcWidgetTypeDropDownLabelCntr" data-dojo-attach-point="labelCntr">
                <div data-dojo-attach-point="labelNode" class="MatcWidgetTypeDropDownLabel"></div>
            </div>
            <div data-dojo-attach-point="caretCnr" class="MatcWidgetTypeDropDownCarretCntr">
                <span data-dojo-attach-point="caret" class="MatcWidgetTypeDropDownCarret"></span>
            </div>
        </div>
        <div class="MatcWidgetTypeDropDownPopUp" role="menu" data-dojo-attach-point="popup"></div>
    </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import topic from "dojo/topic";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
    name: "DropDown",
    mixins: [UIWidget, DojoWidget],
    data: function () {
        return {
            value: false,
            hoverAnimationDuration: 0
        };
    },
    components: {},
    methods: {
        postCreate() {
            this._borderNodes = [this.button, this.popup];
            this._shadowNodes = [this.button];
            this._backgroundNodes = [this.button];
            this._paddingNodes = [this.button];
            this.cleanUpTempListener();
            this._isOpen = false;
        },

        wireEvents() {
            this.own(this.addClickListener(this.domNode, lang.hitch(this, "onOpenPopup")));
            this.own(on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver")));
            this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));
            this.wired = true;
        },


        getLabelNode () {
            return this.labelNode;
        },

        onDomMouseOver(e) {
            if (this.lastValidation) {
                if (this.model.hover && !this._isOpen) {
                    this.emitAnimation(
                        this.model.id,
                        this.hoverAnimationDuration,
                        this.model.hover
                    );
                }
            }

            this.emitMouseOver(e);
        },

        onDomMouseOut(e) {
            if (this.lastValidation) {
                if (this.model.hover && !this._isOpen) {
                    if (this.value && this.model.active) {
                        this.emitAnimation(
                            this.model.id,
                            this.hoverAnimationDuration,
                            this.model.active
                        );
                    } else {
                        this.emitAnimation(
                            this.model.id,
                            this.hoverAnimationDuration,
                            this.model.style
                        );
                    }
                }
            }
            this.emitMouseOut(e);
        },

        resize(box) {
            let s = 4;
            if (this.style.fontSize) {
                s = Math.floor(this.style.fontSize / 3);
            }

            if (this.caret && !this.model.props.icon) {
                const w = this._getBorderWidth(s) + "px";
                this.caret.style.borderLeftWidth = w;
                this.caret.style.borderRightWidth = w;
                this.caret.style.borderTopWidth = w;
            }

            if (this.icon) {
                this.icon.style.fontSize = box.h + "px";
                this.button.style.padding = "0px";
            }

            /**
             * Make sure carent
             */
            if (this.caretCnr) {
                // var border = this._getBorderWidth(s);
                const width = this._getBorderWidth(40);
                this.caretCnr.style.width = width + "px";
            }
        },

        render(model, style, scaleX, scaleY) {
            this.model = model;
            this.style = style;
            this._scaleX = scaleX;
            this._scaleY = scaleY;
            this.navigation = model.props.navigation

            if (model.props.popupPosition) {
                css.add(this.domNode, model.props.popupPosition);
            }

            this.renderIcon(model);

            if (this.model.props.caretBorderColor) {
                this.caret.style.color = style.background;
                this.caretCnr.style.background = style.borderRightColor;
            }

            this.setStyle(style, model);

            this.resize(model);

            if (style.iconSize && this.caret) {
                const s = Math.max(1, this.getZoomed(style.iconSize, this._scaleY));
                this.caret.style.fontSize = s + "px";
            }
            this.set_popupMargin(this.popup, style, model)
            this.setValue(model.props.label)
        },

        setSelected(items) {
            const selected = items.find((item) => item.selected)
            if (selected) {
                this.setValue(selected.label)
            }
        },

        renderIcon(model) {
            if (model.props.icon) {
                if (model.props.hidetext) {
                    this.labelCntr.innerHTML = "";

                    this.icon = document.createElement("span");
                    css.add(this.icon, "MatcWidgetTypeDropDownIcon " + model.props.icon);
                    this.labelCntr.appendChild(this.icon);

                    css.add(this.domNode, "MatcWidgetTypeDropDownWithIcon MatcWidgetTypeDropDownNoText");
                    this.button.style.padding = "0px";
                    this.button.style.borderRadius = "0px";

                    this.popup.style.width = this._getBorderWidth(200) + "px";

                    if (this.caretCnr) {
                        this.button.removeChild(this.caretCnr);
                        delete this.caretCnr;
                        delete this.caret;
                        delete this.labelNode;
                    }
                } else {
                    css.remove(this.caret, "MatcWidgetTypeDropDownCarret");
                    this.caret.style.border = "none";
                    css.add(this.caret, model.props.icon + " MatcWidgetTypeDropDownCarretIcon");
                }
            }
        },

        onOpenPopup(e) {
            this.stopEvent(e); 
            this.emitOpenPopup();
            this.renderPopup();
            this.initCompositeState(this.getStateOptions(), e);
            return false;
        },

        flushOpen() {
            this.emitCompositeState("openWithHover", this.getStateOptions());
        },

        onSimulatorEvent(type, screenID, widgetID) {
            if (
                type != "ScreenScroll" &&
                type != "Animation" &&
                type != "ScreenGesture" &&
                widgetID != this.model.id
            ) {
                this.cleanUp();
                this.emitNoTransitionStateChange("close", "");
            }
        },

        onSelect(item, e) {
            this.stopEvent(e);   
            this.cleanUp();
            if (item && item.to) {
                this.emit('navigation', item.to)
            }

            const event = {
                type: "select",
                value: item.to,
                runTransition: true,
                noheat: true,
                e: e
            };
            this.emit("stateChange", event);
        },

        onClose(e) {
            this.stopEvent(e);
            this.cleanUp();
            this.emitNoTransitionStateChange("close", "", e);
        },

        renderPopup() {
            if (!this._isOpen) {
                const db = new DomBuilder();
                this.optionNodes = [];
                const navigation = this.navigation;
                // const style = this.style;
                for (let i = 0; i < navigation.length; i++) {

                    const item = navigation[i];

                    const node = db
                        .div("MatcWidgetTypeDropDownOptionRow")
                        .build(this.popup);


                    if (item.icon) {
                        db.span('MatcWidgetTypeDropDownOptionIcon '+ item.icon).build(node)
                    }
                    db.div('MatcWidgetTypeDropDownOptionLabel', item.label).build(node)
             

                    node.style.paddingTop = this._getBorderWidth(this.style["paddingTop"]) + "px";
                    node.style.paddingLeft = this._getBorderWidth(this.style["paddingLeft"]) + "px";
                    node.style.paddingRight = this._getBorderWidth(this.style["paddingRight"]) + "px";
                    node.style.paddingBottom = this._getBorderWidth(this.style["paddingBottom"]) + "px";

                    // if (this.value == item.label) {
                    //     if (style.selectedOptionColor) {
                    //         node.style.color = style.selectedOptionColor;
                    //     }
                    //     if (style.selectedOptionBackground) {
                    //         node.style.background = style.selectedOptionBackground;
                    //     }
                    // }

                    if (this.wired) {
                        this.tempOwn(on(node, touch.press, lang.hitch(this, "onSelect", item)));
                        this.tempOwn(on(node, touch.over, lang.hitch(this, "onMouseOverOption", i)));
                    }
                    this.optionNodes.push(node);
                }

                css.add(this.domNode, "MatcWidgetTypeDropDownOpen");
                if (this.domNode.parentNode) {
                    css.add(this.domNode.parentNode, "MatcWidgetTypeDropDownFront");
                }

                if (this.wired) {
                    this.tempOwn(on(win.body(), touch.over, lang.hitch(this, "onMouseOutOption")));
                    this.tempOwn(on(win.body(), touch.press, lang.hitch(this, "onClose")));
                    this.tempOwn(topic.subscribe("MatcSimulatorEvent", lang.hitch(this, "onSimulatorEvent")));
                }

                if (this.model.focus) {
                    this.emitAnimation(this.model.id, 0, this.model.focus);
                }

                this._isOpen = true;
            }
        },

        _set_caretBackground(parent, style) {
            if (this.caretCnr) {
                this.caretCnr.style.background = style.caretBackground;
            }
        },

        _set_caretColor(parent, style) {
            if (this.caret) {
                this.caret.style.color = style.caretColor;
            }
            if (this.icon) {
                this.icon.style.color = style.caretColor;
            }
        },

        _set_popupShadow(parent, style) {
            this._setShadow(this.popup, style.popupShadow);
        },

        _set_popupBorderColor(parent, style) {
            this.popup.style.borderColor = style.popupBorderColor;
        },

        _set_popupBorderWidth(parent, style) {
            if (style.popupBorderWidth) {
                var w = Math.max(
                    1,
                    this.getZoomed(style.popupBorderWidth, this._scaleY)
                );
                this.popup.style.borderWidth = w + "px";
            } else {
                this.popup.style.borderWidth = "0px";
            }
        },

        _set_popupBackground(parent, style) {
            this.popup.style.background = style.popupBackground;
        },

        _set_popupColor(parent, style) {
            this.popup.style.color = style.popupColor;
        },

        set_popupMargin(parent, style, model) {
            if (model?.props?.hideUpperBorder) {

                if (model.props.popupPosition === 'MatcWidgetTypeDropDownPopUber') {
                    const borderTopWidth = this._getBorderWidth(style.borderTopWidth) + 1
                    parent.style.bottom = `calc(100% - ${borderTopWidth}px)`
                    parent.style.borderBottomWidth = '0px'
                    parent.style.borderBottomRightRadius = '0px'
                    parent.style.borderBottomLeftRadius = '0px'
                } else {
                    const borderBottomWidth = this._getBorderWidth(style.borderBottomWidth) + 1
                    parent.style.top = `calc(100% - ${borderBottomWidth}px)`
                    parent.style.borderTopWidth = '0px'
                    parent.style.borderTopRightRadius = '0px'
                    parent.style.borderTopLeftRadius = '0px'
                }
            }
        },

        onMouseOverOption(hover, e) {
            this.stopEvent(e);
            if (this.hover != hover) {
                this.setHoverOption(hover);
                this.addCompositeSubState(this.getStateOptions());
            }
        },

        onMouseOutOption() {
            if (this.selected != -1) {
                this.setHoverOption(-1);
                this.addCompositeSubState(this.getStateOptions());
            }
        },

        setHoverOption(hover) {
            if (this.optionNodes) {
                if (this.hover != hover) {
                    const style = this.style;
                    for (let i = 0; i < this.optionNodes.length; i++) {
                        let node = this.optionNodes[i];                       
                        if (i === hover) {
                            if (style.selectedOptionColor) {
                            node.style.color = style.selectedOptionColor;
                            }
                            if (style.selectedOptionBackground) {
                                node.style.background = style.selectedOptionBackground;
                            }
                        } else {
                            node.style.color = style.popupColor;
                            node.style.background = style.popupBackground;
                        }
                    }                   
                }
                this.hover = hover;
            }
        },

        cleanUp() {
            this.cleanUpTempListener();

            this.cleanUpPopup();

            if (this.model.focus && this.lastValidation) {
                this.emitAnimation(this.model.id, 0, this.model.style);
            }
        },

        cleanUpPopup() {
            if (this._isOpen) {
                /**
                 * After some changes in the canvas this can somehow fail
                 */
                if (this.popup) {
                    this.popup.innerHTML = "";
                } else {
                    console.warn(
                        "DropDown.cleanUp() > Called in wrong state. Popup is null"
                    );
                }

                delete this.optionNodes;

                if (this.domNode) {
                    css.remove(this.domNode, "MatcWidgetTypeDropDownOpen");
                }

                this.hover = -1;
                this._isOpen = false;

                this.flushOpen();
            }
        },

        getValue() {
            return this.value;
        },

        /**
         * Can be overwritten by children to have proper type conversion
         */
        _setDataBindingValue(v) {
            var options = this.model.props.options;
            if (options) {
                if (isNaN(v)) {
                    var i = options.indexOf(v);
                    if (i >= 0 && i < options.length) {
                        v = options[i];
                        this.setValue(v);
                    }
                } else {
                    if (v >= 0 && v < options.length) {
                        v = options[v];
                        this.setValue(v);
                    }
                }
            }
        },

        setValue(value) {
            this.value = value;          
            if (this.labelNode) {
                this.setTextContent(this.labelNode, this.value);
            }
        },

        getStateOptions() {
            return {
                hover: this.hover
            };
        },

        getState() {
            return {
                type: "select",
                value: this.value
            };
        },

        setState(state, t) {
            if (state) {
                const type = state.type;

                switch (type) {
                    case "select":
                        this.setValue(state.value);
                        /**
                         * And set selected??
                         */
                        setTimeout(lang.hitch(this, "cleanUp"), 200);
                        break;
                    case "close":
                        this.cleanUp();
                        break;

                    case "open":
                        this.renderPopup();
                        break;

                    case "openWithHover":
                        this.renderPopup();

                        if (state.children) {
                            var substate = this.getLastSubState(state, t);
                            if (substate) {
                                var options = substate.value;
                                this.setHoverOption(options.hover);
                            }
                        }
                        break;

                    default:
                        this.cleanUp();
                        break;
                }
            } else {
                this.cleanUp();
            }
        },

        _validateValue(value) {
            const validation = this.model.props.validation;
            if (validation) {
                if (validation.required && value === this.model.props.options[0]) {
                    return false;
                }
            }
            return true;
        },

        isValid(showError) {
            return this.validate(this.value, showError);
        },

        beforeDestroy() {
            this.cleanUp();
        }
    },
    mounted() { }
};
</script>