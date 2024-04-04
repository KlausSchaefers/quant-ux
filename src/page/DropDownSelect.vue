
<template>
    <div class="MatcButton MatcDropDownButton MatcDropDownSelect">
        <div type="button" ref="button" class="MatcDropDownButtonCntr">
            <QIcon :icon="icon" v-if="icon"/>
            <label data-dojo-attach-point="label" class="MatcDropDownLabel"></label>
            <span class="caret"></span>
        </div>
        <div class="MatcDropDownPopUp " role="menu" data-dojo-attach-point="popup" >
            <ul class role="menu" data-dojo-attach-point="ul"></ul>
        </div>
    </div>
</template>
<script>
import DropDownButton from "common/DropDownButton";
import CheckBox from "common/CheckBox";
import lang from "dojo/_base/lang";
import css from "dojo/css";
import on from "dojo/on";
import touch from "dojo/touch";
  
  export default {
    name: "DropDownSelect",
    mixins: [DropDownButton],
    data: function() {
      return {
        icon: '',
        openCSS: "MatcDropDownButtonOpen",
        iconCSS: "MatcDropDownIcon",
        labelCSS: "MatcDropDownLabel",
        selectedCSS: "MatcDropDownButtonSelected",
        liCSS: "MatcDropDownMenuItem",
        updateLabel: false,
        selected: {}
      };
    },
    methods:{
        renderOptions (list) {
   
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                const li = document.createElement("li");
                css.add(li, this.liCSS)
                if (o.check) {
                    const checkCntr = document.createElement("span");
                    css.add(checkCntr, 'MatcDropDownSelectCheck');
                    li.appendChild(checkCntr)

                    const check = this.$new(CheckBox)
                    check.setValue(o.selected)
                    check.setLabel(o.label)
                    check.placeAt(checkCntr)
                
                    check.on('change', lang.hitch(this, "onSelect", o))
                    this._lis[o.value] = li;

                    this.selected[o.value] = o.selected

                } else if (o.label || o.icon) {
                    this.hasObjects = true;
                    if (o.icon) {
                        const icon = document.createElement("span");
                        css.add(icon, this.iconCSS);
                        css.add(icon, o.icon);
                        li.appendChild(icon);
                    }
                    if (o.label) {
                        const lbl = document.createElement("label");
                        css.add(lbl, this.labelCSS);
                        lbl.innerHTML = o.label;
                        li.appendChild(lbl);
                    }
                  
                    this.own(on(li, touch.press, lang.hitch(this, "onClick", o)));
                    this._lis[o.value] = li;
                }
             
                if (o.css) {
                    css.add(li, o.css)
                }
                this.ul.appendChild(li);
            }
        },
        onSelect (option, selected) {
            if (option.callback) {
                option.callback(selected)
                return
            }
            this.selected[option.value] = selected
            this.$emit('select', this.selected)
        },
        onClick (option, e) {
            if (option.event) {
                this.$emit(option.event, e)
            }
           
        }
    },
    watch:{
    }
  };
  </script>