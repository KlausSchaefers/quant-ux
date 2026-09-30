import lang from '../../dojo/_base/lang'

/**
 * The canonical QuantUX template logic, extracted from the canvas controllers
 * so the AI agent can produce and instantiate components that are identical to
 * the ones a user creates by hand.
 *
 * Everything in here is data in / data out. There is no controller, no command
 * stack, no rendering and no `this.model`: callers pass the model (or an app
 * fragment) they want to work on. Commands, undo, naming and rendering stay in
 * the controllers.
 *
 * The two halves mirror the two canvas flows:
 *
 *   createGroupTemplate + applyTemplatesToModel  <- Templates.addNestedTemplateGroup
 *   instantiateGroupTemplate                     <- Group.addGroupByTemplate
 */

/**
 * Turns a widget template into the instance model that is placed on a screen.
 * The style is deliberately NOT copied: it is always resolved from the template
 * at render time (see ModelUtil.getStyle).
 */
export function createTemplatedWidget (t) {
    return {
        id: t.id,
        name: t.name,
        w: t.w,
        h: t.h,
        x: t.x,
        y: t.y,
        z: t.z,
        template: t.id,
        type: t.type,
        props: lang.clone(t.props),
        has: lang.clone(t.has),
        style: {}
    }
}

/**
 * Same for a (sub) group template.
 */
export function createTemplatedGroup (t) {
    return {
        id: t.id,
        name: t.name,
        template: t.id,
        children: lang.clone(t.children)
    }
}

/**
 * A plain widget template. The style and all interaction states move to the
 * template, the instance keeps none of them.
 */
export function createWidgetTemplate (widget, visible, name, getUUID) {
    const template = {}
    template.id = 'tw' + getUUID()
    template.style = lang.clone(widget.style)

    copyStates(widget, template)

    template.has = lang.clone(widget.has)
    template.props = lang.clone(widget.props)
    template.w = widget.w
    template.h = widget.h
    template.z = widget.z
    template.x = 0
    template.y = 0
    template.templateType = 'Widget'
    template.type = widget.type
    template.visible = visible
    template.name = name
    template.modified = new Date().getTime()
    template.created = new Date().getTime()
    return template
}

/**
 * A widget that is already templated becomes a variant of its parent template,
 * so the style hierarchy is preserved (see ModelUtil.getMergedTemplate).
 */
export function createTemplateVariant (widget, parentTemplate, visible, name, getUUID) {
    const template = {}
    template.id = 'tw' + getUUID()
    template.visible = visible
    template.variant = true
    template.name = name
    template.modified = new Date().getTime()
    template.created = new Date().getTime()
    template.w = widget.w
    template.h = widget.h
    template.z = widget.z
    template.x = 0
    template.y = 0
    template.templateType = 'Widget'
    template.type = widget.type
    template.has = lang.clone(widget.has)
    template.props = lang.clone(widget.props)
    template.variantOf = parentTemplate.variantOf ? parentTemplate.variantOf : parentTemplate.id
    template.style = lang.clone(widget.style)

    copyStates(widget, template)

    return template
}

/**
 * Creates a widget template, or a variant of it when the widget is already
 * linked to one.
 */
export function createOrCopyWidgetTemplate (widget, visible, name, templates, getUUID) {
    if (widget.template && templates && templates[widget.template]) {
        return createTemplateVariant(widget, templates[widget.template], visible, name, getUUID)
    }
    return createWidgetTemplate(widget, visible, name, getUUID)
}

function copyStates (widget, template) {
    if (widget.hover) {
        template.hover = lang.clone(widget.hover)
    }
    if (widget.error) {
        template.error = lang.clone(widget.error)
    }
    if (widget.active) {
        template.active = lang.clone(widget.active)
    }
    if (widget.focus) {
        template.focus = lang.clone(widget.focus)
    }
    if (widget.designtokens) {
        template.designtokens = lang.clone(widget.designtokens)
    }
}

/**
 * Builds the master template of a component: one Group template plus one Widget
 * template per child, with child coordinates relative to the group bounding box
 * and z set to the position inside the group.
 *
 * Nothing is written to the model, the caller decides what to do with the
 * result (create a command, merge it into an app fragment, ...).
 *
 * @param {Object} options
 * @param {Object} options.group          the group being templated
 * @param {Array}  options.widgets        all group children, already sorted by z
 * @param {Object} options.boundingBox    bounding box of those widgets
 * @param {Object} options.groups         id -> group, to resolve sub groups
 * @param {Object} options.templates      existing templates, for variant detection
 * @param {String} options.name           the component name
 * @param {Function} options.getUUID
 * @returns {{groupTemplate, widgetTemplates, widgetIds, template2Widget}}
 */
export function createGroupTemplate (options) {
    const { group, widgets, boundingBox, groups, templates, name, getUUID } = options

    const groupTemplate = {
        id: 'tg' + getUUID(),
        type: 'Group',
        templateType: 'Group',
        visible: true,
        name: name,
        children: [],
        groups: [],
        w: boundingBox.w,
        h: boundingBox.h
    }

    const widgetTemplates = []
    const widgetIds = []
    const template2Widget = {}

    widgets.forEach((widget, index) => {
        const t = createOrCopyWidgetTemplate(widget, false, widget.name, templates, getUUID)
        t.x = widget.x - boundingBox.x
        t.y = widget.y - boundingBox.y
        t.z = index

        groupTemplate.children.push(t.id)
        widgetTemplates.push(t)
        widgetIds.push(widget.id)
        template2Widget[widget.id] = t.id
    })

    createSubGroupTemplates(groupTemplate, group, groupTemplate.id, groups, template2Widget, getUUID)

    return { groupTemplate, widgetTemplates, widgetIds, template2Widget }
}

/**
 * Sub groups are stored flat in groupTemplate.groups (not as separate templates),
 * which keeps the preview and the create rendering simple.
 */
export function createSubGroupTemplates (groupTemplate, group, parentID, groups, template2Widget, getUUID) {
    if (!group.groups) {
        return
    }
    group.groups.forEach(subID => {
        const subgroup = groups ? groups[subID] : null
        if (!subgroup) {
            return
        }
        const childTemplate = {
            id: 'tsg' + getUUID(),
            name: subgroup.name,
            templateType: 'Group',
            groupID: subgroup.id, // FIXME: This is an ugly typo, kept for compatibility
            parent: parentID,
            children: []
        }

        if (subgroup.children) {
            subgroup.children.forEach(widgetID => {
                if (template2Widget[widgetID]) {
                    childTemplate.children.push(template2Widget[widgetID])
                } else {
                    console.warn('TemplateService.createSubGroupTemplates() Cannot map widget id', widgetID)
                }
            })
        }

        groupTemplate.groups.push(childTemplate)

        createSubGroupTemplates(groupTemplate, subgroup, childTemplate.id, groups, template2Widget, getUUID)
    })
}

/**
 * Registers the templates in the model and turns the source widgets and groups
 * into instances: linked to their template, stripped of their own style and of
 * their design tokens (both now live in the template).
 *
 * Mutates the given model, which can be the project model or an AI app fragment.
 */
export function applyTemplatesToModel (model, childTemplates, widgetIDs, groupTemplate, groupID) {
    if (!model.templates) {
        model.templates = {}
    }

    for (let i = 0; i < childTemplates.length; i++) {
        const t = childTemplates[i]
        const widgetID = widgetIDs[i]

        model.templates[t.id] = t

        const widget = model.widgets[widgetID]
        if (widget) {
            widget.template = t.id
            widget.isRootTemplate = true
            widget.modified = new Date().getTime()
            widget.style = {}
            if (widget.hover) {
                widget.hover = {}
            }
            if (widget.error) {
                widget.error = {}
            }
            if (widget.focus) {
                widget.focus = {}
            }
            if (widget.active) {
                widget.active = {}
            }
            if (widget.designtokens) {
                delete widget.designtokens
            }
        } else {
            console.warn('TemplateService.applyTemplatesToModel() > No Widget with ', widgetID)
        }
    }

    if (groupTemplate) {
        model.templates[groupTemplate.id] = groupTemplate

        /**
         * Since 4.0.60 we have sub groups
         */
        if (groupTemplate.groups) {
            groupTemplate.groups.forEach(childGroupTemplate => {
                const childGroup = model.groups ? model.groups[childGroupTemplate.groupID] : null
                if (childGroup) {
                    childGroup.template = childGroupTemplate.id
                    childGroup.isRootTemplate = true
                } else {
                    console.warn('TemplateService.applyTemplatesToModel() > No childgroup with ', childGroupTemplate.groupID)
                }
            })
        }
    }

    if (groupID && model.groups && model.groups[groupID]) {
        model.groups[groupID].template = groupTemplate.id
        model.groups[groupID].isRootTemplate = true
    }
}

/**
 * Builds a new instance of a group template at the given position: a group, its
 * sub groups and the widgets, all with fresh ids, absolute coordinates and no
 * own style.
 *
 * Nothing is added to the model, the caller adds the returned models (and
 * creates the matching commands).
 *
 * @param {Object} options
 * @param {Object} options.groupTemplate
 * @param {Object} options.templates      id -> template
 * @param {Object} options.pos            {x, y} of the top left corner
 * @param {Number} options.maxZ           highest z currently used on the model
 * @param {Function} options.getUUID
 * @param {Function} [options.nameFor]    (name) => unique name
 * @param {Function} [options.needsRootTemplate] (template) => boolean
 * @param {Function} [options.sortWidgets] (templates) => templates, defaults to
 *        z order with an id tie break. The canvas passes CoreUtil.getOrderedWidgets,
 *        which also accounts for fixed and inherited widgets.
 * @returns {{group, subgroups, widgets}}
 */
export function instantiateGroupTemplate (options) {
    const { groupTemplate, templates, pos, maxZ, getUUID } = options
    const nameFor = options.nameFor || (name => name)
    const needsRootTemplate = options.needsRootTemplate || (() => false)
    const sortWidgets = options.sortWidgets || defaultSortWidgets

    const group = createTemplatedGroup(groupTemplate)
    group.id = 'tg' + getUUID()
    group.groups = []
    if (needsRootTemplate(groupTemplate)) {
        group.isRootTemplate = true
    }
    group.name = nameFor(group.name)

    const [subgroups, template2Group] = instantiateSubGroups(groupTemplate, group, getUUID, nameFor, needsRootTemplate)

    /**
     * The children are ordered by z, so the instance keeps the stacking of the
     * original component.
     */
    const children = sortWidgets(group.children.map(id => templates[id]).filter(t => t))

    group.children = []

    const widgets = []
    children.forEach((widgetTemplate, i) => {
        const widget = createTemplatedWidget(widgetTemplate)
        if (needsRootTemplate(widgetTemplate)) {
            widget.isRootTemplate = true
        }
        widget.id = 'w' + getUUID()
        widget.x += pos.x
        widget.y += pos.y
        widget.z = maxZ + 1 + i
        widget.name = nameFor(widgetTemplate.name)

        if (template2Group[widget.template]) {
            template2Group[widget.template].children.push(widget.id)
        } else {
            group.children.push(widget.id)
        }
        widgets.push(widget)
    })

    return { group, subgroups: Object.values(subgroups), widgets }
}

function defaultSortWidgets (templates) {
    return templates.slice(0).sort((a, b) => {
        if (a.z === b.z && a.id && b.id) {
            return a.id.localeCompare(b.id)
        }
        return a.z - b.z
    })
}

function instantiateSubGroups (groupTemplate, group, getUUID, nameFor, needsRootTemplate) {
    const subgroups = {}
    const template2Group = {}

    if (groupTemplate.groups) {
        groupTemplate.groups.forEach(subGroupTemplate => {
            const subgroup = createTemplatedGroup(subGroupTemplate)
            subgroup.children = []
            subgroup.groups = []
            subgroup.parent = subGroupTemplate.parent
            subgroup.id = 'tg' + getUUID()
            if (needsRootTemplate(subGroupTemplate)) {
                subgroup.isRootTemplate = true
            }
            subgroup.name = nameFor(subGroupTemplate.name)

            subGroupTemplate.children.forEach(childTemplateId => {
                template2Group[childTemplateId] = subgroup
            })
            subgroups[subGroupTemplate.id] = subgroup
        })

        // sort hierarchically to parents
        Object.values(subgroups).forEach(subgroup => {
            if (subgroup.parent && subgroups[subgroup.parent]) {
                subgroups[subgroup.parent].groups.push(subgroup.id)
            } else {
                group.groups.push(subgroup.id)
            }
            delete subgroup.parent
        })
    }

    return [subgroups, template2Group]
}

export default {
    createTemplatedWidget,
    createTemplatedGroup,
    createWidgetTemplate,
    createTemplateVariant,
    createOrCopyWidgetTemplate,
    createGroupTemplate,
    createSubGroupTemplates,
    applyTemplatesToModel,
    instantiateGroupTemplate
}
