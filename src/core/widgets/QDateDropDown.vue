
<template>
  <div class="MatcWidgetTypeDropDown MatcWidgetTypeDateDropDown">
    <div data-dojo-attach-point="button" class="MatcWidgetTypeDropDownCntr">
      <div  class="MatcWidgetTypeDateDropDownLabel">
        <span data-dojo-attach-point="label"></span>
      </div>
    </div>
    <div >
      <div class="MatcWidgetTypeDropDownPopUp" role="menu" data-dojo-attach-point="popup"></div>
    </div>
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
import DropDown from "core/widgets/DropDown";
import QDate from "core/widgets/QDate";

export default {
  name: "QDateDropDown",
  mixins: [DropDown, DojoWidget],
  data: function() {
    return {
      value: null
    };
  },
  components: {},
  methods: {
    postCreate() {
      this._borderNodes = [this.button];
      this._shadowNodes = [this.button];
      this._backgroundNodes = [this.button];
      this._paddingNodes = [this.button];
      this.cleanUpTempListener();
      this._isOpen = false;
    },

    getLabelNode() {
      return this.label;
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
      this.isRange = model.props.range;
      this.isModal = model.props.modal

      this.showDefaultValue();

      if (model.props.icon) {
        if (!this.icon) {
          var db = new DomBuilder();
          this.iconCntr = db
            .div("MatcWidgetTypeDateDropDownIcon")
            .build(this.button);
          this.icon = db.span(model.props.icon).build(this.iconCntr);
        }
        this.icon.style.fontSize = Math.round(style.fontSize * this._scaleY) + "px";
        this.iconCntr.style.top = this._getBorderWidth(style.paddingTop) + "px";
        this.iconCntr.style.right =
          this._getBorderWidth(style.paddingRight) + "px";
      }

      this.resize(model);
    },

    showDefaultValue() {
      if (this.model.props.label) {
        this.setTextContent(this.label, this.model.props.label);
        css.add(this.label, "MatcWidgetTypeDateDropDownDefaultLabel");

        if (this.isRange) {
          if (this.model.props.preselectRange) {
            // var from = this.createNow();

            const now = new Date().getTime();
            const from = this.convertMillisToQDate(now + 86400000 * 2);
            const to = this.convertMillisToQDate(now + 86400000 * 4);

            this.value = {
              from: from,
              to: to,
              view: to,
              defaultValue: false
            };
          } else {
            const now = this.createNow();
            this.value = {
              from: now,
              to: now,
              view: now,
              defaultValue: true
            };
          }
        } else {
          this.value = this.createNow();
          this.value.defaultValue = true;
        }
      } else {
        if (this.isRange) {
          const now = this.createNow();
          const range = {
            from: now,
            to: now,
            view: now
          };
          this.setValue(range, true);
        } else {
          let now = this.createNow();
          this.setValue(now, true);
        }
      }
    },

    /**
     * Overwrite and do nothing
     */
    resize() {},

    /**
     * Overwrite and do nothing
     */
    _set_popupBackground() {},

    /**
     * Overwrite and do nothing
     */
    _set_popupColor() {},

    onOpenPopup(e) {
      this.stopEvent(e);
      this.emitNoTransitionStateChange("open", "", e);
      this.renderPopup();
      return false;
    },

    renderPopup() {
      if (!this._isOpen) {
        const popup = this.popup
        // var db = new DomBuilder();

        // FIXME: Should be model on

        /**
         * We estimate the size by the fontSize...
         */
        const w = Math.max(
          this.getZoomed(this.style.fontSize * 18, this._scaleX),
          this.model.w
        );
        const h = this.getZoomed(this.style.fontSize * 18, this._scaleX);
        popup.style.height = h + "px";
        popup.style.width = w + "px";

        const popupModel = lang.clone(this.model);
        popupModel.h = h;
        popupModel.w = w;
        delete popupModel.props.databinding;

        const datePicker = this.$new(QDate)
        datePicker.mode = this.mode
        datePicker.render(popupModel, this.getPopupStyle(), this._scaleX, this._scaleY);
        datePicker.placeAt(popup);
        datePicker.setValue(this.value);

        css.add(this.domNode, "MatcWidgetTypeDropDownOpen");
        if (this.domNode.parentNode) {
          css.add(this.domNode.parentNode, "MatcWidgetTypeDropDownFront");
        }

        if (this.wired) {
          this.tempOwn(datePicker.on("stateChange", lang.hitch(this, "onSelect")));
          this.tempOwn(on(win.body(), touch.press, lang.hitch(this, "onClose")));
          this.tempOwn(topic.subscribe("MatcSimulatorEvent", lang.hitch(this, "onSimulatorEvent")));
          datePicker.wireEvents();
          this.emitFocus();
        }

        this.datePicker = datePicker;
        this._isOpen = true;
      }
    },

    getPopupStyle() {
      const popupStyle = lang.clone(this.style);

      popupStyle.background = this.style.popupBackground;
      popupStyle.color = this.style.popupColor;

      popupStyle.borderTopWidth = this.style.popupBorderWidth;
      popupStyle.borderBottomWidth = this.style.popupBorderWidth;
      popupStyle.borderLeftWidth = this.style.popupBorderWidth;
      popupStyle.borderRightWidth = this.style.popupBorderWidth;

      popupStyle.borderTopColor = this.style.popupBorderColor;
      popupStyle.borderBottomColor = this.style.popupBorderColor;
      popupStyle.borderRightColor = this.style.popupBorderColor;
      popupStyle.borderLeftColor = this.style.popupBorderColor;

      popupStyle.paddingTop = 0;
      popupStyle.paddingBottom = 0;
      popupStyle.paddingLeft = 0;
      popupStyle.paddingRight = 0;

      if (this.style.popupShadow) {
        popupStyle.boxShadow = this.style.popupShadow;
      }

      if (this.style.popupBorderRadius) {
        popupStyle.borderTopLeftRadius = this.style.popupBorderRadius;
        popupStyle.borderTopRightRadius = this.style.popupBorderRadius;
        popupStyle.borderBottomLeftRadius = this.style.popupBorderRadius;
        popupStyle.borderBottomRightRadius = this.style.popupBorderRadius;
      }

      return popupStyle;
    },

    onSelect(e) {

      /**
       * we have here two kind of events. The plus or minus button were pressed. In this
       * case we do not update the value and do not close. Alternativly a date was selected,
       * and we set the value and close the popup.
       * Attention: In the set state method we have to do the same, so if there was a navigate event,
       * we should just update the date widget!
       *
       * FIXME: Introduce navigate state change in Date.js
       */
      if (e.selection) {
        const event = {
          type: "select",
          value: e.value,
          runTransition: true,
          noheat: true,
          e: e.e
        };
        this.emitDataBinding(event.value);
        this.emit("stateChange", event);
        this.setValue(event.value);

        setTimeout(() =>  {
          this.cleanUp();
        }, 150);
      } else {
        const event = {
          type: "navigate",
          value: e.value,
          runTransition: false,
          noheat: true,
          e: e.e
        };
        this.emit("stateChange", event);
      }
    },

    onClose(e) {
      this.stopEvent(e);
      this.emitNoTransitionStateChange("close", "", e);
      this.cleanUp();
    },

    cleanUp() {
      if (this._isOpen) {
        try {
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

          if (this.domNode) {
            css.remove(this.domNode, "MatcWidgetTypeDropDownOpen");
          }

          this.cleanUpTempListener();
          this.datePicker.destroy();
          delete this.datePicker;
          this._isOpen = false;
        } catch (e) {
          console.warn(e);
          console.debug(e.stack);
        }
      }
    },

    getValue() {
      return this.value;
    },

    /**
     * Override form DropDown.js!
     */
    _setDataBindingValue(v) {
      this.setValue(v);
    },

    setValue(value, ignoreValidation) {
      if (value) {
        css.remove(this.label, "MatcWidgetTypeDateDropDownDefaultLabel");

        this.value = value;

        if (!ignoreValidation) {
          this.validate(this.value, true);
        }
        if (this.label) {
          if (this.isRange) {
            if (!this.isQDate(value.to)) {
              value.to = this.convertMillisToQDate(value.to);
            }
            if (!this.isQDate(value.from)) {
              value.from = this.convertMillisToQDate(value.from);
            }
            if (!this.isQDate(value.view)) {
              value.view = this.convertMillisToQDate(value.view);
            }

            if (!value.defaultValue) {
              var from = this.convertQDateToString(value.from);
              var to = this.convertQDateToString(value.to);
              this.setTextContent(this.label, from + " - " + to);
            } else {
              this.showDefaultValue();
            }
          } else {
            if (!this.isQDate(value)) {
              value = this.convertMillisToQDate(value);
            }

            if (!value.defaultValue) {
              this.setTextContent(this.label, this.convertQDateToString(value));
            } else {
              this.showDefaultValue();
            }
          }
        }
      } else {
        this.showDefaultValue();
      }
    },

    getState() {
      /**
       * we should have here a composite state..
       */
      return {
        type: "select",
        value: this.value
      };
    },

    getStateOptions() {
      return {
        value: this.value,
        open: this._isOpen
      };
    },

    setState(state) {
      if (state) {
        var type = state.type;
        switch (type) {
          case "navigate":
            /**
             * The plus or minus button was pressed.
             */
            if (this.datePicker) {
              this.datePicker.setValue(state.value);
            }
            break;
          case "select":
            this.setValue(state.value);
            /**
             * Delay a little for animation
             */
            setTimeout(lang.hitch(this, "cleanUp"), 200);
            break;
          case "value":
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
            this.renderPopup();
            break;

          default:
            this.cleanUp();
            break;
        }

        /**
         * We could also use the options to do the state... but whatever
         */
      } else {
        this.cleanUp();
      }
    },

    beforeDestroy() {
      this.cleanUp();
    },

    /**
     * Copied from QDate
     */
    _validateValue(value) {
      var validation = this.model.props.validation;
      if (validation) {
        if (this.isRange) {
          if (validation.required) {
            if (value.defaultValue || this.isEqualDate(value.to, value.from)) {
              return false;
            }
          }
        } else {
          if (validation.required && value == null) {
            return false;
          }

          if (validation.type == "date" && validation.date) {
            if (!value) {
              return false;
            }

            var yyyy = value.y;
            var mm = value.m + 1 + "";
            if (mm.length == 1) {
              mm = "0" + mm;
            }
            var dd = value.d + "";
            if (dd.length == 1) {
              dd = "0" + dd;
            }
            var ddmmyyyy = dd + "." + mm + "." + yyyy;

            return ddmmyyyy == validation.date;
          }
        }
      }
      return true;
    },

    isValid(showError) {
      return this.validate(this.value, showError);
    }
  },
  mounted() {}
};
</script>