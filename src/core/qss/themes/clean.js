
// general
// https://www.figma.com/file/MY3ypEmEM0k2uI26iXzvq6/Airtable-Apps-UI-Kit-(Community)?type=design&node-id=0-1&mode=design&t=Gr3MFRH6h8FEImh1-0
// https://tailwindui.com/components/application-ui/forms/radio-groups
// https://tailwindui.com/components/application-ui/forms/comboboxes
export default {
    // general
    "@font-size-s": {"value": 12, "type": "fontSize"},
    "@font-size-m": {"value": 14, "type": "fontSize"},
    "@font-size-l": {"value": 18, "type": "fontSize"},
    "@font-size-xl": {"value": 24, "type": "fontSize"},
    "@font-size-xxl": {"value": 32, "type": "fontSize"},
 
    "@font-family": {"value": "Roboto, sans-serif", "type": "fontFamily"},
    "@font-weight": {"value": "", "type": "fontWeight"},
    "@letterSpacing": {"value": 0, "type": "letterSpacing"},
    "@lineHeight": {"value": 1, "type": "lineHeight"},
 
    "@border-width-none": {"value": 0, "type": "borderWidth"},
    "@border-width": {"value": 1, "type": "borderWidth"},
    "@border-width:hover": {"value": 1, "type": "borderWidth"},
    "@border-width:focus": {"value": 1, "type": "borderWidth"},
 
    "@border-radius": {"value": 4, "type": "borderRadius"},
    "@border-radius-round": {"value": 256, "type": "borderRadius"},
    "@border-radius-none": {"value": 0, "type": "borderRadius"},
 
    "@spacing-xs": {"value": 4, "type": "spacing"},
    "@spacing-s": {"value": 8, "type": "spacing"},
    "@spacing-m": {"value": 16, "type": "spacing"},
    "@spacing-l": {"value": 32, "type": "spacing"},
 
    // screens
    "@screen-background": {"value": "#FFFFFF", "type": "color"},
 
    // checkboxes and co
    "@background-passive": {"value": "#F4F4F5", "type": "color"},
    "@background-passive:hover": {"value": "#F4F4F5", "type": "color"},
    "@color-passive": {"value": "#3787f2", "type": "color"},
    "@color-passive:hover": {"value": "#3787f2", "type": "color"},
 
    "@background-active": {"value": "#3787f2", "type": "color"},
    "@background-active:hover": {"value": "#1251a3", "type": "color"},
    "@color-active": {"value": "#FFFFFF", "type": "color"}, 
    "@color-active:hover": {"value": "#FFFFFF", "type": "color"},
 
    "@background-danger": {"value": "#efc5c5", "type": "color"},
    "@background-info:danger": {"value": "#efc5c5", "type": "color"},
    "@color-danger": {"value": "#f43535", "type": "color"}, 
    "@color-danger:hover": {"value": "#f43535", "type": "color"},
 
    "@background-info": {"value": "#e8ee9c", "type": "color"},
    "@background-info:hover": {"value": "#e8ee9c", "type": "color"},
    "@color-info": {"value": "#927e10", "type": "color"}, 
    "@color-info:hover": {"value": "#927e10", "type": "color"},
 
    "@background-hint": {"value": "#bae7fd", "type": "color"},
    "@background-hint:hover": {"value": "#bae7fd", "type": "color"},
    "@color-hint": {"value": "#2784b1", "type": "color"}, 
    "@color-hint:hover": {"value": "#2784b1", "type": "color"},
 
    "@background-icon": {"value": "transparent", "type": "color"},
    "@background-icon:hover": {"value": "transparent", "type": "color"},
    "@color-icon": {"value": "#0A0A0B", "type": "color"},
    "@color-icon:hover": {"value": "#000000", "type": "color"},

    // box shadows
    "@box-shadow-s": {"value": null, "type": "boxShadow"},
    "@box-shadow-m": {"value": null, "type": "boxShadow"},
    "@box-shadow-l": {"value": null, "type": "boxShadow"},
 
    // labels
    "@label-color": {"value": "#0A0A0B", "type": "red"},
    "@label-color:hover": {"value": "blue", "type": "color"},
    "@label-color:error": {"value": "#0A0A0B", "type": "color"},
    "@label-color-secondary": {"value": "#686871", "type": "red"},
 
    "@label-font-weight-default": {"value": "", "type": "fontWeight"},
    "@label-font-weight-bold": {"value": "bold", "type": "fontWeight"},
 
    // forms
    "@form-padding-horizontal": {"value": 8, "type": "paddingHorizontal"},
    "@form-padding-vertical": {"value": 2, "type": "paddingVertical"},

    "@form-height": {"value": 32, "type": "height"},
    "@form-width": {"value": 196, "type": "width"},
 
    "@form-border-color": {"value": "#6b7280", "type": "color"},
    "@form-color": {"value": "#0A0A0B", "type": "color"},
    "@form-background": {"value": "#FFFFFF", "type": "color"},
 
    "@form-border-color:hover": {"value": "#6b7280", "type": "color"},
    "@form-color:hover": {"value": "#0A0A0B", "type": "color"},
    "@form-background:hover": {"value": "#F4F4F5", "type": "color"},
 
    "@form-border-color:focus": {"value": "#3787f2", "type": "color"},
    "@form-color:focus": {"value": "#3787f2", "type": "color"},
    "@form-background:focus": {"value": "#F4F4F5", "type": "color"},
 
    "@form-border-color:error": {"value": "#f43535", "type": "color"},
    "@form-color:error": {"value": "#f43535", "type": "color"},
    "@form-background:error": {"value": "#efc5c5", "type": "color"},
 
    "@form-popup-border-color": {"value": "#6b7280", "type": "color"},
    "@form-popup-color": {"value": "#0A0A0B", "type": "color"},
    "@form-popup-background": {"value": "#FFFFFF", "type": "color"},
    "@form-popup-backgrop": {"value": "rgba(0,0,0,0.8)", "type": "color"},
    "@form-popup-border-width": {"value": 1, "type": "borderWidth"},
    "@form-popup-color:hover": {"value": "#FFFFFF", "type": "color"},
    "@form-popup-background:hover": {"value": "#3787f2", "type": "color"},
 
    // buttons
 
    "@button-primary-border-color": {"value": "#3787f2", "type": "color"},
    "@button-primary-background": {"value": "#3787f2", "type": "color"},
    "@button-primary-color": {"value": "#FFFFFF", "type": "color"},
    "@button-primary-border-color:hover": {"value": "#1251a3", "type": "color"},
    "@button-primary-background:hover": {"value": "#1251a3", "type": "color"},
    "@button-primary-color:hover": {"value": "#FFFFFF", "type": "color"},
 
    "@button-secundary-border-color": {"value": "#3787f2", "type": "color"},
    "@button-secundary-background": {"value": "#FFFFFF", "type": "color"},
    "@button-secundary-color": {"value": "#3787f2", "type": "color"},
    "@button-secundary-border-color:hover": {"value": "#1251a3", "type": "color"},
    "@button-secundary-background:hover": {"value": "#1251a3", "type": "color"},
    "@button-secundary-color:hover": {"value": "#FFFFFF", "type": "color"},
 
    "@button-danger-border-color": {"value": "#f43535", "type": "color"},
    "@button-danger-background": {"value": "#f43535", "type": "color"},
    "@button-danger-color": {"value": "#FFFFFF", "type": "color"},
    "@button-danger-border-color:hover": {"value": "#f60404", "type": "color"},
    "@button-danger-background:hover": {"value": "#f60404", "type": "color"},
    "@button-danger-color:hover": {"value": "#FFFFFF", "type": "color"},
 
    "@button-passive-border-color": {"value": "#F4F4F5", "type": "color"},
    "@button-passive-background": {"value": "#F4F4F5", "type": "color"},
    "@button-passive-color": {"value": "#0A0A0B", "type": "color"},
    "@button-passive-border-color:hover": {"value": "#F4F4F5", "type": "color"},
    "@button-passive-background:hover": {"value": "#F4F4F5", "type": "color"},
    "@button-passive-color:hover": {"value": "#FFFFFF", "type": "color"},
 
    // panels
    "@panel-box-shadow": {"value": null, "type": "boxShadow"},
 
    "@calendar-item-radius" : {"value": 4, "type": "borderRadius"},
    
    // box sizes
    "@box-width-xxs": {"value": 16, "type": "height"},
    "@box-width-xs": {"value": 32, "type": "height"},
    "@box-width-s": {"value": 40, "type": "height"},
    "@box-width-m": {"value": 64, "type": "height"},
    "@box-width-ms": {"value": 56, "type": "height"},
    "@box-width-l": {"value": 96, "type": "height"},
    "@box-width-xl": {"value": 128, "type": "height"},
    "@box-width-xxl": {"value": 256, "type": "height"},
 
    "@box-height-xxs": {"value": 16, "type": "height"},
    "@box-height-xs": {"value": 32, "type": "height"},
    "@box-height-s": {"value": 40, "type": "height"},
    "@box-height-ms": {"value": 56, "type": "height"},
    "@box-height-m": {"value": 64, "type": "height"},
    "@box-height-l": {"value": 128, "type": "height"},
    "@box-height-xl": {"value": 256, "type": "height"},
    "@box-height-xxl": {"value": 320, "type": "height"}
 }