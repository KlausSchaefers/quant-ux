export function getTextWidth(txt, widget) {
  
    let myCanvas = document.createElement("canvas");
    var context = myCanvas.getContext("2d");
    let fontSize = widget.style.fontSize !== 'Auto' ? widget.style.fontSize : widget.h
    let font = fontSize + 'px '
    if (widget.style.fontFamily) {
        font += ' ' + widget.style.fontFamily
    }
    context.font = font
    
    var metrics = context.measureText(txt);
    return Math.round(metrics.width * 1.01) ;
 
}