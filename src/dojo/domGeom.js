import win from 'dojo/_base/win'

class domGeom {

    docScroll () {
			var node = win.doc.parentWindow || win.doc.defaultView;
			return {x: node.pageXOffset, y: node.pageYOffset }
    }

    position (node, includeScroll) {
			if (node && node.toLowerCase) {
				node = document.getElementById(node)
			}
			let ret = node.getBoundingClientRect();
			ret = {x: ret.left, y: ret.top, w: ret.right - ret.left, h: ret.bottom - ret.top};
			if(includeScroll){
				var scroll = this.docScroll(node.ownerDocument);
				ret.x += scroll.x;
				ret.y += scroll.y;
			}
			return ret;
    }

}

export default new domGeom()