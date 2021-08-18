import Logger from 'common/Logger'

class ZipService {

  constructor () {
    this.logger = new Logger('ZipService')
  }

  async writeZipToBlob (model, jwtToken) {
    this.logger.log(-1, 'writeZipToBlob', 'enter')
    return new Promise ( async (resolve, reject) => {
      try {

        let JSZip = await import(/* webpackChunkName: "jszip" */ 'jszip')

        let baseZip = new JSZip.default();


        /*
        * create images and rename them
        */
        let images = this.getImages(model)
        for (let i=0; i < images.length; i++) {
          let image = images[i]
          let url = `/rest/images/${image.url}?token=${jwtToken}`
          let imgData = await this.getBlob(url)
          let filename = 'image' + i + '.' + this.getFileType(image.url)
          baseZip.file(filename, imgData)
          this.logger.log(-1, 'writeZipToBlob', 'image', filename)
          image.url = filename
        }

        baseZip.file("design.json", JSON.stringify(model, null, 2));

        /**
         * Generate zip file and save
         */
        baseZip.generateAsync({type:"blob"}).then( content=> {
            resolve(content)
        });

        this.logger.log(-1, 'writeZipToBlob', 'exit')

      } catch (err) {
          reject(err)
      }
    })


  }

  getFileType (url) {
    let parts = url.split('.')
    return parts.pop()
  }

  getBlob(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'get',
            credentials: "same-origin"
        }).then((res) => {
            if (res.status === 200) {
                res.blob().then(j => {
                    resolve(j)
                })
            } else {
                res.text().then(txt => {
                    reject(new Error(txt))
                })
            }
        }).catch((err) => {
            reject(err)
        })
    })
  }

  getImages (model) {
    let result = []
    for (let id in model.screens) {
      let screen = model.screens[id]
      if (screen.style && screen.style.backgroundImage) {
        result.push(screen.style.backgroundImage)
      }
    }
    for (let id in model.widgets) {
      let widget = model.widgets[id]
      if (widget.style && widget.style.backgroundImage) {
        result.push(widget.style.backgroundImage)
      }
    }
    return result
  }

}

export default new ZipService()