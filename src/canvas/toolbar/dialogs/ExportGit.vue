
<template>
  <div class="MatcExportGit" @dblclick="forgetProfile">


        <div class="form-group">
            <label>{{ $t('dialog.export.github-token')}}</label>
            <a  target="github" href="https://github.com/settings/tokens">
              <span class="mdi mdi-help-circle"></span>
            </a>
            <input type="password" class="form-control" v-model="github.token"  @change="saveChanges"/>
        </div>


         <div class="form-group">
            <label>{{ $t('dialog.export.github-user')}}</label>
            <input type="text" class="form-control" v-model="github.user" @change="saveChanges"/>
        </div>


         <div class="form-group">
            <label>{{ $t('dialog.export.github-repo')}}</label>
            <input type="text" class="form-control" v-model="github.repo" @change="saveChanges"/>
        </div>

        <div class="form-group">
            <label>{{ $t('dialog.export.github-branch')}}</label>
            <input type="text" class="form-control" v-model="github.branch" @change="saveChanges"/>
        </div>

         <div class="form-group">
            <label>{{ $t('dialog.export.github-folder')}}</label>
            <input type="text" class="form-control" v-model="github.folder" @change="saveChanges" />
        </div>

	</div>
</template>
<style lang="scss">
    @import '../../../style/import_dialog.scss';
</style>

<script>


import Logger from 'common/Logger'


export default {
    name: 'ExportGit',
    mixins:[],
    props:['model', 'jwtToken'],
    data: function () {
        return {
            github: {
              token: '',
              repo: '',
              user: '',
              folder: '',
              branch: ''
            }
        }
    },
    components: {},
    methods: {

			setModel (m){
				this.model = m;
			},

			setJwtToken(t) {
				this.jwtToken = t
			},

      saveChanges () {
        if (localStorage) {
          localStorage.setItem('githubToken', this.github.token)
          localStorage.setItem('githubUser', this.github.user)
          localStorage.setItem('githubRepo', this.github.repo)
          localStorage.setItem('githubBranch', this.github.branch)
          localStorage.setItem('githubFolder', this.github.folder)
        }
      },

      forgetProfile () {
        if (localStorage) {
          localStorage.removeItem('githubToken')
          localStorage.removeItem('githubUser')
          localStorage.removeItem('githubRepo')
          localStorage.removeItem('githubBranch')
          localStorage.removeItem('githubFolder')
        }
      },

      async writeToGit () {
        // https://www.audero.it/blog/2015/10/17/upload-files-on-github-using-github-js/
        this.logger.log(-1, 'writeToGit', 'enter')

        try {

          let GitHub = await import(/* webpackChunkName: "github-api" */ 'github-api')
          let github = new GitHub.default({
            token: this.github.token
          })

          /**
           * TODO rename images?
           */
          let images = this.getImages(this.model)


          let repository = github.getRepo(this.github.user, this.github.repo);
          let fileName = this.getFileName(`${this.model.name}.qux`)
          console.debug(fileName)
          await repository.writeFile(this.github.branch, fileName, JSON.stringify(this.model, null, 2), 'Quant-UX Export')


          let promises = images.map(image => this.uploadImage(repository, image))
          await Promise.all(promises)

        } catch (err) {
            this.logger.error('writeToGit', 'Could not write to git ', err)
            this.logger.sendError(err)
        }

        this.logger.log(-1, 'writeToGit', 'exit')
      },

      uploadImage (repository, image) {
        return new Promise((resolve, reject) => {
            let url = `/rest/images/${image.url}?token=${this.jwtToken}`
            this.logger.log(-1, 'uploadImage', 'enter', url)
            fetch(url).then(response => response.blob().then(blob => {
              console.debug(blob)
              if (blob && blob.size > 0) {
                let reader = new FileReader();
                reader.onloadend = () => {
                  //var content = reader.result;
                  var base64result = reader.result.substr(reader.result.indexOf(',') + 1);

                    // Strip out the information about the mime type of the file and the encoding
                    // at the beginning of the file (e.g. data:image/gif;base64,).
                   //content = content.replace(/^(.+,)/, '');
                    let fileName = this.getFileName(image.url)
                    repository.writeFile(this.github.branch, fileName, base64result, 'Quant-UX Export').then(result => {
                      resolve(result)
                    })
                }
                reader.readAsDataURL(blob);
              } else {
                reject()
              }
            }))
        })
      },

      getFileName (fileName) {
        return this.github.folder ? `${this.github.folder}/${fileName}` : fileName
      },

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
      },

      saveFile(repository, file) {
        this.logger.log(-1, 'saveFile', 'enter: ' + file.filename)
        return new Promise((resolve, reject) => {
          repository.write(
              this.github.branch,
              file.filename,
              file.content,
              file.commitTitle,
              (err) => {
                if (err) {
                    this.logger.error('saveFile', 'Could not write: ' + file.filename)
                    reject(err);
                } else {
                    resolve(repository)
                }
              }
          )
        })
      }

    },

    mounted () {
			this.logger = new Logger("ExportGit");
      if (localStorage) {
        this.github.token = localStorage.getItem('githubToken') ? localStorage.getItem('githubToken') : ''
        this.github.user = localStorage.getItem('githubUser') ? localStorage.getItem('githubUser') : ''
        this.github.repo = localStorage.getItem('githubRepo') ? localStorage.getItem('githubRepo') : ''
        this.github.branch = localStorage.getItem('githubBranch') ? localStorage.getItem('githubBranch') : ''
        this.github.folder = localStorage.getItem('githubFolder') ? localStorage.getItem('githubFolder') : ''
      }
    }
}
</script>