import Logger from 'common/Logger'
export default class DomUtil {

  constructor () {
    this.logger = new Logger('DomUtils')
    this.logger.log(-1, 'constructor', 'enter')
  }

  removeAllChildNodes(node) {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
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
}
