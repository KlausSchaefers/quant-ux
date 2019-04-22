class registry {

    constructor () {
        this.components = {}
        this.compontentCounter = 0
    }

    byNode (node) {
        return this.components[node.getAttribute("widgetId")]; // dijit/_WidgetBase	// dijit/_WidgetBase
    }

    byId (id) {
        return typeof id == "string" ? this.components[id] : id;	
    }

    remove (widget) {
        delete this.components[widget.id]
    }

    add (widget) { 
        widget.id = 'w' + this.compontentCounter++; // or add the name as well?
        if (widget.$el) {
            try {
                widget.$el.setAttribute('widgetid', widget.id)
            } catch (err) {
                console.warn('registry.add() > no $el', widget)
            }
        } else {
            console.warn('registry.add() > no $el', widget)
        }
        if(this.components[widget.id]){
            throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
        }
        this.components[widget.id] = widget;
    }
}
export default new registry()