<template>
  <div class="MatcWidgetTypeDate">
    <div class="MatcWidgetTypeDateHeader" data-dojo-attach-point="header">
      <div class="MatcWidgetTypeDateLabel">
        <span data-dojo-attach-point="lbl" span class="MatcVAlignCenter"></span>
      </div>
      <div class="MatcWidgetTypeDateNext" data-dojo-attach-point="nextButton">
        <span data-dojo-attach-point="nextButtonLbl" class="MatcVAlignCenter">+</span>
      </div>
      <div class="MatcWidgetTypeDateBack" data-dojo-attach-point="lastButton">
        <span data-dojo-attach-point="lastButtonLbl" class="MatcVAlignCenter">-</span>
      </div>
    </div>
    <div class="MatcWidgetTypeDateBody" data-dojo-attach-point="body"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "QDate",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
      month_names: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ]
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];

      this.day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    },

    wireEvents: function() {
      this.own(
        this.addClickListener(this.lastButton, lang.hitch(this, "onLast"))
      );
      this.own(
        this.addClickListener(this.nextButton, lang.hitch(this, "onNext"))
      );
      this.wireHover()
    },

    onLast: function(e) {
      this.stopEvent(e);

      var d = this.value;
      if (this.isRange) {
        d = this.value.view;
      }
      var day = d.d;
      var month = d.m;
      var year = d.y;

      month--;
      if (month < 0) {
        month = 11;
        year--;
      }

      if (this.isRange) {
        this.value.view = this.createQDate(year, month, day);
        this.setValue(this.value);
      } else {
        d = this.createQDate(year, month, day);
        this.setValue(d);
      }

      this.emitStateChange("value", this.value, e, false);
    },

    onNext: function(e) {
      this.stopEvent(e);

      var d = this.value;
      if (this.isRange) {
        d = this.value.view;
      }
      var day = d.d;
      var month = d.m;
      var year = d.y;
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }

      if (this.isRange) {
        this.value.view = this.createQDate(year, month, day);
        this.setValue(this.value);
      } else {
        // FIXME: Here should actually set a view data
        d = this.createQDate(year, month, day);
        this.setValue(d);
      }
      this.emitStateChange("value", this.value, e, false);
    },

    /**
     * overwrite as we need other payload of DateDropDown
     * The selection flag will indicate if we can close the
     * popup.
     */
    emitStateChange (type, value, e, selection, runTransition = true) {
      var event = {
        type: type,
        value: value,
        runTransition: runTransition,
        e: e,
        selection: selection
      };
      this.emit("stateChange", event);
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
      this.isRange = model.props.range;

      if (model.props.day_names) {
        this.day_names = model.props.day_names;
      }

      if (model.props.nextButtonLbl) {
        this.nextButtonLbl.innerHTML = model.props.nextButtonLbl;
      }

      if (model.props.lastButtonLbl) {
        this.lastButtonLbl.innerHTML = model.props.lastButtonLbl;
      }

      if (style.headerBackground) {
        this.header.style.background = style.headerBackground;
      }

      if (style.headerColor) {
        this.header.style.color = style.headerColor;
      }

      if (this.tblHeaderTds) {
        for (var i = 0; i < this.tblHeaderTds.length; i++) {
          var td = this.tblHeaderTds[i];
          if (style.tableHeaderBackground) {
            td.style.background = style.tableHeaderBackground;
          }
          if (style.tableHeaderColor) {
            td.style.color = style.tableHeaderColor;
          }
        }
      }

      if (model.props.value) {
        this.setValue(model.props.value, false, true);
      } else {
        if (this.isRange) {
          if (model.props && model.props.preselectRange) {
            // let from = this.createNow();
            let now = new Date().getTime();
            let from = this.convertMillisToQDate(now + 86400000 * 2);
            let to = this.convertMillisToQDate(now + 86400000 * 4);
            let range = {
              from: from,
              to: to,
              view: to,
              defaultValue: false
            };
            this.setValue(range, false, true);
          } else {
            let now = this.createNow();
            let range = {
              from: now,
              to: now,
              view: now,
              defaultValue: true
            };
            this.setValue(range, true, true);
          }
        } else {
          let now = this.createNow();
          now.defaultValue = true;
          this.setValue(now, true, true);
        }
      }
    },

    resize: function(box) {
      var h = Math.floor((box.h * 0.8) / 6);
      var w = Math.floor(box.w / 7);
      for (var i = 0; i < this.tds.length; i++) {
        this.tds[i].style.height = h + "px";
        this.tds[i].style.width = w + "px";
      }
    },

    renderCalender: function(d) {
      // var day = d.d;
      var month = d.m;
      var year = d.y;

      var style = this.model.style;

      this.lbl.innerHTML = this.month_names[month] + " " + year;

      var first = new Date(year, month, 1);
      var offset = first.getDay();

      var db = new DomBuilder();
      var tbl = db.table().build();
      var tr = db.tr().build(tbl);
      var h = Math.floor((this.model.h * 0.8) / 6);
      var w = Math.floor(this.model.w / 7);
      this.tds = [];
      this.tblHeaderTds = [];
      this.dayTds = {};

      if (style.tableBorderWidth) {
        var width = this._getBorderWidth(style.tableBorderWidth) + "px";
        tbl.style.borderSpacing = width + " " + width;
        tbl.style.borderCollapse = "separate";
      }

      for (let i = 0; i < 7; i++) {
        let td = db.td("", this.day_names[i]).build(tr);
        td.style.height = h + "px";
        td.style.width = w + "px";
        if (style.tableHeaderBackground) {
          td.style.background = style.tableHeaderBackground;
        }
        if (style.tableHeaderColor) {
          td.style.color = style.tableHeaderColor;
        }
        this.tds.push(td);
        this.tblHeaderTds.push(td);
      }

      for (let i = 0; i < 35; i++) {
        if (i % 7 == 0) {
          tr = db.tr().build(tbl);
        }

        let td = db.td().build(tr);
        td.style.height = h + "px";
        td.style.width = w + "px";

        if (style.itemBorderRadius) {
          td.style.borderRadius = style.itemBorderRadius + "%";
        }

        if (i - offset >= 0) {
          let lbl = i - offset + 1;

          if (i % 7 == 0 || i % 7 == 6) {
            if (style.weekdayBackground) {
              td.style.background = style.weekdayBackground;
            }
            if (style.weekdayColor) {
              td.style.color = style.weekdayColor;
            }
          } else {
            if (style.weekendBackground) {
              td.style.background = style.weekendBackground;
            }
            if (style.weekendColor) {
              td.style.color = style.weekendColor;
            }
          }

          var d1 = new Date(year, month, lbl);
          if (d1.getMonth() != month) {
            lbl = "";
            td.style.background = "none";
          } else {
            this.dayTds[this.getKey(d1)] = td;
          }

          td.innerHTML = lbl;
          if (lbl != "" && this.mode == "simulator") {
            this.tempOwn( this.addClickListener(td, lang.hitch(this, "onSelect", lbl, month, year)));
          }
        }
        this.tds.push(td);
      }
      this.body.innerHTML = "";
      this.body.appendChild(tbl);
    },

    getKey: function(d) {
      var day = d.getDate();
      var month = d.getMonth();
      var year = d.getYear();
      return day + "-" + month + "-" + year;
    },

    /**
     * d = js date(legacy) or qdate
     */
    renderSelectedDay (qDate, inRange) {
      var d = this.convertQDateToDate(qDate);

      var key = this.getKey(d);
      if (this.dayTds && this.dayTds[key]) {
        var td = this.dayTds[key];
        var style = this.style;

        if (inRange && style.selectedInRangeBackground) {
          td.style.background = style.selectedInRangeBackground;
        } else if (style.selectedBackground) {
          td.style.background = style.selectedBackground;
        }

        if (inRange && style.selectedInRangeColor) {
          td.style.color = style.selectedInRangeColor;
        } else if (style.selectedColor) {
          td.style.color = style.selectedColor;
        }

      }
    },

    renderSelectionRange: function(range) {
      var dayInMS = 86400000;
      if (range.from && range.to) {
        var to = this.convertQDateToMillis(range.to);
        var from = this.convertQDateToMillis(range.from);
        var days = Math.floor(to - from) / dayInMS;
        for (var i = 0; i < days + 1; i++) {
          var d = this.convertMillisToQDate(from + dayInMS * i);
          this.renderSelectedDay(d, (i != 0) & (i != days));
        }
      } else {
        console.warn("renderSelectionRange() > wrong range", range);
      }
    },

    onSelect: function(day, month, year, e) {
      this.stopEvent(e);

      if (this.isRange) {
        /**
         * We have the following mechanics
         *
         * 1) The user clicks once and selects a date
         *
         * 2) he clicks again to define the range ( before or behind)
         *
         * 3) if he clicks again we "reset" the selection to the current date
         */
        var selectedTime = new Date(year, month, day).getTime();
        var selectedQDate = this.convertMillisToQDate(selectedTime);

        this._rangeStartTime = selectedTime;
        var closePopup = false;
        var ignoreValidation = true;
        var range;

        if (!this.value.defaultValue) {
          range = this.value;

          /**
           * FIXME: we should work with qdates in the range!
           */
          var to = this.convertQDateToMillis(range.to);
          var from = this.convertQDateToMillis(range.from);

          if (to == from) {
            if (selectedTime < from) {
              range.from = selectedQDate;
            }
            if (selectedTime > to) {
              range.to = selectedQDate;
            }

            /**
             * we close popup here
             */
            closePopup = true;
            ignoreValidation = false;
          } else {
            range.from = selectedQDate;
            range.to = selectedQDate;
            closePopup = false;
          }
        } else {
          range = {
            from: selectedQDate,
            to: selectedQDate,
            view: selectedQDate
          };
          closePopup = false;
        }

        this.emitDataBinding(range);
        this.setValue(range, false, ignoreValidation);
        this.emitStateChange("value", this.value, e, closePopup);
      } else {
        var v = this.createQDate(year, month, day);
        this.emitDataBinding(v);
        this.setValue(v);
        this.emitStateChange("value", this.value, e, true);
      }
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value, doNotMark, ignoreValidation) {
      if (value) {
        if (this.isRange) {
          /**
           * Ensure backward compability
           */
          if (!this.isQDate(value.to)) {
            value.to = this.convertMillisToQDate(value.to);
          }
          if (!this.isQDate(value.from)) {
            value.from = this.convertMillisToQDate(value.from);
          }
          if (!this.isQDate(value.view)) {
            value.view = this.convertMillisToQDate(value.view);
          }

          this.renderCalender(value.view, doNotMark);
          this.value = value;

          if (!doNotMark && !value.defaultValue) {
            this.renderSelectionRange(value);
          }
        } else {
          /**
           * Ensure backward compability
           */
          if (!this.isQDate(value)) {
            value = this.convertMillisToQDate(value);
          }

          if (!this.isEqualDate(this.value, value)) {
            this.value = value;
            this.renderCalender(value, doNotMark);
            if (!doNotMark) {
              this.renderSelectedDay(value);
            }
          }
        }

        if (!ignoreValidation) {
          this.validate(this.value, true);
        }
      }
    },

    getState: function() {
      return {
        type: "value",
        value: this.value
      };
    },

    setState: function(state) {
      if (state && state.type == "value") {
        this.setValue(state.value);
      }
    },

    _validateValue: function(value) {
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

    isValid: function(showError) {
      return this.validate(this.value, showError);
    }
  },
  mounted() {}
};
</script>