import * as TemplateService from '../TemplateService'

/**
 * Unit tests for the pure template logic. The canvas behaviour is pinned in
 * tests/unit/TemplateCreate.spec.js; these cover the service on its own, which
 * is how the AI agent uses it (no controller, no command stack).
 */

let uuid = 0
const getUUID = () => {
    uuid++
    return '' + uuid
}

beforeEach(() => {
    uuid = 0
})

function createFragment () {
    return {
        widgets: {
            w1: {
                id: 'w1', name: 'Logo', type: 'Label',
                x: 20, y: 40, z: 1, w: 100, h: 24,
                style: { color: '#111827' },
                hover: { color: '#2563eb' },
                designtokens: { style: { color: 'dt1' } },
                props: { label: 'Acme' }, has: { label: true }
            },
            w2: {
                id: 'w2', name: 'Cta', type: 'Button',
                x: 200, y: 40, z: 2, w: 120, h: 32,
                style: { background: '#2563eb' },
                props: { label: 'Get Started' }, has: { label: true }
            }
        },
        groups: {
            g1: { id: 'g1', name: 'Sidebar', children: ['w1', 'w2'], groups: [] }
        },
        templates: {}
    }
}

/**
 * Mirrors what the controller does with getAllGroupChildren: the templated
 * widgets are the children of the group AND of all its sub groups.
 */
function getAllGroupChildren (group, fragment) {
    let ids = group.children.slice(0)
    ;(group.groups || []).forEach(subId => {
        const sub = fragment.groups[subId]
        if (sub) {
            ids = ids.concat(getAllGroupChildren(sub, fragment))
        }
    })
    return ids
}

function templatize (fragment, name = 'Sidebar') {
    const widgets = getAllGroupChildren(fragment.groups.g1, fragment).map(id => fragment.widgets[id])
    const result = TemplateService.createGroupTemplate({
        group: fragment.groups.g1,
        widgets: widgets,
        boundingBox: { x: 20, y: 40, w: 300, h: 32 },
        groups: fragment.groups,
        templates: fragment.templates,
        name: name,
        getUUID: getUUID
    })
    TemplateService.applyTemplatesToModel(
        fragment, result.widgetTemplates, result.widgetIds, result.groupTemplate, 'g1'
    )
    return result
}

describe('createGroupTemplate', () => {

    test('produces one group template and one widget template per child', () => {
        const fragment = createFragment()
        const { groupTemplate, widgetTemplates } = templatize(fragment)

        expect(groupTemplate.id).toMatch(/^tg/)
        expect(groupTemplate.templateType).toBe('Group')
        expect(groupTemplate.type).toBe('Group')
        expect(groupTemplate.visible).toBe(true)
        expect(groupTemplate.w).toBe(300)
        expect(groupTemplate.h).toBe(32)

        expect(widgetTemplates).toHaveLength(2)
        expect(groupTemplate.children).toEqual(widgetTemplates.map(t => t.id))
    })

    test('child coordinates are relative and z follows the group order', () => {
        const fragment = createFragment()
        const { widgetTemplates } = templatize(fragment)
        const [logo, cta] = widgetTemplates

        expect(logo.x).toBe(0)
        expect(logo.y).toBe(0)
        expect(logo.z).toBe(0)
        expect(cta.x).toBe(180)
        expect(cta.y).toBe(0)
        expect(cta.z).toBe(1)
    })

    test('style, interaction states and design tokens move to the template', () => {
        const fragment = createFragment()
        const { widgetTemplates } = templatize(fragment)
        const logo = widgetTemplates[0]

        expect(logo.style).toEqual({ color: '#111827' })
        expect(logo.hover).toEqual({ color: '#2563eb' })
        expect(logo.designtokens).toEqual({ style: { color: 'dt1' } })
        expect(logo.visible).toBe(false)
        expect(logo.templateType).toBe('Widget')
    })

    test('an already templated widget becomes a variant of its parent', () => {
        const fragment = createFragment()
        fragment.templates.twParent = { id: 'twParent', name: 'Button', templateType: 'Widget' }
        fragment.widgets.w2.template = 'twParent'

        const { widgetTemplates } = templatize(fragment)
        const cta = widgetTemplates[1]

        expect(cta.variant).toBe(true)
        expect(cta.variantOf).toBe('twParent')
    })

    test('sub groups are flattened into groupTemplate.groups', () => {
        const fragment = createFragment()
        fragment.groups.g1.children = ['w1']
        fragment.groups.g1.groups = ['g2']
        fragment.groups.g2 = { id: 'g2', name: 'Actions', children: ['w2'], groups: [] }

        const widgets = [fragment.widgets.w1, fragment.widgets.w2]
        const { groupTemplate, template2Widget } = TemplateService.createGroupTemplate({
            group: fragment.groups.g1,
            widgets: widgets,
            boundingBox: { x: 20, y: 40, w: 300, h: 32 },
            groups: fragment.groups,
            templates: fragment.templates,
            name: 'Sidebar',
            getUUID: getUUID
        })

        expect(groupTemplate.groups).toHaveLength(1)
        const sub = groupTemplate.groups[0]
        expect(sub.id).toMatch(/^tsg/)
        expect(sub.name).toBe('Actions')
        expect(sub.groupID).toBe('g2')
        expect(sub.parent).toBe(groupTemplate.id)
        expect(sub.children).toEqual([template2Widget.w2])
    })
})

describe('applyTemplatesToModel', () => {

    test('links the instances and strips their own style and tokens', () => {
        const fragment = createFragment()
        const { groupTemplate, widgetTemplates } = templatize(fragment)

        expect(fragment.widgets.w1.template).toBe(widgetTemplates[0].id)
        expect(fragment.widgets.w1.style).toEqual({})
        expect(fragment.widgets.w1.hover).toEqual({})
        expect(fragment.widgets.w1.designtokens).toBeUndefined()
        expect(fragment.widgets.w1.isRootTemplate).toBe(true)

        expect(fragment.groups.g1.template).toBe(groupTemplate.id)
        expect(fragment.groups.g1.isRootTemplate).toBe(true)
        expect(fragment.templates[groupTemplate.id]).toBe(groupTemplate)
    })

    test('creates the templates map when the fragment has none', () => {
        const fragment = createFragment()
        delete fragment.templates
        const widgets = [fragment.widgets.w1]
        const t = TemplateService.createWidgetTemplate(fragment.widgets.w1, false, 'Logo', getUUID)

        TemplateService.applyTemplatesToModel(fragment, [t], widgets.map(w => w.id))
        expect(fragment.templates[t.id]).toBe(t)
    })
})

describe('instantiateGroupTemplate', () => {

    test('round trip: a template instantiated elsewhere keeps the relative layout', () => {
        const fragment = createFragment()
        const { groupTemplate } = templatize(fragment)

        const instance = TemplateService.instantiateGroupTemplate({
            groupTemplate: groupTemplate,
            templates: fragment.templates,
            pos: { x: 500, y: 300 },
            maxZ: 10,
            getUUID: getUUID
        })

        expect(instance.group.id).toMatch(/^tg/)
        expect(instance.group.id).not.toBe(groupTemplate.id)
        expect(instance.group.template).toBe(groupTemplate.id)
        expect(instance.widgets).toHaveLength(2)

        const logo = instance.widgets[0]
        const cta = instance.widgets[1]
        expect(logo.x).toBe(500)
        expect(logo.y).toBe(300)
        expect(cta.x).toBe(680)
        expect(cta.y).toBe(300)

        // the horizontal distance of the original widgets is preserved
        expect(cta.x - logo.x).toBe(fragment.widgets.w2.x - fragment.widgets.w1.x)
    })

    test('instance widgets are linked, unstyled and stacked above maxZ', () => {
        const fragment = createFragment()
        const { groupTemplate } = templatize(fragment)

        const instance = TemplateService.instantiateGroupTemplate({
            groupTemplate: groupTemplate,
            templates: fragment.templates,
            pos: { x: 0, y: 0 },
            maxZ: 10,
            getUUID: getUUID
        })

        instance.widgets.forEach((widget, i) => {
            expect(widget.id).toMatch(/^w/)
            expect(widget.style).toEqual({})
            expect(fragment.templates[widget.template]).toBeDefined()
            expect(widget.z).toBe(11 + i)
        })
        expect(instance.group.children).toEqual(instance.widgets.map(w => w.id))
    })

    test('widgets of a sub group land in the sub group, not in the root group', () => {
        const fragment = createFragment()
        fragment.groups.g1.children = ['w1']
        fragment.groups.g1.groups = ['g2']
        fragment.groups.g2 = { id: 'g2', name: 'Actions', children: ['w2'], groups: [] }
        const { groupTemplate } = templatize(fragment)

        const instance = TemplateService.instantiateGroupTemplate({
            groupTemplate: groupTemplate,
            templates: fragment.templates,
            pos: { x: 0, y: 0 },
            maxZ: 0,
            getUUID: getUUID
        })

        expect(instance.subgroups).toHaveLength(1)
        const subgroup = instance.subgroups[0]
        expect(instance.group.groups).toEqual([subgroup.id])
        expect(instance.group.children).toHaveLength(1)
        expect(subgroup.children).toHaveLength(1)
        expect(subgroup.parent).toBeUndefined()
    })

    test('nameFor is applied to the group and to every widget', () => {
        const fragment = createFragment()
        const { groupTemplate } = templatize(fragment)

        const instance = TemplateService.instantiateGroupTemplate({
            groupTemplate: groupTemplate,
            templates: fragment.templates,
            pos: { x: 0, y: 0 },
            maxZ: 0,
            getUUID: getUUID,
            nameFor: name => name + ' 2'
        })

        expect(instance.group.name).toBe('Sidebar 2')
        expect(instance.widgets.map(w => w.name)).toEqual(['Logo 2', 'Cta 2'])
    })

    test('needsRootTemplate decides which instance owns the root flag', () => {
        const fragment = createFragment()
        const { groupTemplate } = templatize(fragment)

        const noRoot = TemplateService.instantiateGroupTemplate({
            groupTemplate, templates: fragment.templates, pos: { x: 0, y: 0 }, maxZ: 0, getUUID
        })
        expect(noRoot.group.isRootTemplate).toBeUndefined()
        noRoot.widgets.forEach(w => expect(w.isRootTemplate).toBeUndefined())

        const root = TemplateService.instantiateGroupTemplate({
            groupTemplate, templates: fragment.templates, pos: { x: 0, y: 0 }, maxZ: 0, getUUID,
            needsRootTemplate: () => true
        })
        expect(root.group.isRootTemplate).toBe(true)
        root.widgets.forEach(w => expect(w.isRootTemplate).toBe(true))
    })

    test('children are ordered by z, independent of the children array order', () => {
        const fragment = createFragment()
        const { groupTemplate } = templatize(fragment)
        groupTemplate.children.reverse()

        const instance = TemplateService.instantiateGroupTemplate({
            groupTemplate, templates: fragment.templates, pos: { x: 0, y: 0 }, maxZ: 0, getUUID
        })

        expect(instance.widgets.map(w => w.name)).toEqual(['Logo', 'Cta'])
    })
})
