export default class Tool {

    constructor (editor) {
        if (!editor) {
            console.error('Tool.constrcutor() > No editor passed')
        }
        this.editor = editor
    }

    onClick() {}

    onMove () {}

    onMouseDown () {}

    onMouseUp () {}

    onDoubleClick () {
        // should we some how go back to select?
    }

    onEsc () {
        // should we somehow end editor?
    }

    onEnter () {}

    onDelete () {}

    onElementHover () {}

    onElementBlur () {}

    onElementClick () {}

    onJointMouseDown() {}

    onJointMouseUp() {}

    onJointClick () {}

    onBBoxMouseDown () {}

    onBBoxMouseUp () {}

    onBBoxMouseClick () {}

    onResizeMouseDown () {}

    onResizeMouseUp () {}

    onResizeMouseClick () {}

    onBezierMouseDown () {}

    onBezierMouseUp () {}

    onBezierClick () {}
}