export function getTextWidth(txt, widget) {
  
    const myCanvas = document.createElement("canvas");
    const context = myCanvas.getContext("2d");
    const fontSize = widget.style.fontSize !== 'Auto' ? widget.style.fontSize : widget.h
    let font = fontSize + 'px '
    if (widget.style.fontFamily) {
        font += ' ' + widget.style.fontFamily
    }
    context.font = font
    
    const metrics = context.measureText(txt);
    return Math.round(metrics.width * 1.01) ;
}