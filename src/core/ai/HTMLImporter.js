import Logger from '../Logger'

export function html2QuantUX(html, node) {
    Logger.log(-1, 'HTMLImporter.html2QuantUX() > enter')
    node.innerText = ''
    const iframe = document.createElement('iframe')
    const promise = new Promise(resolve => {
            iframe.onload = () => {
                const root = iframe.contentWindow.document.getElementsByTagName('body')[0]
                const result = parseIFrame(root)
                resolve(result)
            }
    })
    iframe.srcdoc = html
    node.appendChild(iframe)
    return promise  
}

function parseIFrame(body) {
    const tree = createWidget(body)
    parseNode(body, tree)  
    return flattenTree(tree)
}

function flattenTree(tree) {
    /**
     * 1) Calc absulte position
     * 
     * 2) flatten nested text nodes like 'hallo <b> klaus</b>'
     * 
     * 3) Remove invisible elements (option convert to group)
     *      - no border and same color as parent...
     * 
     * 
     * 
     */
    return tree
}

function parseNode (node, parent, prefx='') {
   // console.debug(prefx, node.tagName, node.nodeType)

    if (isLeafNode(node)) {
        const label = node.nodeValue
        if (label && label.trim()) {
            //console.debug(prefx, 'Leaf >', label.trim(), '<')   
            //parent.props.label = label.trim()
            // create a label
        }
    }

  
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.nodeType === 1) {
            const widget = createWidget(child)
            parent.children.push(widget)
            console.debug(prefx, 'DOM >>> ', child.tagName)
            parseNode(child, widget, prefx + '  ')
        } else {
            parseNode(child, parent, prefx + '  ')
        }
        // if (type ===  3) {
        //     console.debug(prefx, 'TEXT >>> ', child.data)
        // }
        //
        // const computedStyle = getComputedStyle(child)
        // 


    }


}

function createWidget(node) {
    /**
     * map here
     * 
     * check input
     * 
     * get positon
     * 
     * get style
     * 
     * from placeholder
     * 
     * labeled checkbox?
     */
    const widgetType = 'box'
    return {
        _tag: node.tagName,
        type: widgetType,
        props: {},
        style:{},
        children: []
    }
}

function isLeafNode(node) {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const type = child.nodeType
        if (type === 3) {
            return false
        }
    }
    return true
}