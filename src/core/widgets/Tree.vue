<template>
  <div class="MatcWidgetTypeTree">
    This is a tree
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget"
// import lang from "dojo/_base/lang"
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
      this._borderNodes = []
      this._backgroundNodes = []
      this._shadowNodes = []
      this._paddingNodes = []
      this._labelNodes = []
      this.nodes = []
      this.icons = []
    },

    wireEvents() {
      /**
       * Since 3.0.29 we do not do anothy with the domEvents.
       */
      //this.own(this.addClickListener(this.domNode, e => {
      //  this.onChange(e)
      //}));

      this.nodes.forEach(o => {
          this.own(on(o.div, touch.click, (e) => {
              this.stopEvent(e)
              this.select(o.node, e)
          }));

          this.own(on(o.div, touch.over, (e) => {
              this.stopEvent(e)
              this.setHover(o, true)
          }));

          this.own(on(o.div, touch.out, (e) => {
              this.stopEvent(e)
              this.setHover(o, false)
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
      this._borderNodes = []
      this._backgroundNodes = []
      this._shadowNodes = []

      let tree = this.getTree()
      let values = {
        fontSize: Math.round(style.fontSize * this._scaleY),
        marginRight: Math.round(style.iconMarginRight * this._scaleY),
        selectedBorderWidth: Math.round(style.selectedBorderWidth * this._scaleY),
        selectedBorderColor: style.selectedBorderColor,
        icon: style.icon,
        paddingRight:  Math.round(style.paddingRight * this._scaleY),
        paddingTop:  Math.round(style.paddingTop * this._scaleY),
        paddingLeft:  Math.round(style.paddingLeft * this._scaleY),
        paddingBottom:  Math.round(style.paddingBottom * this._scaleY),
      }
      tree.children.forEach(child => {
          this._renderNode(child, cntr, db, values, 0)
      })

      this.removeAllChildren(this.domNode)

      /**
       * Since 3.0.22 we can have the tree collapsed
       */
      if (model.props.collapsed === true) {
        let collapsed = []
        tree.children.forEach(child => {
          if (child.children && child.children.length > 0) {
            collapsed.push(child.id)
          }
        })
        this.setCollapsed(collapsed)
      }

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

        this._borderNodes.push(cntr)
        this._backgroundNodes.push(cntr)
        this._shadowNodes.push(cntr)

        this.nodes.push({
            div: cntr,
            node: node
        })

        if (node.children.length > 0) {

            let icon = null;
            if (style.icon) {
              icon = db.span('MatcWidgetTypeTreeNodeIcon ' + style.icon)
                .w(style.fontSize)
                .h(style.fontSize)
                .fontSize(style.fontSize)
                .marginRight(style.iconMarginRight)
                .build(cntr)
            }


            db.span('MatcWidgetTypeTreeNodeLabel', node.label).build(cntr)

            let children = db.span('MatcWidgetTypeTreeChildren').build(parentDiv)
            node.children.forEach(child => {
                this._renderNode(child, children, db, style, paddingLeft)
            })

            if (icon) {
              this.icons.push({
                  icon: icon,
                  children: children,
                  node: node
              })
            }
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
        if (this.model.props && this.model.props.selectOnlyLeaves && node.children.length){
          return;
        }
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

    setHover (o, isHover) {
      try {
        if (this.model.hover) {
          /**
           * Trigger only when not selected
           */
          if (o.node.value !== this.value) {
            let div = o.div
            if (isHover) {
              this.setTreeNodeStyle(div, this.model.hover)
            } else {
              this.setTreeNodeStyle(div, this.model.style)
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    },

    setTreeNodeStyle (div, style) {
      if (style.background) {
        div.style.background = style.background
      }
      if (style.color) {
        div.style.color = style.color
      }
      // width
      if (style.borderTopWidth) {
        let w = this._getBorderWidth(style.borderTopWidth);
        div.style.borderTopWidth = w + 'px'
      }
      if (style.borderBottomWidth) {
        let w = this._getBorderWidth(style.borderBottomWidth);
        div.style.borderBottomWidth = w + 'px'
      }
      if (style.borderRightWidth) {
        let w = this._getBorderWidth(style.borderRightWidth);
        div.style.borderRightWidth = w + 'px'
      }
      if (style.borderLeftWidth) {
        let w = this._getBorderWidth(style.borderLeftWidth);
        div.style.borderLeftWidth = w + 'px'
      }

      // color
      if (style.borderTopColor) {
        div.style.borderTopColor = style.borderTopColor
      }
      if (style.borderBottomColor) {
        div.style.borderBottomColor = style.borderBottomColor
      }
      if (style.borderRightColor) {
        div.style.borderRightColor = style.borderRightColor
      }
      if (style.borderLeftColor) {
        div.style.borderLeftColor = style.borderLeftColor
      }

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

      if (this.model.active) {
        this.nodes.forEach(node => {
            let div = node.div
            if (node.node.label === this.value) {
                this.setTreeNodeStyle(div, this.model.active)
            } else {
                this.setTreeNodeStyle(div, this.model.style)
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
