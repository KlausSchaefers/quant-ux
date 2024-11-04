
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
            <div v-for="(img,i) in images" :key="i" ref="imageNodes" >
                <div
                @click.stop="onImageClick(img, $event)"
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
        selectColor: ''
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
        
        // this.tempOwn(
        //   this.addTouchStart(this.domNode, lang.hitch(this, "onDndStart"))
        // );
        this.wireHover()
      },

      onImageClick (img, e) {
        if (!this.wired) {
          return
        }
        img.selected = true
        //this.emit("change", this.value );
        this.emitClick(e);
        this.$forceUpdate()
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
    
        const w = (this.model.props.imageWidth || 128) * scaleX
        const h = (this.model.props.imageHeight || 128) * scaleX
        this.imageW = w
        this.imageH = h
        
        this.gap = this.model.props.gap
        this.layout = this.model.props.layout
        this.borderRadius = style.borderBottomLeftRadius  * scaleX
        this.borderWidth = style.borderTopWidth * scaleX
  
        this.borderColor = style.borderTopColor
        this.boxShadow = this.getBoxShadow(style)
        this.backgroundColor = style.background
        this.selectColor = style.selectColor

      

        if (this.model.props.images && this.model.props.images.length) {
          this.images = this.model.props.images.map(url => {
            return {
              src: this.getImageURL(url),
              selected: false,
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
        this.setValue(0);
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

      getImageURL(image) {
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
  
      setValue(pos) {
        //console.debug("setValue", pos);
  
        // if (this.mode == "edit") {
        //   this.setImage(0, this.getImage(pos));
        // } else {
        //   this.setImage(0, this.getImage(pos - 1));
        //   this.setImage(1, this.getImage(pos));
        //   this.setImage(2, this.getImage(pos + 1));
        //   this.setCntrPos(-1);
        // }
  
        this.value = pos;
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
          value: this.value,
        };
      },
  
      setState() {       
        
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