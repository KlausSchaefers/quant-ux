export function mergeModel (model, importModel, pos) {
  let changes = []
  /**
   * First correct positions
   */
  let offset = getOffSet(importModel)
  importModel = correctOffSet(importModel, pos, offset)

  /**
   * Copy templates and update references in importModel
   */
  changes = changes.concat(mergeTemplates(model, importModel))

  /**
   * Copy groups and update
   */
  changes = changes.concat(mergeGroups(model, importModel))

  return changes
}

function mergeGroups (model, importModel) {
  let changes = []

  if (importModel.groups) {
    if (!model.groups) {
      model.groups = {}
    }

    /**
     * Update ids in merged model
     */
    let oldToNewIds = {}
    Object.values(importModel.groups).forEach(group => {
      let oldId = group.id
      let newId = updateUUID('g', group, model)
      oldToNewIds[oldId] = newId
    })

    /**
     * Update references
     */
     for (let oldId in oldToNewIds) {
      let newId = oldToNewIds[oldId]
      Object.values(importModel.groups).forEach(group => {
        if (group.groups) {
          group.groups = group.groups.map(id => id === oldId ? newId : id)
        }
      })

    }


    /**
     * Copy models
     */
    Object.values(importModel.groups).forEach(group => {
      model.groups[group.id] = group
      changes.push({type:"group", action:'import', id: group.id})
    })
  }
  return changes
}


function mergeTemplates (model, importModel) {
  let changes = []

  if (importModel.templates) {
    if (!model.templates) {
      model.templates = {}
    }



    /**
     * Set new ids and update refs
     */
    let oldToNewIds = {}
    Object.values(importModel.templates).forEach(template => {
      let oldId = template.id
      let newId = updateUUID('tw', template, model)
      oldToNewIds[oldId] = newId
    })

    /**
     * Update references
     */
    let widgetsByTemplate = {}
    Object.values(importModel.widgets).forEach(widget => {
      if (widget.template) {
        if (!widgetsByTemplate[widget.template]) {
          widgetsByTemplate[widget.template] = []
        }
        widgetsByTemplate[widget.template].push(widget)
      }
    })
    for (let oldId in oldToNewIds) {
      let newId = oldToNewIds[oldId]
      if (widgetsByTemplate[oldId]) {
        let widgets = widgetsByTemplate[oldId]
        widgets.forEach(widget => {
          widget.template = newId
        })
      }
    }

    /**
     * Copy templates
     */
    Object.values(importModel.templates).forEach(template => {
      changes.push({type:"template", action:'import', id: template.id})
      model.templates[template.id] = template
    })
  }
  return changes
}

function updateUUID (prefix, element, model) {
  var uuid = model.lastUUID++ + "";
  element.importSourceId = element.id
  element.id = prefix + uuid
  return element.id
}

export function correctOffSet (model, pos, offset) {
  /**
   * Set to correct position
   */
  let offsetX = pos.x - offset.x
  let offsetY = pos.y - offset.y
  Object.values(model.screens).forEach(screen => {
      screen.x += offsetX
      screen.y += offsetY
      return screen
  })
  Object.values(model.widgets).forEach(widget => {
      widget.x += offsetX
      widget.y += offsetY
      return widget
  })
  /**
   * FIXME: What about line points
   */

  return model
}

export function getOffSet(model) {
  let minX = 1000000
  let minY = 1000000
  Object.values(model.screens).forEach(screen => {
      minX = Math.min(minX, screen.x)
      minY = Math.min(minY, screen.y)
  })

  Object.values(model.widgets).forEach(widgets => {
    minX = Math.min(minX, widgets.x)
    minY = Math.min(minY, widgets.y)
  })

  return {
    x: minX,
    y: minY
  }
}