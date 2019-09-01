
import css from "dojo/css";
import lang from "dojo/_base/lang";

export default class AnimationWrapper {

    /**
     * Is called when in simulator to wire only when needed.
     */
    wireEvents () {}


    /**
     * Gets called from the RenderFactory. Simple classes do not need to overwrite
     */
    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    }

    getScaledValue (v ) {
      return this._scaleX * v
    }

    /**
     * Gets called after resizing in canvas
     */
    resize(box) {
      if (this.domNode.parentNode) {
        this.domNode.style.height = Math.round(box.h) + "px";
        this.domNode.style.width = Math.round(box.w) + "px";
      }
    }

    /**
     * Gets called by RenderFactory...
     */
    beforeDestroy() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
    }

    /**
     * Get the node for inline editing
     */
    getLabelNode() {
      return null;
    }

    setFactory(m) {
      this.factory = m;
    }
  
    onScreenRendered() {
        if (!this._onScreenRenderedCalled) {
            this.hideErrorLabel();
            this._onScreenRenderedCalled = true;
        }
    }

    setAnimatedPos(pos, style) {
      // FIXME: For rotate we ignore positioning!! This will
      // cause issues for transform things with onLoad.
      if (style && (style.rotate != null || style.rotate != undefined)) {
        return;
      }

      if (this.domNode) {
        /**
         * X and Y as css3 translate
         */
        var trans = "translate(" + pos.x + "px," + pos.y + "px) ";

        var w = pos.w + this.model.w;
        var h = pos.h + this.model.h;
        // this.resize({w:w,h:h});

        if (pos.w != undefined || pos.h != undefined) {
          w = w / this.model.w;
          h = h / this.model.h;
          trans += " scale(" + w + "," + h + ")";
          this.domNode.style.transformOrigin = "0% 0%";
          this.domNode.style.webkitTransformOrigin = "0% 0%";
        }

        var node = this.getAnimationNode();
        if (node) {
          node.style.transform = trans;
          node.style.webkitTransform = trans;
        } else {
          console.warn("No anim node");
        }
        this._lastAnimPos = pos;
      }

      //
    }

    /**
     * Some widgets might need to animate the parent node, e.g. all text boxes.
     */
    getAnimationNode() {
      return this.domNode;
    }

    setAnimatedStyle(style) {
      if (this.domNode) {
        /**
         * FIXME: This will cause fat animations in the log!! Maybe
         * we could do it better in Animation.js... The problem
         * are undo animation, where suddenly textSize is
         * undefined and set to 0
         */
        if (!this.animatedStyle) {
          this.animatedStyle = lang.clone(this.style);
        }
        for (var key in style) {
          this.animatedStyle[key] = style[key];
        }

        this.setStyle(this.animatedStyle);
      } else {
        console.debug("setAnimatedStyle() > No DomNode");
      }
    }

    getAnimatedStyle() {
      if (this.animatedStyle) {
        return this.animatedStyle;
      }

      return this.style;
    }



    stripHTML(s) {
      if (!s) {
        s = "";
      }
      s = s.replace(/<\/?[^>]+(>|$)/g, "");
      s = s.replace(/%/g, "$perc;");
      return s;
    }

    setInnerHTML(e, txt) {
      if (e) {
        txt = this.stripHTML(txt);
        txt = txt.replace(/\n/g, "<br>");
        txt = txt.replace(/\$perc;/g, "%");
        e.innerHTML = txt;
      } else {
        console.warn("setInnerHTML() > No node to set test > ", txt);
      }
    }

    setScalledNodeStyle(node, style, list) {
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var w = this._getBorderWidth(style[p]);
        node.style[p] = w + "px";
      }
    }

    setBorderColor() {
      this._setBorderStyle(
        "borderTopColor",
        this.domNode,
        this.style,
        this.model
      );
      this._setBorderStyle(
        "borderBottomColor",
        this.domNode,
        this.style,
        this.model
      );
      this._setBorderStyle(
        "borderRightColor",
        this.domNode,
        this.style,
        this.model
      );
      this._setBorderStyle(
        "borderLeftColor",
        this.domNode,
        this.style,
        this.model
      );
    }

    _setBorderRadius(node, style) {
      for (var i = 0; i < this.borderRadius.length; i++) {
        var key = this.borderRadius[i];
        var w = this._getBorderWidth(style[key]);
        node.style[key] = w + "px";
      }
    }

    _setBorder(node, style) {
      this._setBorderRadius(node, style);
    }

    setStyle(style, model) {
      for (var p in style) {
        if (this["_set_" + p]) {
          this["_set_" + p](this.domNode, style, model);
        } else {
          if (style[p] != null) {
            this.domNode.style[p] = style[p];
          } else {
            //console.warn("The style", p ," is no value!", model);
          }
        }
      }
    }

    /**
     * Rotate around middle! This would cause problems if there is any deformation like
     * scale going on!
     */
    _set_rotate(parent, style) {
      var trans = "rotate(" + Math.round(style.rotate) + "deg)";
      this.domNode.style.transform = trans;
      this.domNode.style.webkitTransform = trans;
      this.domNode.style.transformOrigin = "50% 50%";
      this.domNode.style.webkitTransformOrigin = "50% 50%";

      this._currentTransform = trans;
    }

    _set_fontSize(parent, style) {
      var size = style.fontSize * this._scaleX;
      if (this._scaleX < 1) {
        size = size * 0.95;
      }
      parent.style.fontSize = size + "px";
    }

    _set_css(parent, style) {
      css.add(parent, style.css);
    }

    _set_boxShadow(parent, style) {
      var shadow = style.boxShadow;
      if (shadow) {
        var v = this.getZoomed(shadow.v, this._scaleY);
        var h = this.getZoomed(shadow.h, this._scaleX);
        var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
        var inset = shadow.i ? "inset" : "";

        var value =
          h +
          "px " +
          v +
          "px " +
          b +
          "px " +
          s +
          "px " +
          shadow.c +
          " " +
          inset;
        if (this._shadowNodes) {
          for (var i = 0; i < this._shadowNodes.length; i++) {
            var node = this._shadowNodes[i];
            node.style.boxShadow = value;
          }
        } else {
          parent.style.boxShadow = value;
        }
      } else {
        parent.style.boxShadow = "none";
      }
    }

    _setShadow(parent, shadow) {
      var v = this.getZoomed(shadow.v, this._scaleY);
      var h = this.getZoomed(shadow.h, this._scaleX);
      var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
      var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
      var inset = shadow.i ? "inset" : "";
      var value =
        h + "px " + v + "px " + b + "px " + s + "px " + shadow.c + " " + inset;
      parent.style.boxShadow = value;
    }

    _set_textShadow(parent, style) {
      var shadow = style.textShadow;
      if (shadow) {
        var v = this.getZoomed(shadow.v, this._scaleY);
        var h = this.getZoomed(shadow.h, this._scaleX);
        var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        parent.style.textShadow = h + "px " + v + "px " + b + "px " + shadow.c;
      } else {
        parent.style.textShadow = "none";
      }
    }

    _set_padding(parent, style) {
      parent.style.padding = Math.round(style.padding * this._scaleX) + "px";
    }

    _setBorderStyle(key, parent, style) {
      if (this._borderNodes) {
        for (var i = 0; i < this._borderNodes.length; i++) {
          var node = this._borderNodes[i];
          node.style[key] = style[key];
        }
      }
    }

    _setScalledBorderStyle(key, parent, style) {
      if (this._borderNodes) {
        for (var i = 0; i < this._borderNodes.length; i++) {
          var node = this._borderNodes[i];
          var w = this._getBorderWidth(style[key]);
          node.style[key] = w + "px";
        }
      } else {
        //console.warn("UIWidget._setScalledBorderStyle() > Cannot apply " + key);
      }
    }

    _set_opacity(parent, style) {
      /**
       * Invisible elements should let clicks through...
       */
      if (style.opacity === 0) {
        css.add(parent, "MatcHidden");
      } else {
        css.remove(parent, "MatcHidden");
      }
      if (style.opacity <= 1) {
        parent.style.opacity = style.opacity;
      }
    }

    _set_borderTopWidth(parent, style) {
      this._setScalledBorderStyle("borderTopWidth", parent, style);
    }

    _set_borderBottomWidth(parent, style) {
      this._setScalledBorderStyle("borderBottomWidth", parent, style);
    }

    _set_borderLeftWidth(parent, style) {
      this._setScalledBorderStyle("borderLeftWidth", parent, style);
    }

    _set_borderRightWidth(parent, style) {
      this._setScalledBorderStyle("borderRightWidth", parent, style);
    }

    /**
     * Border radius
     */

    _set_borderRadius(parent, style) {
      this._setScalledBorderStyle("borderRadius", parent, style);
    }

    _set_borderTopLeftRadius(parent, style) {
      this._setScalledBorderStyle("borderTopLeftRadius", parent, style);
    }

    _set_borderTopRightRadius(parent, style) {
      this._setScalledBorderStyle("borderTopRightRadius", parent, style);
    }

    _set_borderBottomLeftRadius(parent, style) {
      this._setScalledBorderStyle("borderBottomLeftRadius", parent, style);
    }

    _set_borderBottomRightRadius(parent, style) {
      this._setScalledBorderStyle("borderBottomRightRadius", parent, style);
    }

    /**
     * color
     */

    _set_borderColor(parent, style) {
      this._setBorderStyle("borderColor", parent, style);
    }

    _set_borderTopColor(parent, style) {
      this._setBorderStyle("borderTopColor", parent, style);
    }

    _set_borderBottomColor(parent, style) {
      this._setBorderStyle("borderBottomColor", parent, style);
    }

    _set_borderRightColor(parent, style) {
      this._setBorderStyle("borderRightColor", parent, style);
    }

    _set_borderLeftColor(parent, style) {
      this._setBorderStyle("borderLeftColor", parent, style);
    }

    /**
     * Style
     */
    _set_borderTopStyle(parent, style) {
      this._setBorderStyle("borderTopStyle", parent, style);
    }

    _set_borderBottomStyle(parent, style) {
      this._setBorderStyle("borderBottomStyle", parent, style);
    }

    _set_borderRightStyle(parent, style) {
      this._setBorderStyle("borderRightStyle", parent, style);
    }

    _set_borderLeftStyle(parent, style) {
      this._setBorderStyle("borderLeftStyle", parent, style);
    }

    /**
     * Padding
     */
    _setScalledPadding(key, parent, style) {
      if (this._paddingNodes) {
        for (var i = 0; i < this._paddingNodes.length; i++) {
          var node = this._paddingNodes[i];
          var w = this._getBorderWidth(style[key]);
          node.style[key] = w + "px";
        }
      } else {
        //console.warn("UIWidget._setScalledPadding() > Cannot apply " + key);
      }
    }

    _set_paddingTop(parent, style) {
      this._setScalledPadding("paddingTop", parent, style);
    }

    _set_paddingLeft(parent, style) {
      this._setScalledPadding("paddingLeft", parent, style);
    }

    _set_paddingRight(parent, style) {
      this._setScalledPadding("paddingRight", parent, style);
    }

    _set_paddingBottom(parent, style) {
      this._setScalledPadding("paddingBottom", parent, style);
    }

    /**
     * Background
     */
    _set_background(parent, style) {
      if (this._backgroundNodes) {
        for (var i = 0; i < this._backgroundNodes.length; i++) {
          var node = this._backgroundNodes[i];
          if (node) {
            node.style.background = style.background;
          } else {
            console.warn("UIWidget._set_background() > No node ", this.model);
          }
        }
      }
    }

    /**
     * background image
     */
    _set_backgroundImage(parent, style, model) {
      if (this._borderNodes) {
        var node = this._borderNodes[model.id];
        if (node) {
          parent = node;
        }
      }

      var img = style.backgroundImage;
      if (img) {
        css.add(parent, "MatcScreenImage");
        if (img) {
          if (img.w > img.h) {
            css.add(parent, "MatcScreenImageHorizontal");
          } else {
            css.add(parent, "MatcScreenImageVertical");
          }
          if (this.hash) {
            parent.style.backgroundImage =
              "url(/rest/images/" + this.hash + "/" + img.url + ")";
          } else {
            var url = "url(/rest/images/" + img.url + ")";
            parent.style.backgroundImage = url;
          }

          if (style.backgroundSize) {
            parent.style.backgroundSize = style.backgroundSize + "%";
          } else {
            parent.style.backgroundSize = "100%"; // 100%
          }

          if (style.backgroundPosition && this.model) {
            var pos = style.backgroundPosition;
            parent.style.backgroundPosition =
              Math.round(pos.left * this.model.w) +
              "px " +
              Math.round(pos.top * this.model.h) +
              "px";
            parent.style.webkitBackgroundPosition =
              Math.round(pos.left * this.model.w) +
              "px " +
              Math.round(pos.top * this.model.h) +
              "px";
          } else {
            parent.style.backgroundPosition = "0 0"; // 100%
          }

          parent.style.backgroundRepeat = "no-repeat";
        } else {
          parent.style.backgroundImage = "none";
        }
      }
    }

    _set_verticalAlign(parent, style) {
      if (this._labelNodes) {
        for (var i = 0; i < this._labelNodes.length; i++) {
          var label = this._labelNodes[i];
          // reset class.. this is a little hacky! We should not do this too often!
          label.className = "MatcInlineEditable";
          if (style.textAlign) {
            css.add(
              label,
              "MatcInlineEditVAlign-" +
                style.verticalAlign +
                "-" +
                style.textAlign
            );
          } else {
            css.add(label, "MatcInlineEditVAlign-" + style.verticalAlign);
          }
        }
      }
    }

    _set_letterSpacing(parent, style) {
      parent.style.letterSpacing = style.letterSpacing * this._scaleX + "px";
    }

    /**********************************************************************
     * helper methods!
     **********************************************************************/

    stopPropagation(e) {
      if (e) {
        e.stopPropagation();
      }
      return false;
    }

    stopEvent(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      return false;
    }

    getScreenDiv() {
      var parent = this.domNode.parentNode;
      while (parent) {
        if (css.contains(parent, "MatcScreen")) {
          return parent;
        }
        parent = parent.parentNode;
      }
    }

    _getBorderWidth(w) {
      if (w > 0) {
        return Math.max(1, this.getZoomed(w, this._scaleX));
      }
      return 0;
    }

    getZoomed (v, zoom) {    
        return Math.round(v * zoom);
    }

    getState () {

    }

    setState() {

    }

    destroy () {
        
    }
  
}
  