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

  /**
   * Copy screens and update
   */
  changes = changes.concat(mergeScreens(model, importModel))

  /**
   * Copy widgets and update references in screens, lines and groups
   */
  changes = changes.concat(mergeWidgets(model, importModel))

  /**
   * Copy copy lines
   */
  changes = changes.concat(mergeLines(model, importModel))


  return changes
}


function mergeWidgets (model, importModel) {
  let changes = []

  /**
   * Update ids in merged model
   */
  let oldToNewIds = {}
  Object.values(importModel.widgets).forEach(widget => {
    let oldId = widget.id
    let newId = updateUUID('w', widget, model)
    oldToNewIds[oldId] = newId
  })

  /**
   * Copy models
   */
  Object.values(importModel.widgets).forEach(widget => {
    model.widgets[widget.id] = widget
    changes.push({type:"widget", action:'import', id: widget.id})
  })

  Object.values(importModel.lines).forEach(line => {
    if (oldToNewIds[line.to]) {
      line.to = oldToNewIds[line.to]
    }
    if (oldToNewIds[line.from]) {
      line.from = oldToNewIds[line.from]
    }
  })

  /**
   * Update refs in new model
   */
  Object.values(model.screens).forEach(screen => {
    screen.children = replaceValues(screen.children, oldToNewIds)
  })


  if (model.groups) {
    Object.values(model.groups).forEach(group => {
      group.children = replaceValues(group.children, oldToNewIds)
    })
  }

  return changes
}

function mergeLines (model, importModel) {
  let changes = []

  /**
   * Update ids in merged model
   */
  let oldToNewIds = {}
  Object.values(importModel.lines).forEach(line => {
    let oldId = line.from
    let newId = updateUUID('l', line, model)
    oldToNewIds[oldId] = newId
  })

  /**
   * Copy models
   */
  Object.values(importModel.lines).forEach(line => {
    model.lines[line.id] = line
    changes.push({type:"line", action:'import', id: line.id})
  })

  return changes
}


function mergeScreens (model, importModel) {
  let changes = []

  /**
   * Update ids in merged model
   */
  let oldToNewIds = {}
  Object.values(importModel.screens).forEach(screen => {
    let oldId = screen.id
    let newId = updateUUID('s', screen, model)
    oldToNewIds[oldId] = newId
  })

  /**
   * Copy models
   */
  Object.values(importModel.screens).forEach(screen => {
    model.screens[screen.id] = screen
    changes.push({type:"screen", action:'import', id: screen.id})
  })

  /**
   * Update master screen refs
   */
  Object.values(model.screens).forEach(screen => {
    if (screen.parents) {
      screen.parents = replaceValues(screen.parents, oldToNewIds)
    }
  })

  /**
   * Update refs in lines in importModel
   */
  Object.values(importModel.lines).forEach(line => {
    if (oldToNewIds[line.to]) {
      line.to = oldToNewIds[line.to]
    }
    if (oldToNewIds[line.from]) {
      line.from = oldToNewIds[line.from]
    }
  })


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
     * Update references to child groups
     */
     for (let oldId in oldToNewIds) {
      let newId = oldToNewIds[oldId]
      Object.values(importModel.groups).forEach(group => {
        if (group.groups) {
          group.groups = replaceValue(group.groups, oldId, newId)
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

export function replaceValue (list, oldValue, newValue) {
  return list.map(value => value === oldValue ? newValue : value)
}

export function replaceValues (list, mapping) {
  return list.map(value => mapping[value] !== undefined ? mapping[value] : value)
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

      if (template.groups) {
        template.groups.forEach(subgroup => {
          let oldId = subgroup.id
          let newId = updateUUID('tsg', subgroup, model)
          oldToNewIds[oldId] = newId
        })
      }
    })

    /**
     * Update references in importModel
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

    if (importModel.groups) {
      const groupsByTemplate = {}
      Object.values(importModel.groups).forEach(group => {
        if (group.template) {
          if (!groupsByTemplate[group.template]) {
            groupsByTemplate[group.template] = []
          }
          groupsByTemplate[group.template].push(group)
        }
      })
      for (let oldId in oldToNewIds) {
        let newId = oldToNewIds[oldId]
        if (groupsByTemplate[oldId]) {
          let groups = groupsByTemplate[oldId]
          groups.forEach(groups => {
            groups.template = newId
          })
        }
      }
    }

    /**
     * Update also groups children
     */
    Object.values(importModel.templates).forEach(template => {
      if (template.type === "Group") {
        template.children = template.children.map(oldId => oldToNewIds[oldId])
        if (template.groups) {
          template.groups.forEach(subgroup => {
            subgroup.parent = template.id
            subgroup.children = subgroup.children.map(oldId => oldToNewIds[oldId])
          })
        }
      }
    })



  
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
  var uuid = model.lastUUID++ +  "_" + Math.round(Math.random() * 100000);
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