
<template>
<!-- :xScroll="scrollToItem()" Add this to enbale scrolling...  HSould be fixed to only tricker when seelction was changes from canvas-->
	<ul :class="[{'MatcTreeItemDragOver': isDragOver},{'MatcTreeItemEnd': value.isEnd}, {'MatcTreeItemSelected': isSelected && !isEditable}, 'MatcTreeItem', 'MatcTreeItemLevel' + level]" :xScroll="scrollToItem()"  >
    <li >
        <div
            :class="'MatcTreeItemRow ' + rowStyle"
            @mousedown="onClick($event)"
            @dragstart="onDragStart"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @dblclick.stop="onDoubleClick"
            @drop="onDrop"
            :id="value.domId"
            ref="row"
            :draggable="!isEditable"
          >
          <template v-if="hasChildren">
            <span :class="expandIcon" @click.stop="toggleOpen"></span>
          </template>
          <template v-else>
            <span class="MatcTreeIcon"  @click.stop=""></span>
          </template>

          <span v-if="nodeIcon" :class="'MatcTreeTypeIcon ' + nodeIcon"></span>

         <label class="MatcTreeItemLabel" v-if="!isEditable" ref="lblNode" >
           <!-- add here         {{value.hint}} -->
            {{hintAndLabel}}
          </label>
          <input class="MatcTreeItemLabel MatcIgnoreOnKeyPress"
            v-if="isEditable"
            @blur="onBlur"
            :focus="focus()"
            ref="lblNode"
            @keydown.enter="onBlur" :value="value.label"/>

          <div class="MatcTreeItemOptions" v-if="value.hasOptions">
            <span :class="lockIcon" @click.stop="toggleLocked" v-if="hasLock"></span>
            <span :class="hiddenIcon" @click.stop="toggleHidden"></span>
          </div>


        </div>
        <ul v-if="isOpen">
          <TreeItem v-for="child in value.children" :key="child.id"
            :value="child"
            @dnd="onChildDnd"
            @open="onChildOpen"
            @locked="onChildLocked"
						@hidden="onChildHidden"
            @select="onChildSelect"
            @startEdit="onChildStartEdit"
            @endEdit="onChildEndEdit"
            :level="level + 1"/>
        </ul>
      </li>
	</ul>
</template>
<script>

import Logger from '../core/Logger'
import TreeDND from './TreeDND'

export default {
  name: "TreeItem",
  props:['value', 'level'],
  mixins: [],
  data: function() {
    return {
      hasLock: false,
      hasOptions: false,
      isOpen: true,
      isDragOver: false
    };
  },
  computed: {
    customCSS () {
      if (this.value && this.value.customCSS) {
        return this.value.customCSS
      }
      return ''
    },
    hintAndLabel () {
      if (this.value) {
        if (this.value.hint) {
          let hint  = this.unStripHTML(this.value.hint)
          return this.short(hint) + ' (' + this.value.label + ')'
        }
        return this.short(this.value.label)
      }
      return ''
    },
    rowStyle () {
      let result = ''
      if (this.value && this.value.css) {
        result = this.value.css
      }
      if (this.value.locked || this.value.hidden) {
        result += ' MatcTreeItemOptionsVisible'
      }
      return result
    },
    hasChildren () {
      return this.value.children && this.value.children.length > 0
    },
    isEditable () {
      return this.value.editable
    },
    isSelected () {
      return this.value.selected
    },
    nodeIcon () {
      if (this.value && this.value.icon) {
        return this.value.icon
      }
      return false
    },
    lockIcon () {
      if (this.value && this.value.locked) {
        return 'mdi mdi-lock-outline'
      }
      return 'mdi mdi-lock-open-outline'
    },
    hiddenIcon () {
      if (this.value && this.value.hidden) {
        return 'mdi mdi-eye-off-outline'
      }
      return 'mdi mdi-eye-outline'
    },
    expandIcon () {
      if (this.isOpen) {
        if (this.value && this.value.openIcon) {
          return this.value.openIcon + ' MatcTreeToggleChildrenIcon'
        }
        return 'mdi mdi-folder-open MatcTreeIcon MatcTreeToggleChildrenIcon'
      }
      if (this.value && this.value.closeIcon) {
         return this.value.closeIcon + ' MatcTreeToggleChildrenIcon'
      }
      return 'mdi mdi-folder MatcTreeIcon MatcTreeToggleChildrenIcon'
    }
  },
  components: {},
  methods: {
    unStripHTML:function(s) {
			if(!s){
				s = '';
			}
      s = s.replace(/(\r\n|\n|\r)/gm, '')
      s = s.replace(/<br>/g, "");
      s = s.replace(/&nbsp;/g, " ");
			s = s.replace(/\$perc;/g, "%");
			return s;
		},
    short (s, maxLendth = 16) {
      s = this.unStripHTML(s)
      if (s.length > maxLendth) {
        return s.substring(0, maxLendth) + '...'
      }
      return s
    },
    onBlur () {
      if (this.isEditable) {
        this.$emit('endEdit', this.value.id, this.getInlineTxt())
      }
    },
    onDoubleClick () {
      if (this.value && !this.value.disabled) {
        this.$emit('startEdit', this.value.id)
      }
    },
    toggleLocked () {
      this.$emit('locked', this.value.id, !this.value.locked)
    },
    toggleHidden () {
      this.$emit('hidden', this.value.id, !this.value.hidden)
    },
    toggleOpen () {
      this.isOpen = !this.isOpen
      this.$emit('open', this.value.id, this.isOpen )
    },
    onClick (e) {
      let expand = e.ctrlKey || e.metaKey || e.shiftKey
      if (this.value && !this.value.disabled) {
        this.$emit('select', this.value.id, expand)
      }
    },
    onDragStart (e) {
      if (this.value.hasDND === false) {
        e.preventDefault()
        return
      }
      if (this.value && !this.value.disabled) {
        e.dataTransfer.setData("text", this.value.id)
        TreeDND.start(this.value)
      } else {
        e.preventDefault()
      }
    },
    onDragOver (e) {
      const source = TreeDND.get()
      if (source && source.dndType !== this.value.dndType) {
        this.isDragOver = false;
        return
      }
      e.preventDefault()
      this.isDragOver = true
    },
    onDragLeave (e) {
      e.preventDefault()
      this.isDragOver = false
    },
    onDrop (e) {
      e.preventDefault()
      const source = TreeDND.get()
      const id = e.dataTransfer.getData('text')
      this.isDragOver = false
      TreeDND.end()
      if (source && source.dndType === this.value.dndType) {
        this.$emit('dnd', id, this.value.id, 'top')
      } else {
        Logger.log(-1, 'TreeItem.onDrop() > ignore')
      }
    },
    onChildDnd (from, to, position) {
      this.$emit('dnd', from, to, position)
    },
    onChildLocked (id, value) {
      this.$emit('locked', id, value)
    },
    onChildHidden (id, value) {
      this.$emit('hidden', id, value)
    },
    onChildSelect (id, expand) {
      this.$emit('select', id, expand)
    },
    onChildStartEdit (id) {
      this.$emit('startEdit', id)
    },
    onChildEndEdit (id, txt) {
      this.$emit('endEdit', id, txt)
    },
    onChildOpen (id, open) {
      this.$emit('open', id, open)
    },
    destroy () {
    },
    getInlineTxt (){
      if (this.$refs.lblNode){
        var txt = this.$refs.lblNode.value;
        txt = txt.replace(/(\r\n|\n|\r)/gm, '')
        txt = txt.replace(/<br>/g, "");
        txt = txt.replace(/&nbsp;/g, " ");
        txt = txt.replace(/%/g, "$perc;");
        return txt;
      }
    },
    focus () {
      // somehow not called
      if (this.value.editable) {
        setTimeout(() => {
          if (this.$refs.lblNode) {
            this.$refs.lblNode.select()
            this.$refs.lblNode.focus()
          }
  
        }, 100)
      }
    },
    scrollToItem () {
      if (this.value && this.value.scroll) {
        setTimeout(() => {
          this.$el.scrollIntoView({block: "nearest", inline: "nearest"})
        })
      }
    }
  },
  watch: {
    value (v) {
      this.value = v
      this.isOpen = this.value.open
    }
  },
  mounted() {
    if (this.value) {
      this.isOpen = this.value.open
    }
  }
};
</script>