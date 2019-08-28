class HelpService  {
    

    getAll () {
        return new Promise( (resolve) => {
            if (!this.texts) {
                Promise.all([
                    import(/* webpackChunkName: "help" */ 'help/en/help.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/getting_started.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/task.js')
                ]).then(all => {
                    this.texts = []
                    all.forEach(t => {
                        this.texts = this.texts.concat(t.texts)
                    })
                    this.texts.forEach(t => {
                        t._all = t.title.toLowerCase()
                        if (t.paragraphs) {
                            t._all += " " + t.paragraphs.map(p => p.body).join(' ')
                        }
                    })
                    resolve(this.texts)
                })
            } else {
                resolve(this.texts)
            }
        })
    }
}



export default new HelpService()