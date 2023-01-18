import Logger from 'common/Logger'
import Services from 'services/Services'
class ZipService {

  constructor () {
    this.logger = new Logger('ZipService')
  }

  async writeZipToBlob (model, jwtToken) {
    this.logger.log(-1, 'writeZipToBlob', 'enter')
    return new Promise ( async (resolve, reject) => {
      try {

        model = JSON.parse(JSON.stringify(model))

        let JSZip = await import(/* webpackChunkName: "jszip" */ 'jszip')

        let baseZip = new JSZip.default();

        /*
        * create images and rename them
        */
        let images = this.getImages(model)
        for (let i=0; i < images.length; i++) {
          let image = images[i]
          let url = `/rest/images/${image.url}?token=${jwtToken}`
          try {
   
            let imgData = await this.getBlob(url)
            let filename = 'image' + i + '.' + this.getFileType(image.url)
            baseZip.file(filename, imgData)
            this.logger.log(-1, 'writeZipToBlob', 'image', filename)
            /**
             * Do not forget to update the url
             */
            image.url = filename
          } catch (err) {
            this.logger.error('writeZipToBlob', 'Could not load image > ' + url)
          }
       
        }

        /**
         * add updated model
         */
        baseZip.file("design.json", JSON.stringify(model, null, 2));

        /**
         * Generate zip file as blob and return
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

  uploadImages (file, modelId, progressListener) {
    this.logger.log(-1, 'uploadImages', 'enter', modelId)
    return new Promise ( async (resolve, reject) => {
      try {

        let JSZip = await import(/* webpackChunkName: "jszip" */ 'jszip')
        let url = '/rest/images/' + modelId;

        let zip = new JSZip.default();
        await zip.loadAsync(file)

        let design = await zip.file("design.json").async("string");
        if (design) {
          let model = JSON.parse(design)

          let images = this.getImages(model)
          let total = images.length
          let done = 0
          for (let i=0; i < total; i++) {
            let image = images[i]
            let imageBuffer = await zip.file(image.url).async("Blob");
            let upload = await this.uploadImage(image, imageBuffer, url)
            image.url = upload.url
            done++
            if (progressListener) {
              progressListener(done, total)
            }
          }

          resolve(model)

      } else {
        reject(new Error('Could not load design.json'))
      }

      } catch (err) {
          reject(err)
      }
    })
  }

  uploadImage (image, imageBuffer, url) {
    return new Promise((resolve, reject) => {
      let imageService = Services.getImageService()
      let fileType = this.getFileType(image.url)
      let blob = new Blob([imageBuffer], {type: "image/" +fileType})
      var formData = new FormData()
      let name = image.url
      this.logger.log(-1, 'uploadImage', 'enter', image.url + 'as ' + fileType)
      formData.append(name, blob, name)
      imageService.upload(url, formData).then(uploadResponse => {
          uploadResponse = JSON.parse(uploadResponse)
          let upload = uploadResponse.uploads[0]
          if (upload) {
            resolve(upload)
          } else {
            this.logger.error('uploadImage', 'Could not upload image')
            reject(new Error('No image returned'))
          }
      }, err => {
          this.logger.error('uploadImage', 'Could not upload image')
          reject(err)
      })
    })
  }



}

export default new ZipService()