import Screen from './Screen'

export default class Container extends Screen {

    setParentWidgets () {
		//let parentWidgets = this.getParentWidgets(widget, this.model)
		//parentWidgets.forEach(parent => {
		//	if (parent.children) {
		//		var pos = parent.children.indexOf(widget.id);
		//		if(pos < 0) {
		//			parent.children.push(widget.id)
		//		}
		//	}
		//})
	}

	cleanUpParentWidgets () {
		//console.debug('Repeater.cleanup')
		//for (let id in this.model.widgets){
		//	let parent = this.model.widgets[id];
		//	if (parent.isContainer && parent.children) {
		//		let pos = parent.children.indexOf(widget.id);
		//		if(pos != -1) {
		//			this.logger.log(0,"cleanUpParent", "remove Conatiner " + widget.id  +" from " + parent.id);
		//			parent.children.splice(pos, 1);
		//		}
		//	}
		//}
    }

}