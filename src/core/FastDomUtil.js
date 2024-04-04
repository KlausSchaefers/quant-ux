import Logger from 'common/Logger'

export default class FastDomUtil {

  constructor () {
    this.logger = new Logger('FastDomUtil')
    this.logger.log(1, 'constructor', 'enter')
    // we need abs because of some z-Index issues
    // FIXME: can we translate the properties section to come 
    // to the same stacking context?
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context
    this.isAbs = false 
  }

  removeAllChildNodes(node) {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  }

  setBox (div, box) {
    div.style.width = box.w + "px"
    div.style.height = box.h + "px"

    if (this.isAbs) {
      div.style.left = box.x + "px";
      div.style.top = box.y + "px";
      div.style.transform = ''
    } else {
      div.style.left = "0px";
      div.style.top = "0px";
      div.style.transform = `translate(${box.x}px, ${box.y}px)`;
    }
    div.pos_x = box.x;
    div.pos_y = box.y
  }

  setScale (div, scale = 1) {
    div.style.transform = `scale(${scale}) `;
  }

  setPos (div, pos, isABS = false) {
    //console.debug('setPos', isABS)
    if (this.isAbs || isABS === true) {
      div.style.left = pos.x + "px";
      div.style.top = pos.y + "px";
      div.style.transform = ''
    } else {
      div.style.left = "0px";
      div.style.top = "0px";
      div.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
    div.pos_x = pos.x;
    div.pos_y = pos.y
  }

  setXY (div, x, y) {

    if (this.isAbs) {
      div.style.left = x + "px";
      div.style.top = y + "px";
      div.style.transform = ''
    } else {
      div.style.left = "0px";
      div.style.top = "0px";
      div.style.transform = `translate(${x}px, ${y}px)`;
    }
    div.pos_x = x;
    div.pos_y = y

  }

  getPos (div) {
    let x = div.pos_x * 1;
    let y = div.pos_y *1;
    return {x : x , y : y};
  }
}