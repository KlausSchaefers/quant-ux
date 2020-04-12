export default class Tool {

    constructor (editor) {
        if (!editor) {
            console.error('Tool.constrcutor() > No editor passed')
        }
        this.editor = editor
    }

    onClick() {}

    onMove () {}

    onDoubleClick () {
        // should we some how go back to select?
    }

    onEsc () {
        // should we somehow end editor?
    }

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