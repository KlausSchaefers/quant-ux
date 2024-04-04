import Logger from 'core/Logger'

class Preloader {

    constructor () {
        this.images = new Set()
        this.visited = {}
        this.lines = {}
    }

    reset () {
        this.images = new Set() 
        this.visited = {}
        this.lines = {}
        delete this.hiddenDomNode
    }

    load(model, hash, parentNode) {
        Logger.warn('Preloader.load() > enter', parentNode)  
        this.loadImages(model, hash, parentNode)
        this.loadIcons(model, parentNode)
    }

    loadImages (model, hash) {  
        // keep the domNodes around
        this.hiddenDomNode = document.createElement("div")
   
        // cache all lines
        Object.values(model.lines).forEach(l => {
            this.lines[l.from] = l.to
        })

        // get start screen
        const screens = Object.values(model.screens)
        let start = screens.find(s => s.props.start === true)
        if (!start) {
            start = screens[0]
        }

        // load by navigation flow
        this.visitScreen(model, hash, start, 'high')

        // Some screen might not be linked (logic, ab etc)
        // so we load the rest as well
        this.ensureRestIsLoaded(model, hash, screens)       
    }

    ensureRestIsLoaded (model, hash, screens) {
        screens.forEach(s => {      
            if (!this.visited[s.id]) {
                setTimeout( () => {
                    this.loadScreen(model, s, hash, 'low')
                }, 1000) 
            }           
        })
    }

    visitScreen (model, hash, scrn, prio = 'low') {
        if (!this.visited[scrn.id]) {
            this.visited[scrn.id] = true
            this.loadImage(scrn, hash, prio)
            this.followLines(model, hash, scrn)            
            if (scrn.children) {
                scrn.children.forEach(id => {
                    const w = model.widgets[id]
                    if (w) {
                        this.loadImage(w, hash, prio)
                        this.followLines(model, hash, w)
                    }
                })
            }
        }
    }

    followLines (model, hash, box) {
        if (this.lines[box.id]) {
            const scrn = model.screens[this.lines[box.id]]
            if (scrn) {
                this.visitScreen(model, hash, scrn)
            }
        }
    }

    loadScreen (model, s, hash, prio) {
        this.loadImage(s, hash, prio)
        if (s.children) {
            s.children.forEach(id => {
                const w = model.widgets[id]
                if (w) {
                    this.loadImage(w, hash, prio)
                }
            })
        }
    }

    loadIcons (model, parentNode) {

        try {
            // since 4.0.81 we preload the icon webfont as well
            const icons = Object
                .values(model.widgets)
                .filter(w => w.type === 'Icon')
            
            if (icons.length > 0) {
                Logger.log(-1, "loadIcons","enter > ", icons.length);
                const div = document.createElement("div");
                div.className = "MatcSimulatorImagePreloader"
                parentNode.appendChild(div);
    
                const span = document.createElement("span");
                span.className = 'mdi mdi-android'
                div.appendChild(span);
            }

         
        } catch (e) {
            Logger.error("loadIcons","exit > error", e);
            console.trace()
        }
    }
    
    loadImage(box, hash, prio = 'high') {
        if(box.style && box.style.backgroundImage){
            const url = "/rest/images/" + hash + "/"  + box.style.backgroundImage.url
            if (!this.images.has(url)) {
                const img = document.createElement("img");
                //img.fetchpriority = prio
                img.src = url;
                this.images.add(url)
                img.onload = () => {
                    Logger.log(4, 'Preloader.loadImage() >  done >', url, prio)
                }
                this.hiddenDomNode.appendChild(img)
            }
        }
    }

}

export default new Preloader()