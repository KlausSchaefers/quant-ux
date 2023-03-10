import Logger from '../core/Logger'
export default class CanvasSelection {

    constructor () {
      this.reset()
    }

    reset () {
        Logger.log(1, 'CanvasSelection.reset()' )
        this.lastScreens = this.screens
        this.screens = []
        this.groups = []
        this.lines = []
        this.widgets = []
        this.count = 0
    }

    print() {
        const lines = []
        lines.push('------- Canvas Selection -------')
        this.screens.forEach(s => lines.push(' - ' + s.name + '(' + s.id +')'))
        console.debug(lines.join('\n'))
    }

    setSelectedScreens (model, screenIDs, expand = false) {
        Logger.log(1, 'CanvasSelection.setSelectedScreens() > ' + expand )
        if (expand) {
            this.screens = this.lastScreens	
        }
        screenIDs.forEach(id => {	
            if (expand && this.screens.findIndex(scrn => scrn.id === id) >=0 ) {
                this.screens = this.screens.filter(scrn => scrn.id !== id)
            } else {
                const scrn = model.screens[id];
                if (scrn) {
                    this.screens.push(scrn)
                }
            }
        })
    }
}