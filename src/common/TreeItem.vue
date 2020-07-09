
<template>
	<ul :class="[{'MatcTreeItemDragOver': isDragOver}, {'MatcTreeItemSelected': isSelected && !isEditable}, 'MatcTreeItem']"  :xScroll="scrollToItem()" >
    <li :class="'MatcTreeItemLevel' + level">
        <div
            :class="'MatcTreeItemRow ' + rowStyle"
            @click.stop="onClick($event)"
            @dragstart="onDragStart"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @dblclick.stop="onDoubleClick"
            @drop="onDrop"
            ref="row"
            :draggable="!isEditable"
          >
          <template v-if="hasChildren">
            <span :class="expandIcon" @click.stop="toggleOpen"></span>
          </template>
          <template v-else>
            <span v-if="nodeIcon" :class="nodeIcon"></span>
          </template>
         <label class="MatcTreeItemLabel" v-if="!isEditable" ref="lblNode" >
            {{value.label}}
          </label>
          <input class="MatcTreeItemLabel MatcIgnoreOnKeyPress"
            v-if="isEditable"
            @blur="onBlur"
            :focus="focus()"
            ref="lblNode"
            @keydown.enter="onBlur" :value="value.label"/>

          <div class="MatcTreeItemOptions" v-if="hasOptions">
            <span :class="lockIcon" @click.stop="toggleLocked"></span>
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


export default {
  name: "TreeItem",
  props:['value', 'level'],
  mixins: [],
  data: function() {
    return {
      hasOptions: false,
      isOpen: true,
      isDragOver: false
    };
  },
  computed: {
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
      return 'mdi mdi-crop-portrait MatcTreeIcon'
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
          return this.value.openIcon
        }
        return 'mdi mdi-folder-open MatcTreeIcon'
      }
      if (this.value && this.value.closeIcon) {
         return this.value.closeIcon
      }
      return 'mdi mdi-folder MatcTreeIcon'
    }
  },
  components: {},
  methods: {
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
      if (this.value && !this.value.disabled) {
        e.dataTransfer.setData("text", this.value.id)
      } else {
        e.preventDefault()
      }
    },
    onDragOver (e) {
      e.preventDefault()
      this.isDragOver = true
    },
    onDragLeave (e) {
      e.preventDefault()
      this.isDragOver = false
    },
    onDrop (e) {
      e.preventDefault()
      let id = e.dataTransfer.getData('text')
      this.isDragOver = false
      this.$emit('dnd', id, this.value.id, 'top')
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
          this.$refs.lblNode.select()
          this.$refs.lblNode.focus()
        }, 100)
      }
    },
    scrollToItem () {
      if (this.value && this.value.scroll) {
        setTimeout(() => {
          this.$el.scrollIntoView(false)
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