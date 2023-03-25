const labelStyle = {

    "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
    "letterSpacing": 0,
    "lineHeight": 1,
    "color": "#333333",
    "boxShadow": null,
    "background": null
}

const buttonStyle = {
    "fontSize": 14,
    "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
    "textAlign": "center",
    "letterSpacing": 0,
    "lineHeight": 1,
    "color": "#FFFFFF",
    "paddingTop": 0,
    "paddingBottom": 0,
    "paddingLeft": 0,
    "paddingRight": 0,
    "borderTopRightRadius": 3,
    "borderTopLeftRadius": 3,
    "borderBottomRightRadius": 3,
    "borderBottomLeftRadius": 3,
    "borderTopWidth": 1,
    "borderBottomWidth": 1,
    "borderRightWidth": 1,
    "borderLeftWidth": 1,
    "verticalAlign": "middle",
    "borderTopColor" : "#333333",
    "borderBottomColor" : "#333333",
    "borderRightColor" : "#333333",
    "borderLeftColor" : "#333333",
    "background" : "#333333",
    "boxShadow": null
}

const containerStyle = {
    "fontSize": 14,
    "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
    "textAlign": "center",
    "letterSpacing": 0,
    "lineHeight": 1,
    "color": "#333333",
    "paddingTop": 0,
    "paddingBottom": 0,
    "paddingLeft": 0,
    "paddingRight": 0,
    "borderTopRightRadius": 3,
    "borderTopLeftRadius": 3,
    "borderBottomRightRadius": 3,
    "borderBottomLeftRadius": 3,
    "borderTopWidth": 1,
    "borderBottomWidth": 1,
    "borderRightWidth": 1,
    "borderLeftWidth": 1,
    "verticalAlign": "middle",
    "borderTopColor" : "#333333",
    "borderBottomColor" : "#333333",
    "borderRightColor" : "#333333",
    "borderLeftColor" : "#333333",
    "background" : "#ffffff",
    "boxShadow": null
}

const defaultStyle = {
    "fontSize": 14,
    "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
    "textAlign": "center",
    "letterSpacing": 0,
    "lineHeight": 1,
    "color": "#333333",
    "paddingTop": 0,
    "paddingBottom": 0,
    "paddingLeft": 0,
    "paddingRight": 0,
    "borderTopRightRadius": 3,
    "borderTopLeftRadius": 3,
    "borderBottomRightRadius": 3,
    "borderBottomLeftRadius": 3,
    "borderTopWidth": 1,
    "borderBottomWidth": 1,
    "borderRightWidth": 1,
    "borderLeftWidth": 1,
    "verticalAlign": "middle",
    "borderTopColor" : "#333333",
    "borderBottomColor" : "#333333",
    "borderRightColor" : "#333333",
    "borderLeftColor" : "#333333",
    "background" : "#ffffff",
    "boxShadow": null
}



export const screenStyle = {
    "background" : "#FFFFFF",
}

const textboxStyle = {
    "fontSize": 14,
    "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
    "textAlign": "center",
    "letterSpacing": 0,
    "lineHeight": 1,
    "color": "#333333",
    "paddingTop": 0,
    "paddingBottom": 0,
    "paddingLeft": 4,
    "paddingRight": 4,
    "borderTopRightRadius": 3,
    "borderTopLeftRadius": 3,
    "borderBottomRightRadius": 3,
    "borderBottomLeftRadius": 3,
    "borderTopWidth": 1,
    "borderBottomWidth": 1,
    "borderRightWidth": 1,
    "borderLeftWidth": 1,
    "verticalAlign": "middle",
    "borderTopColor" : "#333333",
    "borderBottomColor" : "#333333",
    "borderRightColor" : "#333333",
    "borderLeftColor" : "#333333",
    "background" : "#FFFFFF",
    "boxShadow": null
}


const tableStyle = {
    "fontSize" : 14,
    "fontFamily" : "Helvetica Neue,Helvetica,Arial,sans-serif",
    "textAlign" : "center",
    "letterSpacing" : 0,
    "lineHeight" : 1,
    "borderTopRightRadius" : 0,
    "borderTopLeftRadius" : 0,
    "borderBottomRightRadius" : 0,
    "borderBottomLeftRadius" : 0,
    "borderTopWidth" : 1,
    "borderBottomWidth" : 1,
    "borderRightWidth" : 1,
    "borderLeftWidth" : 1,
    "borderTopColor" : "#333333",
    "borderBottomColor" : "#333333",
    "borderRightColor" : "#333333",
    "borderLeftColor" : "#333333",
    "background" : "#fff",
    "color" : "#333333",
    "paddingTop" : 10,
    "paddingBottom": 10,
    "paddingLeft" : 5,
    "paddingRight" : 5,
    "headerFontWeight" : "800",
    "headerBackground" : "#333333",
    "headerSticky": true,
    "headerColor" : "#fff",
    "checkBox": false,
    "checkBoxHookColor": "#333333",
    "checkBoxBackground": "#ffffff",
    "checkBoxBorderColor": "#333333",
    "checkBoxBorderRadius": 2,
    "checkBoxBorderWidth": 1
}



export function getDefaultStyle () {

    return {
        Label: labelStyle,
        Container: containerStyle,
        Button: buttonStyle,
        Default: defaultStyle,
        Screen: screenStyle,
        TextBox: textboxStyle,
        Table: tableStyle
    }

}

export function getCustomStyles (app) {
    const result = {
    }

    getMostUsedStyles(Object.values(app.screens))

    return result
}

function getMostUsedStyles (elements, keys = ['background', 'color']) {
    const counts = {}
    elements.forEach(e => {
        const style = e.style
        keys.forEach(key => {
            const value = style[key]
            if (value) {
                if (!counts[key]) {
                    counts[key] = {}
                }
                if (!counts[key][value]) {
                    counts[key][value] = 0
                }
    
                counts[key][value]++
            }
          
        })
    })
    console.debug(counts)
    keys.forEach(key => {
        const keyCounts = counts[key]
        const pairs = Object.keys(keyCounts).map(key => {
            return {key: key, value: keyCounts[key]}
        })
        console.debug(key, pairs)
    })
   
    
}



/**
 * export const borderKeys = [
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomWidth',
    'borderRightWidth',
    'borderLeftWidth',
    'borderTopWidth',

    'borderTopStyle',
    'borderBottomStyle',
    'borderRightStyle',
    'borderLeftStyle',

    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor'
]
 */