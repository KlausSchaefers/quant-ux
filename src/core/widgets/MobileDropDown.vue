<template>
  <div class="MatcWidgetTypeDropDown">
    <div data-dojo-attach-point="button" class="MatcWidgetTypeDropDownCntr">
      <div class="MatcWidgetTypeDropDownLabelCntr" data-dojo-attach-point="labelCntr">
        <div data-dojo-attach-point="label" class="MatcWidgetTypeDropDownLabel">F</div>
      </div>
      <div data-dojo-attach-point="caretCnr" class="MatcWidgetTypeDropDownCarretCntr">
        <span data-dojo-attach-point="caret" class="MatcWidgetTypeDropDownCarret"></span>
      </div>
    </div>
    <div class="MatcWidgetTypeDropDownPopUp" role="menu" data-dojo-attach-point="popup"></div>
  </div>
</template>
<script>
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import topic from "dojo/topic";
import win from "dojo/_base/win";
import domGeom from "dojo/domGeom";
import DomBuilder from "common/DomBuilder";
import DropDown from "core/widgets/DropDown";

export default {
  name: "MobileDropDown",
  mixins: [DropDown],
  data: function() {
    return {
      screenScrollTop: 0
    };
  },
  components: {},
  methods: {
    setScreenScroll (scrollTop) {
      this.screenScrollTop = scrollTop;
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onOpenPopup")));
      this.own(topic.subscribe("MatcSimulatorScrollEvent", lang.hitch(this, "setScreenScroll")));
      this.wireHover()
      this.wired = true;
    },

    onOpenPopup (e) {
      this.stopEvent(e);
      this.emitNoTransitionStateChange("open", this.screenScrollTop, e);
      this.renderMobilePopup(this.screenScrollTop);
      return false;
    },

    renderMobilePopup () {
      if (!this._isMobileOpen) {
        const screen = this.getScreenDiv();

        if (screen) {
          const db = new DomBuilder();
          this.mobileBackGround = db
            .div("MatchWidgetTypeDropDownMobilePopupBackground")
            .build(screen);

          const style = this.style;

          const popup = db.div("MatchWidgetTypeDropDownMobilePopup").build();
          if (style.popupShadow) {
            this._setShadow(popup, style.popupShadow);
          }

          if (style.popupBorderColor) {
            popup.style.borderColor = style.popupBorderColor;
          }

          if (style.popupBorderWidth) {
            var w = Math.max(1, this.getZoomed(style.popupBorderWidth, this._scaleY));
            popup.style.borderWidth = w + "px";
          }

          if (style.popupBackground) {
            popup.style.background = style.popupBackground;
          }

          if (style.popupColor) {
            popup.style.color = style.popupColor;
          }

          if (style.popupRadius) {
            popup.style.borderRadius =
              this._getBorderWidth(style.popupRadius) + "px";
          } else {
            popup.style.borderRadius = this._getBorderWidth(10) + "px";
          }

          const cntr = db
            .div("MatchWidgetTypeDropDownMobilePopupCntr")
            .build(popup);

          const fontSize = this._getBorderWidth(20) + "px";
          const padding = this._getBorderWidth(20) + "px";
          const radioSize = this._getBorderWidth(20) + "px";

          const optionNodes = [];
          const options = this.model.props.options;
          for (let i = 0; i < options.length; i++) {
            let option = options[i];
            let node = db.div("MatcWidgetTypeDropDownMobileOption", option).build(cntr);
            optionNodes.push(node);
            if (this.value == option) {
              css.add(node, "MatcWidgetTypeDropDownMobileOptionSelected");
            }

            node.style.padding = padding;
            node.style.fontSize = fontSize;

            if (style.optionBorderColor) {
              node.style.borderBottomColor = style.optionBorderColor;
            }

            if (style.optionBorderWidth) {
              let w = this._getBorderWidth(style.optionBorderWidth) + "px";
              node.style.borderBottomWidth = w + "px";
            }

            /**
             * Add a radio button to...
             */
            let radio = db.div("MatcWidgetTypeDropDownMobileRadio").build(node);
            db.div("MatcWidgetTypeDropDownMobileRadioCheck").build(radio);
            radio.style.height = radioSize;
            radio.style.width = radioSize;
            radio.style.top = padding;
            radio.style.right = padding;
            if (style.radioBorderColor) {
              radio.style.borderColor = style.radioBorderColor;
            }
            if (style.radioBackgroundColor) {
              radio.style.borderColor = style.radioBackgroundColor;
            }

            if (this.wired) {
              this.tempOwn(on(node, touch.press, lang.hitch(this, "onMobileOptionPress", option)));
              this.tempOwn(on(node, touch.release, lang.hitch(this, "onMobileOptionRelease", option, optionNodes, i)));
            }
          }

          this.mobileBackGround.appendChild(popup);

          /**
           *  Set position of the popup...
           */
          const popPos = domGeom.position(popup);
          // var screenPos = domGeom.position(screen);
          const cntrPos = Math.round(domGeom.position(cntr).h) + "px";

          /**
           * 1) Get offset from top and 10% or around center
           *
           * 2) Make popup 80% max. Center on element
           *
           * 3) Make inner list scrollable
           *
           * 4) log scrolling
           *
           * 5) Disable scrolling in simulator!
           */
          const app = this.factory.model;
          const screenHeight = app.screenSize.h;
          // var offsetY = Math.round(screenPos.h * scrollTop);
          const popupHeight = Math.round(Math.min(popPos.h, screenHeight * 0.8));
          const top = Math.round((screenHeight - popupHeight) / 2);
          popup.style.height = popupHeight + "px";
          popup.style.top = top + "px";

          /**
           * In view mode we have to render the cntr
           * with fixed height and relative to the scrolling
           * in setScroll will work
           */
          if (this.mode == "view") {
            cntr.style.height = cntrPos;
            cntr.style.position = "relative";
          }

          if (popupHeight < popPos.h - 5) {
            this._mobilePressHasScroll = true;
            css.add(cntr, "MatchWidgetTypeDropDownMobilePopupScroll");
          } else {
            this._mobilePressHasScroll = false;
          }

          if (this.wired) {
            this.tempOwn(on(this.mobileBackGround, touch.press, lang.hitch(this, "onClose")));
            this.tempOwn(on(win.body(), touch.press, lang.hitch(this, "onClose")));
            this.tempOwn(topic.subscribe("MatcSimulatorEvent", lang.hitch(this, "onSimulatorEvent")));
            this.tempOwn(on(cntr, "scroll", lang.hitch(this, "onPopupScroll", popupHeight)));
            topic.publish("MatcSimulatorPreventScroll", 0);
          }

          this._mobileCntr = cntr;
          this._mobilePopupHeight = popupHeight;
          this._mobilePopup = popup;
          this._isMobileOpen = true;

          topic.publish("MatcSimulatorRenderFixedPopup", this.mobileBackGround);

          setTimeout(() =>  {
            //css.add(popup, "MatchWidgetTypeDropDownMobilePopupShadow");
          }, 50);
        }
      }
    },

    onPopupScroll () {
      const value = this.getPopupScroll();
      if (!this._mobilePopupScrollInited) {
        this.initCompositeState(value);
        this._mobilePopupScrollInited = true;
      } else {
        this.addCompositeSubState(value);
      }
    },

    onMobileOptionPress (option, e) {
      this.stopPropagation(e);
      this._mobilePressStart = this.getMouse(e);

      if (!this._mobilePressHasScroll) {
        if (this._mobileMouseListener) {
          this._mobileMouseListener.remove();
        }
        this._mobileMouseListener = on(win.body(), touch.move, function(e) {
          e.preventDefault();
          return false;
        });
      }

      return false;
    },

    onMobileOptionRelease (option, nodes, selected, e) {
      this.stopPropagation(e);
      var end = this.getMouse(e);
      if (this._mobilePressStart) {
        if ( Math.abs(end.x - this._mobilePressStart.x) < 10 && Math.abs(end.y - this._mobilePressStart.y) < 10) {
          for (var i = 0; i < nodes.length; i++) {
            css.remove(nodes[i], "MatcWidgetTypeDropDownMobileOptionSelected");
          }
          css.add(nodes[selected], "MatcWidgetTypeDropDownMobileOptionSelected" );
          topic.publish("MatcSimulatorAllowScroll", 1);
          setTimeout(lang.hitch(this, "onSelect", option, e), 150);
        } else {
          console.debug("scroll gesture");
        }
        delete this._mobilePressStart;
      }
      return false;
    },

    cleanUpMobilePopup () {
      if (this._isMobileOpen) {
        this.emitCompositeState("popupScroll", this.getPopupScroll(), null);
        if (this.mobileBackGround && this.mobileBackGround.parentNode) {
          this.mobileBackGround.parentNode.removeChild(this.mobileBackGround);
        }
        delete this.mobileBackGround;
      }

      if (this._mobileMouseListener) {
        this._mobileMouseListener.remove();
      }
      delete this._mobileMouseListener;
      delete this._mobilePressStart;
      delete this._mobilePressHasScroll;
      delete this._mobilePopupScrollInited;
      delete this._mobileCntr;
      delete this._mobilePopupHeight;
      delete this._mobileLastScrollTop;
      this._isMobileOpen = false;
    },

    getPopupScroll () {
      if (this._mobileCntr && this._mobilePopupHeight) {
        var node = this._mobileCntr;
        var scrolTopInPX =
          node.pageYOffset !== undefined ? node.pageYOffset : node.scrollTop;
        return scrolTopInPX / this._mobilePopupHeight;
      }
      return 0;
    },

    setPopupScroll (value) {
      this.renderMobilePopup(this._mobileLastScrollTop);
      if (this._mobileCntr && this._mobilePopupHeight) {
        this._mobileCntr.style.top =
          -1 * value * this._mobilePopupHeight + "px";
      }
    },

    cleanUp () {
      this.cleanUpPopup();

      this.cleanUpMobilePopup();

      this.cleanUpTempListener();

      if (this.model.focus && this.lastValidation) {
        this.emitAnimation(this.model.id, 0, this.model.style);
      }
    },

    setState (state, t) {
      if (state) {
        const type = state.type;

        switch (type) {
          case "select":
            this.setValue(state.value);
            /**
             * Delay a little for animation
             */
            setTimeout(lang.hitch(this, "cleanUp"), 200);
            break;

          case "close":
            this.cleanUp();
            break;

          case "open":
            this._mobileLastScrollTop = state.value;
            this.renderMobilePopup(state.value);
            break;

          case "popupScroll":
            var substate = this.getLastSubState(state, t);
            if (substate) {
              this.setPopupScroll(substate.value);
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

    beforeDestroy () {
      this.cleanUp();
    }
  },
  mounted() {}
};
</script>