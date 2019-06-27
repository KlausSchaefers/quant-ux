import AbstractService from 'services/AbstractService'
import Logger from 'common/Logger'
import Vue from "vue";
// import HelloWorld from 'examples/HelloWorld'

/**
 * Add here imports
 */

class SymbolService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('SymbolService')
        this.widgets = {
          // 'HelloWorld': HelloWorld
        }

    }

    getWidgetClass (name) {
      return this.widgets[name]
    }

    getWidgetDataProps (name) {
      if (this.widgetDataProps){
        return this.widgetDataProps[name]
      }
    }

    getIcons () {
      return this._getChached('/public/icons.json')
    }

    hookInWidgets (themes) {
      this.logger.log(2, 'hookInWidgets', 'enter > ' +  this.widgets.length  + " + " + themes.length)
      this.widgetDataProps = {}
      for (let name in this.widgets){
        try {
          let w = this.widgets[name]
          let temp = this.$new(w)
          let templates = temp.getCreateTemplates()
          if (templates) {
            templates.forEach(t => {
              themes.push(t)
            })
          } else {
            this.logger.error('hookInWidgets', `Error >  ${name}.getCreateTemplates() returns null`)
          }
          let props = temp.getDataProperties()
          if (props) {
            this.widgetDataProps[name] = props
          }
        } catch (e) {
          this.logger.error('hookInWidgets', 'Error >  Could not create' +  name, e)
        }
      }
    }


    getCore() {
      return new Promise( (resolve) => {
        if (!this.themes) {
          this.logger.log(3, 'getCore', 'exit > Load')
          Promise.all([
            import(/* webpackChunkName: "themes" */ 'themes/screen.json'),

            import(/* webpackChunkName: "themes" */ 'themes/wireframe/box.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/button.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/carousel.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/checkbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/checkboxgroup.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/date.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/date2.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/dnd.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/dropbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/hotspot.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/icon.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/image.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/label.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/link.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/menu.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/mobile_drop_down.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/radiobox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/radiogroup.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/ratings.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/slider.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/spinner.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/stepper.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/switch.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/tab.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/table.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/textbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/timespinner.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/typeahead.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/volume.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/repeater.json'),
            // import(/* webpackChunkName: "themes" */ 'themes/wireframe/upload.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/camera.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/uploadpreview.json'),

            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/button2.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/calender.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/checkbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/combobox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/datepicker.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/daterange.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/daterangepicker.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/dialog2.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/label.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/link.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/list.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/listitem.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/menu.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/navigation.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/panel.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/radio.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/segement.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/slider.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/switch.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/tabbar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/table.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/textbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/toast.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/toggle.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/tool_footer.json'),
            import(/* webpackChunkName: "themes" */ 'themes/OpenUI/tool_header.json'),


            import(/* webpackChunkName: "themes" */ 'themes/material/buttons_rec.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/buttons.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/calendar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/checkbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/dialog.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/dropdown.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/labels.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/menu.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/radiobox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/slider.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/switch.json'),
            import(/* webpackChunkName: "themes" */ 'themes/material/textbox.json'),

            import(/* webpackChunkName: "themes" */ 'themes/ios/buttons.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/chekcbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/chips.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/navbar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/radio.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/segmentbutton.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/stepper.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/switch.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/textbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/ios/togglebutton.json'),

            import(/* webpackChunkName: "themes" */ 'themes/charts/bar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/charts/legend.json'),
            import(/* webpackChunkName: "themes" */ 'themes/charts/pie.json'),
            import(/* webpackChunkName: "themes" */ 'themes/charts/ring.json'),

            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/boxes.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/button.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/checkbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/date.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/dialog.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/dropdown.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/image.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/input.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/input2.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/labels.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/tab.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap/table.json'),

            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/alerts.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/boxes.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/button.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/card.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/checkbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/date.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/dialog.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/dropdown.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/image.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/input.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/input2.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/labels.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/tab.json'),
            import(/* webpackChunkName: "themes" */ 'themes/bootstrap4/table.json')
          ]).then(values => {
            this.themes = []
            values.forEach(v => {
              this.themes = this.themes.concat(v.default)
            })
            this.hookInWidgets(this.themes)
            this.logger.log(3, 'getCore', 'exit > loaded', this.themes.length)
            resolve(this.themes)
          })
        } else {
          this.logger.log(3, 'getCore', 'exit > Cache')
          resolve(this.themes)
        }
      })
    }

	$new (cls) {
		var ComponentClass = Vue.extend(cls);
		var instance = new ComponentClass();
		instance.mode = this.mode
		instance.$mount(); // pass nothing
		return instance;
	}

}
export default new SymbolService()