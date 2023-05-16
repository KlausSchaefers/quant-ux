
export function print(screen, fct = false) {
    let res = []
    printElement(res, screen, '', fct)
    if (screen.fixedChildren && screen.fixedChildren.length > 0) {
        res.push('--------------')
        screen.fixedChildren.forEach(c => {
            printElement(res, c, '*  ', fct)
        })
    }
    return res.join('\n')
}

function printElement(res, e, space='', fct) {
    let actions =''
    if (fct) {
        actions = fct(e)
    }
    //let parent = e.parent ? e.parent.name + ' '  + e.parent._id :  "null"
    let l = e.layout ? e.layout.type : '?'
    res.push(`${space}${e.name} - (${l}) ${actions} `)
    if (e.children) {
        e.children.forEach(c => {
            printElement(res, c, space + '  ', fct)
        });
    }
}

export function findScreen (app, name, result = []) {
    if (app.screens) {
        app.screens.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result[0]
}


export function findElementsByName (e, name, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result
}

export function findOneElementsByName (e, name, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    if (e.fixedChildren) {
        e.fixedChildren.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result[0]
}

export function findCSSBySelector (classes, selector) {
    return Object.values(classes).flatMap(c => c).filter(c => c.css.indexOf(selector) >=0)
}

export function hasCSSBySelector (classes, selector, code) {
    let matches = Object.values(classes).flatMap(c => c).filter(c => c.css.indexOf(selector) >=0)
    let found = matches.filter(match => match.code.indexOf(code) >= 0)
    return found.length > 0
}

export function findOneElementsByProp(e, value, prop, result = []) {
    if (e.children) {
        e.children.forEach(c => {     
            if (c[prop] === value) {
                result.push(c)
            }
            findOneElementsByProp(c, value, prop, result)
        })
    }
    return result[0]
}