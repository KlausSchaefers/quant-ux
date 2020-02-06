<template>
  <div class="MatcWidgetTypeTree">
    This is a tree
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget"
import lang from "dojo/_base/lang"
import on from "dojo/on"
import css from "dojo/css"
import touch from "dojo/touch"
import UIWidget from "core/widgets/UIWidget"
import DomBuilder from "common/DomBuilder";

export default {
  name: "ToggleButton",
  mixins: [DojoWidget, UIWidget],
  data() {
    return {
      value: '',
      selected: [],
      collapsed: [],
      tree: null
    }
  },
  components: {},
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode]
      this._backgroundNodes = [this.domNode]
      this._shadowNodes = [this.domNode]
      this._paddingNodes = []
      this._labelNodes = []
      this.nodes = []
      this.icons = []
    },

    wireEvents() {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")));
      this.own(on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver")));
      this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));

      this.nodes.forEach(o => {
          this.own(on(o.div, touch.click, (e) => {
              this.stopEvent(e)
              this.select(o.node, e)
          }));
      })

      this.icons.forEach(o => {
          this.own(on(o.icon, touch.click, (e) => {
              this.stopEvent(e)
              this.toggle(o, e)
          }));
      })
    },

    render(model, style, scaleX, scaleY) {
      this.model = model
      this.style = style
      this._scaleX = scaleX
      this._scaleY = scaleY
      this._paddingNodes = []

      let db = new DomBuilder();
      let cntr = db.div('MatcWidgetTypeTreeCntr').build()

      this.nodes = []
      this.icons = []
      let tree = this.getTree()
      let values = {
        fontSize: Math.round(style.fontSize * this._scaleY),
        marginRight: Math.round(style.iconMarginRight * this._scaleY),
        icon: style.icon,
        paddingRight:  Math.round(style.paddingRight * this._scaleY),
        paddingTop:  Math.round(style.paddingTop * this._scaleY),
        paddingLeft:  Math.round(style.paddingLeft * this._scaleY),
        paddingBottom:  Math.round(style.paddingBottom * this._scaleY),
      }
      tree.children.forEach(child => {
          this._renderNode(child, cntr, db, values, 0)
      })

      this.domNode.innerHTML = "";
      this.domNode.appendChild(cntr)

      this.setStyle(style, model)
    },

    _renderNode (node, parentDiv, db, style, offset) {
        let paddingLeft = style.paddingLeft + offset + style.fontSize
        if (node.level === 0) {
            paddingLeft = 0
        }
        let cntr = db.div('MatcWidgetTypeTreeNode')
            .paddingLeft(paddingLeft)
            .paddingBottom(style.paddingBottom)
            .paddingTop(style.paddingTop)
            .paddingRight(style.paddingRight)
            .build(parentDiv)

        this.nodes.push({
            div: cntr,
            node: node
        })

        if (node.children.length > 0) {

            let icon = db.span('MatcWidgetTypeTreeNodeIcon ' + style.icon)
                .w(style.fontSize)
                .h(style.fontSize)
                .fontSize(style.fontSize)
                .marginRight(style.iconMarginRight)
                .build(cntr)

            db.span('MatcWidgetTypeTreeNodeLabel', node.label).build(cntr)
         
            let children = db.span('MatcWidgetTypeTreeChildren').build(parentDiv)
            node.children.forEach(child => {
                this._renderNode(child, children, db, style, paddingLeft)
            })
            
            this.icons.push({
                icon: icon,
                children: children,
                node: node 
            })
        } else {
            db.span('MatcWidgetTypeTreeNodeLabel', node.label).build(cntr)
        }

     
    },

    getTree () {
        let root = {
            id: 'root',
            level: 0,
            children: []
        }
        if (this.model.props.data) {
            let data = this.model.props.data
            let id = 0;
            let lastByLevel = []
            lastByLevel[-1] = root
            data.forEach(row => {
                let level = this.getLevel(row)
                let label = row[level]
                let node = {
                    id: id++,
                    value: label,
                    level: level,
                    label: label,
                    children: []
                }
                let parent = lastByLevel[level-1]
                if (parent) {
                    parent.children.push(node)
                } else {
                    this.root.children.push(node)
                }
                lastByLevel[level] = node              
            });
        }
        return root
    },

    getLevel (row) {
        let l = row.length;
        for (let i=0; i < l; i++) {
            if (row[i]){
                return i
            }
        }
        return 0
    },


    select (node, e) {
        this.setValue(node.value)
        this.emitDataBinding(this.value);
        this.onChange(e)
    },

    toggle (node, e) {
        let pos = this.collapsed.indexOf(node.node.id)
        if (pos < 0) {
            this.collapsed.push(node.node.id)
        } else {
            this.collapsed.splice(pos, 1);
        }
        this.setCollapsed(this.collapsed)
        this.onChange(e)
    },

    setCollapsed (collapsed) {
        this.collapsed = collapsed
        this.icons.forEach(icon => {
            let id = icon.node.id
            if (this.collapsed.indexOf(id) >= 0) {
                css.add(icon.icon, 'MatcWidgetTypeTreeNodeCollapsed')
                css.add(icon.children, 'MatcWidgetTypeTreeNodeCollapsed')
            } else {
                css.remove(icon.icon, 'MatcWidgetTypeTreeNodeCollapsed')
                css.remove(icon.children, 'MatcWidgetTypeTreeNodeCollapsed')
            }
        })
    },

    onChange (e) {
        this.emitStateChange("all", {
          selected: this.value,
          collapsed: this.collapsed
        }, e);
    },

    getValue() {
      return this.value
    },

    setValue(value) {
      this.value = value

      if (this.style) {
        this.nodes.forEach(node => {
            let div = node.div
            if (node.node.label === this.value) {
                div.style.color = this.style.selectedColor
                div.style.background  = this.style.selectedBackground
            } else {
                div.style.color = this.style.color
                div.style.background = "transparent"
            }
        })
      }
    },

    getState() {
      return {
        type: "all",
        value: {
          selected: this.value,
          collapsed: this.collapsed
        }
      }
    },

    setState(state) {
      if (state && state.type == "all") {
        this.setCollapsed(state.value.collapsed)
        this.setValue(state.value.selected)
      }
    },

    _validateValue() {
      return true
    },

    isValid(showError) {
      return this.validate(this.value, showError)
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue(v) {
      this.setValue(v)
    }
  },
  mounted() {}
}
</script>
