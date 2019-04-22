var fs = require('fs');

export function parseImport (body) {
    let defineStartPos = body.indexOf('[')
    if (defineStartPos >= 0) {
        body = body.substring(defineStartPos)
    }
    let defineEndPos = body.indexOf(']')
    let codeDefine = body.substring(8, defineEndPos)
    let imports = []
    let parts = codeDefine.split(',')
    parts.forEach(p => {
        p = p.replace(/\"/g, '')
        p = p.replace(/\n/g, '')
        p = p.trim()
        // console.debug("  parseDefine() >>  ", p)
        if (p.indexOf('declare') < 0 && p.indexOf('dijit/_TemplatedMixin') < 0 && p.indexOf('dijit/_WidgetBase') < 0 && p.indexOf('dojox') < 0) {
            imports.push(p)
        }
    })
    return imports
}

export function parseGlobals (header) {
    let globals = []
    let lines = header.split('\n')
    lines.forEach(line => {
        line = line.trim()
        if (line.length > 0 && line.indexOf('/') < 0 && line.indexOf('*') < 0) {
            let parts = line.split(' ').filter(p => p.trim().length > 0)
            if (parts.length === 4) {
                globals.push({
                    name: parts[1],
                    value: parts[3]
                })
            }
        }
    })
    return globals
}

export function parseArray (str) {
    str = str.replace('[','')
    str = str.replace(']','')
    let parts = str.split(',')
    let result = parts.map(p => {
        return p.trim()
    })
    // console.debug('   parseArray() >> ', result)
    return result
}

export function parseDeclare (body) {   
    var res = body.match(/\[(.*)\]/g)
    if (res.length > 0) {
        let mixins = parseArray(res[0])
        mixins = mixins.filter(m => {
            return m.indexOf('TemplateMixin') < 0 &&
                   m.indexOf('WidgetBase') < 0 &&
                   m.indexOf('_Widget') < 0
        })
        // console.debug('parseDeclare() >> ', mixins)
        return mixins
    }
    return []
}

export function cutLast(string, split) {
    let pos = string.lastIndexOf(split)
    if (pos > 0) {
        return [string.substring(0, pos), string.substring(pos + 1)]
    }
    return [string, '']
}

export function cut(string, split) {
    let pos = string.indexOf(split)
    if (pos > 0) {
        return [string.substring(0, pos), string.substring(pos + 1)]
    }
    return [string, '']
}

export function parsePrivate(line, result) {
    line = line.trim()
    if (line.length > 0) {
        let colPos = line.indexOf(':')
        if (colPos > 0) {  
            let name = line.substring(0, colPos).trim()
            let value = line.substring(colPos + 1).trim()
            value = cutLast(value, ',')[0]
            result.push({
                name: name,
                value: value
            })            
        }
    }
}

export function parseTemplate(template) {
    // console.debug('  parseTemplate() >> ', template)
    let result = []
    let templateStart = template.indexOf(':')
    if (templateStart > 0) {
        template = template.substring(templateStart + 1)
        let lines = template.split('\n')
        lines.forEach(l => {
            l = l.replace(/'/g, '')
            let plus = l.lastIndexOf('+')
            if (plus > 0) {
                l = l.substring(0, plus)
            }
            result.push(l)
        })
    }
    return result
}

export function parseBody(body, result){
    result.privates = []
    result.body = []
    let declareStartPos = body.indexOf('return declare')
    let innerCode = body.substring(declareStartPos)
    let innerCodeStart = innerCode.indexOf('{')
    innerCode = innerCode.substring(innerCodeStart + 1)
    let inderCodeEndPos = innerCode.lastIndexOf('});')
    if (inderCodeEndPos > 0) {
        innerCode = innerCode.substring(0, inderCodeEndPos)
        inderCodeEndPos = innerCode.lastIndexOf('});')
        if (inderCodeEndPos > 0) {
            innerCode = innerCode.substring(0, inderCodeEndPos)
        }
    }

    // check of template string
    let templateStart = innerCode.indexOf('templateString')
    if (templateStart > 0) {
        let templateEnd = innerCode.indexOf('\',')
        if (templateEnd > 0) {
            let template = innerCode.substring(templateStart + 'templateString'.length, templateEnd)
            result.template = parseTemplate(template)
            innerCode = innerCode.substring(templateEnd)
        }
    }

    let lines = innerCode.split('\n')
    let matchedFunction = false
    lines.forEach(l => {
        if (!matchedFunction && l.indexOf('function') > 0) {
            matchedFunction = true
         }
        if (matchedFunction) {
            result.body.push(l)
        } else {
            parsePrivate(l, result.privates)
        }
    })
    return result
}

export function parse (root, file) {
    let parts = file.split('/')
    let name = parts.pop()
    if (parts[0] === '.')
        parts.shift()
    let path = parts.join('/')
    let result = {
        file: file,
        name: name,
        path: path,
        imports: []
    }
    if (fs.existsSync(root + '/' + file)) {
        var code = fs.readFileSync(root + '/' + file, 'utf8');
    
        let defineStartPos = code.indexOf('define(')
        if (defineStartPos >= 0) {
            let header = code.substring(0, defineStartPos);
            let body = code.substring(defineStartPos)
            result.globals = parseGlobals(header)
            result.imports = parseImport(body)
            result.mixins = parseDeclare(body)
            parseBody(body, result)
        } else {
            console.debug('ne define in')
        }
        return result;
    }
   
}

/**
 *  code gen
 */
export function rewriteImport(imp, packageMapping) {
    if (packageMapping && packageMapping.replace && packageMapping.replace[imp]) {
        return packageMapping.replace[imp]
    }
    if (packageMapping && packageMapping.rewrite) {
        for (let prefix in packageMapping.rewrite) {
            let path = cutLast(imp, '/')[0]
            if (path === prefix) {
                return packageMapping.rewrite[prefix] +  imp.substring(prefix.length)
            }
        }
    }
    if (packageMapping && packageMapping.cut) {
        for (let i=0; i < packageMapping.cut.length; i++) {
            let cut = packageMapping.cut[i]
            if (imp.indexOf(cut) === 0) {
                return imp.substring(cut.length)
            }
        }
    }
    return `${imp}`
}

export function convertImports(widget, packageMapping) {
    let result =''
    widget.imports.forEach(i => {
        i =  rewriteImport(i, packageMapping)
        let parts = i.split('/')
        let name = parts.pop()
        let path = parts.join('/')
        result += `import ${name} from '${path}/${name}'\n`
    })
    return result
}

export function convertToVue (widget, packageMapping) {
    let result =''

    if (!widget.template){
        widget.template = []
    }
    let template = widget.template.join('\n')

    let imports = convertImports(widget, packageMapping)

    let body = widget.body.join('\n').trim()

    let name = cutLast(widget.name, '.js')[0]

    widget.mixins.push('DojoWidget')
    let mixins = widget.mixins.join(', ')

    let data = widget.privates.map(p => {
        return `${p.name}: ${p.value}`
    }).join(', \n            ')

    let globals = widget.globals.map(p => {
        return `var ${p.name} = ${p.value}`
    }).join('\n')

    result += `
<template>
    ${template}
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
${imports}

${globals}

export default {
    name: '${name}',
    mixins:[${mixins}],
    data: function () {
        return {
            ${data}
        }
    },
    components: {},
    methods: {
        ${body}
    }, 
    mounted () {
    }
}
</script>`
    return result
}

export function convertToJS (widget, packageMapping) {
    // console.debug('convertToJS',widget)
    let result =''

    let imports = convertImports(widget, packageMapping)

    let body = widget.body.join('\n').trim()
    body = body.replace(/\},/g, '}')
    body = body.replace(/:function/g, ' ')
   
    let data = widget.privates.map(p => {
        return `this.${p.name} = ${p.value}`
    }).join('\n            ')

    let globals = widget.globals.map(p => {
        return `var ${p.name} = ${p.value}`
    }).join('\n')

    let name = cutLast(widget.name, '.js')[0]

    result += `
${imports}

${globals}

export default class ${name} {
    constructor() {
        ${data}
    }
    ${body}
}`
    return result
}

export function convert(root, file, packageMapping) {
    console.debug('convert() > ', root, file)
    let widget = parse(root, file)
    if (widget){
        widget.result = convertToVue(widget, packageMapping)
    }
    return widget
}


export function convertRec(root, widget, result, ignore, mapping) {
    // console.debug('  converRec', widget.file, widget.imports )
    widget.imports.forEach(imp => {
        if (imp.indexOf('dojo') < 0 && imp.indexOf('dijit') < 0 && imp.trim().length > 0 ) {
            if (!result[imp]) {
                let child = convert(root, imp + '.js', mapping)
                if (child) {
                    result[imp] = child
                    convertRec(root, child, result, ignore, mapping)
                }
            }
        } else {
            if (ignore.indexOf(imp) < 0) {
                ignore.push(imp)
            }
        }
    })
}

/**
 * main
 */
export function run (root, file, dest, mapping) {
    console.debug('**********************************')
    console.debug('run() >', root, file, dest)
    console.debug('**********************************')
    let log = []
    let widget = convert(root, file + '.js', mapping)
    let result = {}
    let ignore = []
    let errors = []
    result[file] = widget
    convertRec(root, widget, result, ignore, mapping)
    
    for (let f in result) {
        let w = result[f]
        if (w.result) {
            let outFile = dest + rewriteImport(w.file, mapping)
            if (w.template && w.template.length > 0) {
                outFile = outFile.replace('.js', '.vue')
            }
            log.push('parsed > ' + f + ' (' + w.imports.length + ') >> ' + outFile)
            if (!fs.existsSync(outFile)) {
                fs.writeFileSync(outFile, w.result)
            }
        } else {
            errors.push('Cannot convert', f)
        }
    }

    ignore.forEach(i => {
        log.push('ignore > ' + i)
    })

    errors.forEach(i => {
        log.push('error > ' + i)
    })



    console.debug(log.join('\n'))
}

