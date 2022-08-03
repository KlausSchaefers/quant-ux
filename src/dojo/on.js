import touch from 'dojo/touch'

export default function on (node, event, callback, options) {
    /**
     * Widget have an on method. We use this instead
     */
    if (node.on) {
        return node.on(event, callback)
    } else {
        if (node && node.toLowerCase) {
            node = document.getElementById(node)
        }
        if (node && node.addEventListener) {
            /**
             * IF we are mobile and use touch events, we might send the events to active events,
             * by setting passive:false. The touch class handles this distinction for us!
             */
            if (!options){
                options = touch.options
            }
            node.addEventListener(event, callback, options)
            return {
                'callback': callback,
                'node': node,
                'event': event,
                'options': options,
                'remove': function () {
                    this.node.removeEventListener(this.event, this.callback, options)
                }
            }
        } else {
            console.warn('on() > Pass a node of valid id')
        }
    }
}