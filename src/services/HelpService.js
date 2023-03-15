class HelpService  {


    getAll () {
        return new Promise( (resolve) => {
            if (!this.texts) {
                Promise.all([
                    import(/* webpackChunkName: "help" */ 'help/en/default.js'),

                    import(/* webpackChunkName: "help" */ 'help/en/animations.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/imports.js'),

                    import(/* webpackChunkName: "help" */ 'help/en/other.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/data_binding.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/logic_flows.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/ab_testing.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/form_validation.js'),
           

                    import(/* webpackChunkName: "help" */ 'help/en/screen_segments.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/rest.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/script.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/other.js'),

                    //import(/* webpackChunkName: "help" */ 'help/en/design_system.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/design_token.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/components.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/master_screens.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/design_import.js'),

                    import(/* webpackChunkName: "help" */ 'help/en/testing.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/survey.js'),

                    import(/* webpackChunkName: "help" */ 'help/en/analytic_intro.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/analytic_tasks.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/analytics_scatter.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/analytic_canvas.js'),

                    import(/* webpackChunkName: "help" */ 'help/en/support.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/bugs.js'),
                    import(/* webpackChunkName: "help" */ 'help/en/contact.js')
                    // import(/* webpackChunkName: "help" */ 'help/en/task.js')
                ]).then(all => {
                    this.texts = all.flatMap(t => t.texts)
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