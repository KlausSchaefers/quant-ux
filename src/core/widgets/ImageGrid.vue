
<template>
    <div class="MatcWidgetTypeImageGrid">
  
        <div v-if="images.length === 0">
            No Images
        </div>
        <div v-else :class="'MatcWidgetTypeImageGridCntr ' + layout " 
            :style="{
              'gap': gap + 'px',
              'grid-template-columns': 'repeat(auto-fill, ' +imageW+ 'px)',
              'grid-auto-rows': imageH + 'px'
            }">
            <div v-for="(img,i) in images" :key="i" >
                <div 
                  ref="imageNodes" 
                  @mouseover="onImageHover(img, i, $event)"
                  @mouseout="onImageOut(img, i, $event)"
                  @click.stop="onImageClick(img, i, $event)"
                  :style="{
                    'background-image': img.src, 
                    'width': img.w +'px', 
                    'height': img.h + 'px', 
                    'borderRadius': borderRadius + 'px',
                    'boxShadow': boxShadow,
                    'backgroundColor': backgroundColor,
                    'borderColor': borderColor,
                    'borderWidth': borderWidth + 'px',
                    'borderStyle': borderStyle
                  }" 
                  :class="['MatcWidgetTypeImageGridImage', {'MatcWidgetTypeImageGridPlaceholder':img.placeholder }, {'MatcWidgetTypeImageGridSelected': img.selected}]" 
                >
                <span 
                   :style="{
                    'borderColor': selectColor
                  }" 
                  class="MatcWidgetTypeImageGridCntrHook" 
                  v-if="img.selected"></span>
                </div>
             
            
            </div>
        </div>        

    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  //import DomBuilder from "common/DomBuilder";
  import UIWidget from "core/widgets/UIWidget";
  import Logger from 'common/Logger'

  export default {
    name: "ImageGrid",
    mixins: [UIWidget, DojoWidget],
    data: function () {
      return {
        value: null,
        repeats: 3,
        animationDuration: 300,
        images:[],
        gap: 16,
        layout: 'grid',
        borderRadius: 0,
        imageW : 100,
        imageH: 100,
        boxShadow: '',
        borderColor: '',
        borderWidth: '',
        backgroundColor: '',
        borderStyle: 'solid',
        selectColor: '',
        selection:[]
      };
    },
    components: {},
    methods: {
      postCreate() {
        this._borderNodes = [];
        this._paddingNodes = [this.domNode];
        this._backgroundNodes = [];
        this._shadowNodes = [];
      },
  
      wireEvents() {
        this.wired = true;
        console.debug('wireEvents', this.wired)
      },

      onImageClick (img, i, e) {
        if (!this.wired) {
          return
        }

        if (this.model?.props?.selectionMode === 'none') {
            this.value = img.src
            this.emitDataBinding(this.value);
            this.emitClick(e);
        }
       
        if (this.model?.props?.selectionMode === 'single') {
          this.images.forEach(i => {
            i.selected = false
          })
        }
   
        img.selected = !img.selected 
        this.value = this.images.filter(i => i.selected).map(i => i.src)
        if (this.model?.props?.selectionMode === 'single') {
          this.value = this.value[0]
        }
        this.emitDataBinding(this.value);
        this.emitClick(e);

        this.selection = this.images.filter(i => i.selected).map(i => i.i)
        this.emit("change", this.selection);
      },
  
      onImageHover (img, i) {
        if (!this.wired) {
          return
        }
        if (!this.borderColorHover) {
          return
        }
        this.resetStyles()
        const node = this.$refs.imageNodes[i]
        if (node) {
          node.style.borderColor = this.borderColorHover
          node.style.boxShadow = this.boxShadowHover
        }
      },

      onImageOut () {
        if (!this.wired) {
          return
        }
        this.resetStyles()
      },

      resetStyles () {
        if (!this.$refs.imageNodes) {
          return
        }
        for (let i=0; i < this.images.length; i++) {
            const node = this.$refs.imageNodes[i]
            const img = this.images[i]
            if (node) {
              if (img.selected) {
                node.style.borderColor = this.selectColor
              } else {
                node.style.borderColor = this.borderColor
              }
              node.style.boxShadow = this.boxShadow
            }
        }
      },
        
      resize(box) {
        if (this.model.props.images && this.model.props.images.length) {
          // nothing
        } else {
          this.setPlaceholders(box, this.imageW, this.imageH)
        }
      },
  
      render(model, style, scaleX, scaleY) {

        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this._vertical = this.model.props.vertical;
    
        const w = Math.floor((this.model.props.imageWidth || 128) * scaleX)
        const h = Math.floor((this.model.props.imageHeight || 128) * scaleX)
        this.imageW = w
        this.imageH = h
        
        this.gap = Math.round(this.model.props.gap * scaleX)
        this.layout = this.model.props.layout
        this.borderRadius = Math.round(style.borderBottomLeftRadius  * scaleX)
        this.borderWidth = Math.round(style.borderTopWidth * scaleX)
  
        this.borderColor = style.borderTopColor
        this.boxShadow = this.getBoxShadow(style)
        this.backgroundColor = style.background
        this.selectColor = style.selectColor

        if (this.model.hover) {
            this.borderColorHover = this.model.hover.borderTopColor
            this.boxShadowHover = this.getBoxShadow(this.model.hover)
        }

        if (this.model.props.images && this.model.props.images.length) {
          this.images = this.model.props.images.map((url,i) => {
            return {
              src: this.getImageSRC(url),
              selected: false,
              i: i,
              w: w,
              h: h 
            }
          })

        } else {
          this.setPlaceholders(model, w, h)
          this.borderWidth = 1
        }

        this.setStyle(style);
        this.resize(this.model);
      },

      getBoxShadow(style) {
        if (style.boxShadow) {
          const shadow = style.boxShadow
          const v = this.getZoomed(shadow.v, this._scaleY);
          const h = this.getZoomed(shadow.h, this._scaleX);
          const b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
          var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
          const inset = shadow.i ? "inset" : "";
          return h + "px " + v + "px " + b + "px " + s + "px " + shadow.c + " " + inset;
        }
      },

      getImageSRC(image) {
        if (this.hash) {
          return "url(/rest/images/" + this.hash + "/" + image + ")";

        } else if (this.jwtToken) {
          return "url(/rest/images/" + image + "?token=" + this.jwtToken + ")";
        }
      },

      setPlaceholders(box, w, h) {
        const cols = Math.floor(box.w / w)
        const rows = Math.floor(box.h / h)
        this.images = []
        const placeholder = this.getPlaceHolder(w * 2, h * 2)
        for (let i=0; i < cols * rows; i++) {
            this.images.push({
              src: placeholder,
              placeholder: true,
              w: w,
              h: h 
            })
        }
     
      },
    
      getPlaceHolder(w, h) {
        const c = document.createElement("canvas");
        const context = c.getContext("2d");
        c.width = w;
        c.height = h;
        h += 0.5;
        w += 0.5;
        const n = 0.5;
        context.moveTo(n, n);
        context.lineTo(w, h);
        context.moveTo(w, n);
        context.lineTo(n, h);
        context.strokeStyle = "#333";
        context.strokeWidth = 2;
        context.imageSmoothingEnabled = false;
        context.stroke();
        return  "url(" + c.toDataURL("image/png") + ")";
      },
  
      getValue() {
        return this.value;
      },
  
      setValue(v) {
        this.value = v
      },
  
      getMouse(e) {
        const result = {};
        result.x = e.pageX;
        result.y = e.pageY;
        return result;
      },
  
      getState() {
        return {
          type: "select",
          value: this.selection,
        };
      },
  
      setState(state) {       
        if (state.type === 'select') {
          const selection = new Set(state.value)
          for (let i=0; i < this.images.length; i++) {
              const img = this.images[i]
              if (selection.has(i)) {
                img.selected = true
              } else {
                img.selected = false
              }
          }
          this.resetStyles()
        }
      },

      cleanUp () {

      },
  
      destroy() {
        if (this._compositeState) {
          this.emitCompositeState();
        }
        this.cleanUp();
      },
    },
    mounted() {
      this.logger = new Logger('ImageGrid')
    },
  };
  </script>