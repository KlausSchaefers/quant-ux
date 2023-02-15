import Logger from 'core/Logger'

class Preloader {

    constructor () {
        this.images = new Set()
    }

    reset () {
        this.images = new Set() 
    }

    load(model, hash, parentNode) {
        Logger.log(-1, 'Preloader.load() > enter')
        //       
        this.loadImages(model, hash)
        this.loadIcons(model, parentNode)
    }

    loadImages (model, hash) {
        const screens = Object.values(model.screens)

        screens.sort((a,b) => {
            if (a.props.start) {
                return -1
            }
            if (b.props.start) {
                return 1
            }
            return 0
        })
        
        screens.forEach(s => {
            if (s.props.start) {
                this.loadScreen(model, s, hash, 'high')
            } else {
                setTimeout( () => {
                    this.loadScreen(model, s, hash, 'low')
                }, 1000)
            }
        })
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
                img.fetchpriority = prio
                img.src = url;
                this.images.add(url)
                img.onload = () => {
                    Logger.log(4, 'Preloader.loadImage() >  done >', url, prio)
                }
            }
        }
    }

}

export default new Preloader()