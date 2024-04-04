
<template>
  <div class="VommondDropDownButton">
    <div type="button" ref="button">
      <QIcon :icon="icon" />
      <span data-dojo-attach-point="label"></span>
      <span class="caret"></span>
    </div>
    <div class="VommondDropDownPopUp" role="menu" data-dojo-attach-point="popup">
      <ul class role="menu" data-dojo-attach-point="ul"></ul>
    </div>
  </div>
</template>
<script>
import DojoWidget from "../dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import win from "dojo/_base/win";
import Logger from "common/Logger";
import QIcon from 'page/QIcon'
import { iconDOM } from 'page/QIconUtil'

var _openVommondDropDownButton = null;

export default {
  name: "DropDownButton",
  mixins: [DojoWidget],
  props: ["l", "options", "value"],
  data: function () {
    return {
      icon: '',
      selected: false,
      hasObjects: false,
      updateLabel: true,
      maxLabelLength: -1,
      openCSS: "VommondDropDownButtonOpen",
      iconCSS: "VommondDropDownIcon",
      labelCSS: "VommondDropDownLabel",
      selectedCSS: "VommondDropDownButtonSelected",
      liCSS: ''
    };
  },
  components: {
    'QIcon': QIcon
  },
  methods: {
    postCreate() {
      this.own(on(this.domNode, touch.press, lang.hitch(this, "showDropDown")));
      if (this.l) {
        this.setLabel(this.l);
      }
      if (this.options) {
        this.setOptions(this.options);
      }
      if (this.value) {
        this.setValue(this.value);
      }
      this.button = this.$refs.button
    },

    showDropDown(e) {
      this.stopEvent(e);

      if (this._dropDownOpen) {
        this.hideDropDown();
        this._dropDownOpen = false;
      } else {
        if (_openVommondDropDownButton) {
          if (_openVommondDropDownButton.hideDropDown) {
            _openVommondDropDownButton.hideDropDown();
          } else {
            console.debug("showDropDown() Strange Open",_openVommondDropDownButton);
          }
        }

        css.add(this.domNode, this.openCSS);
        this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this, "hideDropDown"));
        _openVommondDropDownButton = this;
        this._dropDownOpen = true;
      }
    },

    hideDropDown() {
      try {
        if (this.domNode) {
          css.remove(this.domNode, this.openCSS);
        }
        if (this._mouseDownListener) {
          this._mouseDownListener.remove();
        }
        _openVommondDropDownButton = null;
        this._dropDownOpen = false;
      } catch (e) {
        console.error("hideDropDown", e);
      }
    },

    setOptions(list) {
      this._lis = {};
      this.renderOptions(list);
      this._options = list;
    },

    renderOptions(list) {
      var selectedValue = null;
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        var li = document.createElement("li");
        css.add(li, this.liCSS)

        if (o.label || o.icon) {
          this.hasObjects = true;
          if (o.icon) {
            li.appendChild(iconDOM(o.icon));
          }
          if (o.label) {
            var lbl = document.createElement("label");
            css.add(lbl, this.labelCSS);
            lbl.innerHTML = o.label;
            li.appendChild(lbl);
          }
          if (o.selected) {
            selectedValue = o.value;
          }
          this.own(on(li, touch.press, lang.hitch(this, "onChange", o.value)));
          this._lis[o.value] = li;
        } else {
          li.innerHTML = o;
          this._lis[o] = li;
          this.own(on(li, touch.press, lang.hitch(this, "onChange", list[i])));
        }
        this.ul.appendChild(li);
      }
      if (selectedValue) {
        this.setValue(selectedValue);
      }
    },

    setLabel(value) {
      this.label.innerHTML = "";

      if (this.lastCSS) {
        css.remove(this.domNode, this.lastCSS);
      }

      if (this.hasObjects && this.updateLabel) {
        for (var i = 0; i < this._options.length; i++) {
          var o = this._options[i];
          if (value == o.value) {
            this._updateLabel(o);
          }
        }
      } else if (value) {
        this.label.innerHTML = value;
      }
    },

    _updateLabel(o) {
      if (o.icon) {
        this.icon = o.icon
      }

      if (o.label) {
        var lbl = document.createElement("span");
        css.add(lbl, this.labelCSS);

        var l = o.label;
        if (this.maxLabelLength > 0) {
          if (l.length > this.maxLabelLength) {
            l = l.substring(0, this.maxLabelLength) + "...";
          }
        }

        lbl.innerHTML = l;
        this.label.appendChild(lbl);
      }

      if (o.css) {
        css.add(this.domNode, o.css);
        this.lastCSS = o.css;
      }
    },

    setValue(value) {
      if (this._selectedLi) {
        css.remove(this._selectedLi, this.selectedCSS);
      }

      if (this._lis[value]) {
        css.add(this._lis[value], this.selectedCSS);
        this._selectedLi = this._lis[value];
      }

      if (this.updateLabel) {
        this.setLabel(value);
      }
      this.selected = value;
    },

    onChange(value, e) {
      this.stopEvent(e);
      this.hideDropDown();
      if (this.updateLabel) {
        this.setLabel(value);
      }
      this.setValue(value);
      this.emit("change", value, e);
      this.emit("input", this.selected);
    }
  },
  watch: {
    value(v) {
      this.setValue(v);
    }
  },
  mounted() {
    this.logger = new Logger("DropDownButton");
    this.logger.log(10, "mounted", "enter");
  }
};
</script>