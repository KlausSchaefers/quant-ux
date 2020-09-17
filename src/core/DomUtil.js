import Logger from 'common/Logger'
export default class DomUtil {

  constructor () {
    this.logger = new Logger('DomUtils')
    this.logger.log(1, 'constructor', 'enter')
  }

  removeAllChildNodes(node) {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  }

  setBox (div, box) {
    // div.style.cssText = `width: ${box.w}px; height: ${box.h}px; top: ${box.y}px; left: ${box.x}px`;
    div.style.width = box.w + "px",
    div.style.height = box.h + "px",
    div.style.left = box.x + "px";
    div.style.top = box.y + "px";
  }

  setPos (div, pos) {
    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";
  }

  setXY (div, x, y) {
    div.style.left = x +"px";
    div.style.top = y +"px";
  }

  getPos (div) {
    var s =  window.getComputedStyle(div, null)
    var x = s.left.replace("px","") *1 ;
    var y = s.top.replace("px","") *1;
    return {x : x , y : y};
  }

  static stopEvent (e) {
    try {
      if (e && e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
    } catch (err){
      console.warn('DojoWidget.stopEvent', err, e)
    }
  }

  static getMousePosition (e){
    // updated and synced with simulator
    // in case of error roll back and change mixin order in simulator
    var result = {x: 0, y: 0};
    if (e) {
      if (e.touches && e.touches.length > 0) {
        e = e.touches[0]
        result.x = e.clientX;
        result.y = e.clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0 ) {
        e = e.changedTouches[0]
        result.x = e.clientX;
        result.y = e.clientY;
      } else {
        result.x = e.pageX;
        result.y = e.pageY;
      }
    }
    return result;
  }

  static position (node, includeScroll) {
    if (node && node.toLowerCase) {
        node = document.getElementById(node)
    }
    let ret = node.getBoundingClientRect();
    ret = {x: ret.left, y: ret.top, w: ret.right - ret.left, h: ret.bottom - ret.top};
    if(includeScroll){
      var scroll = DomUtil.docScroll(node.ownerDocument);
      ret.x += scroll.x;
      ret.y += scroll.y;
    }
    return ret;
  }

  static  docScroll () {
    var node = document.parentWindow || document.defaultView;
    return {x: node.pageXOffset, y: node.pageYOffset }
  }

  static body () {
      return document.getElementsByTagName("BODY")[0]
  }

  static getBox (doc){
      doc = doc || window.document;
      var scrollRoot = doc.documentElement
      var scroll = DomUtil.docScroll(doc)
      var w = 0
      var h = 0
      w = scrollRoot.clientWidth;
      h = scrollRoot.clientHeight;
      return {
          l: scroll.x,
          t: scroll.y,
          w: w,
          h: h
      };
  }

}
