
<template>
    <div class="MatcDesignTokenButton"  @mousedown.stop="" >

      <QIcon v-show="isVisible" icon="DotMenu"></QIcon>

 
    	  <ul class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup MatcDesignTokenButtonPopup" role="menu" data-dojo-attach-point="popup">

        <template v-if="!isTemplate">
          <li @mousedown.stop="showCreateDialog" v-show="!hasDesignToken" class="MatcDesignTokenButtonHeader">
              <QIcon icon="Plus"/>
              <label class="MatcToolbarPopUpLabel">Create {{tokenLabel}} Token</label>

          </li>
          <li @mousedown.stop="onUnLink" v-show="hasDesignToken" class="MatcDesignTokenButtonHeader">
              <QIcon icon="Delete"/>
              <label class="MatcToolbarPopUpLabel">Remove Design Token</label>
          </li>
        </template>

        <li v-show="isTemplate" class="MatcDesignTokenButtonHeader">
            <label class="MatcHint">You cannot change the design token for a component instance</label>
        </li>

        <!-- add here list and filter -->
        <ul class="MatcDesignTokenButtonPreviews" v-if="!isTemplate">
          <li v-for="designtoken in filteredTokens" :key="designtoken.id" @mousedown="onSelectToken(designtoken)" >
            <DesignTokenPreview :designtoken="designtoken"/>
          </li>
        </ul>

			</ul>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import _DropDown from './_DropDown'
import Util from 'core/Util'
import _DesignToken from './_DesignToken'
import DesignTokenPreview from './DesignTokenPreview'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import lang from 'dojo/_base/lang'
import touch from 'dojo/touch'
import on from 'dojo/on'
import QIcon from 'page/QIcon.vue'

export default {
    name: 'DesignTokenBtn',
    mixins:[Util, DojoWidget,_DesignToken, _DropDown],
    data: function () {
        return {
           isVisible: true,
           isTemplate: false,
           value: null,
           reposition: true,
           arrowPosition: "right",
           tokenType: '',
           tokenLabel: 'XX',
           tokenLabels: {
             'tooltip': 'Tooltip',
             'color': 'Color',
             'boxShadow': 'Shadow',
             'stroke': 'Border',
             'padding': 'Padding',
             'text': 'Text'
           }
        }
    },
    computed: {
      filteredTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          Object.values(this.model.designtokens).forEach(t => {
            if (t.type === this.tokenType) {
              result.push(t)
            }
          })
        }
        return result
      }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview,
      'QIcon': QIcon
    },
    methods: {

      setWidget (w) {
        this.value = w
        this.setBox(w)
        this.isVisible = true
        this.isTemplate = w.template !== undefined && w.template !== null
      },
      setScreen (s) {
        this.value = s
        this.setBox(s)
        this.isVisible = true
        this.isTemplate = false
      },
      setMulti () {
        this.setBox(null)
        this.isVisible = false
        this.isTemplate = false
      },
      onVisible (){
        // reste state
			},
      setTokenType (t) {
        this.tokenType = t
        this.tokenLabel = this.tokenLabels[t]
      },
      onNew (name) {
        this.emit('new', this.tokenType, this.cssProps, name)
        this.hideDropDown()
      },
      onSelectToken (designtoken) {
        this.emit('link', designtoken, this.cssProps)
      },
      onUnLink () {
        this.emit('unlink', this.currentDesignToken)
        this.hideDropDown()
      },

      showCreateDialog () {
      	var dialog = new Dialog();
        var db = new DomBuilder();
        let popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

        let cntr = db.div().build(popup);
        db.h3("MatcDialogHeader", "Create Design Token").build(cntr);
        let inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", this.box.name , "Name of the design token").build(cntr);

        let bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
        let write = db.div("MatcButton MatcButtonPrimary", "Create").build(bar);
        let cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
        dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
        dialog.own(on(inputName, 'keyup', e => {
          var k = e.keyCode ? e.keyCode : e.which;
          if (k === 13) {
            dialog.close()
            this.onNew(inputName.value)
          }
        }));
        dialog.own(on(write, touch.press, () => {
          dialog.close()
          this.onNew(inputName.value)
        }))

        setTimeout(() => {
          inputName.select()
          inputName.focus()
        }, 200)

        dialog.popup(popup, this.domNode);

      }
    },
    mounted () {
    }
}
</script>