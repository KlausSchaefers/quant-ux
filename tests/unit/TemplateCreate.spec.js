import * as TestUtil from './TestUtil'

/**
 * Characterization tests for the manual "create a component" flow:
 * Templates.addNestedTemplateGroup() and Group.addGroupByTemplate().
 *
 * These two methods had no coverage, and they define the canonical template
 * schema every other part of the app (rendering, template sync, the Create
 * menu) depends on. They are pinned here before the TemplateService
 * extraction, so the refactoring cannot silently change the output.
 */
function createModel() {
    return {
        id: 'a1',
        version: 4,
        name: 'Test',
        screenSize: { w: 800, h: 600 },
        type: 'desktop',
        lastUUID: 100,
        screens: {
            s1: {
                id: 's1', name: 'Screen', type: 'Screen',
                x: 0, y: 0, w: 800, h: 600,
                min: { w: 800, h: 600 },
                style: { background: '#ffffff' },
                props: { start: true }, has: {},
                children: ['w1', 'w2']
            }
        },
        widgets: {
            w1: {
                id: 'w1', name: 'Logo', type: 'Label',
                x: 20, y: 40, z: 1, w: 100, h: 24,
                style: { color: '#111827' },
                hover: { color: '#2563eb' },
                designtokens: { style: { color: 'dt1' } },
                props: { label: 'Acme' },
                has: { label: true }
            },
            w2: {
                id: 'w2', name: 'Cta', type: 'Button',
                x: 200, y: 40, z: 2, w: 120, h: 32,
                style: { background: '#2563eb' },
                props: { label: 'Get Started' },
                has: { label: true }
            }
        },
        groups: {
            g1: { id: 'g1', name: 'Sidebar', children: ['w1', 'w2'], groups: [] }
        },
        templates: {},
        lines: {},
        designtokens: {}
    }
}

function getTemplates(model) {
    const all = Object.values(model.templates)
    return {
        group: all.find(t => t.templateType === 'Group'),
        widgets: all.filter(t => t.templateType === 'Widget')
    }
}

describe('Templates.addNestedTemplateGroup', () => {

    test('creates one Group template and one Widget template per child', () => {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')

        const { group, widgets } = getTemplates(model)
        expect(Object.keys(model.templates)).toHaveLength(3)
        expect(group.id).toMatch(/^tg/)
        expect(widgets).toHaveLength(2)
        widgets.forEach(t => expect(t.id).toMatch(/^tw/))
    })

    test('group template holds the bounding box, template child ids and a groups array', () => {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')

        const { group } = getTemplates(model)
        expect(group.name).toBe('Sidebar')
        expect(group.type).toBe('Group')
        expect(group.templateType).toBe('Group')
        expect(group.visible).toBe(true)
        // bounding box of w1 (20,40,100x24) and w2 (200,40,120x32)
        expect(group.w).toBe(300)
        expect(group.h).toBe(32)
        expect(group.groups).toEqual([])

        expect(group.children).toHaveLength(2)
        group.children.forEach(id => {
            expect(model.templates[id]).toBeDefined()
            expect(model.templates[id].templateType).toBe('Widget')
        })
        expect(group.children).not.toContain('w1')
    })

    test('widget templates use coordinates relative to the bounding box and z by order', () => {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')

        const { widgets } = getTemplates(model)
        const logo = widgets.find(t => t.name === 'Logo')
        const cta = widgets.find(t => t.name === 'Cta')

        expect(logo.x).toBe(0)
        expect(logo.y).toBe(0)
        expect(cta.x).toBe(180)
        expect(cta.y).toBe(0)

        // z is the index inside the group, not the canvas z
        expect(logo.z).toBe(0)
        expect(cta.z).toBe(1)

        expect(logo.w).toBe(100)
        expect(logo.h).toBe(24)
        expect(logo.visible).toBe(false)
        expect(logo.type).toBe('Label')
    })

    test('widget templates own style, interaction states and design tokens', () => {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')

        const { widgets } = getTemplates(model)
        const logo = widgets.find(t => t.name === 'Logo')

        expect(logo.style).toEqual({ color: '#111827' })
        expect(logo.hover).toEqual({ color: '#2563eb' })
        expect(logo.designtokens).toEqual({ style: { color: 'dt1' } })
        expect(logo.props).toEqual({ label: 'Acme' })
        expect(logo.has).toEqual({ label: true })
    })

    test('the source widgets become linked instances without own style', () => {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')

        const { group, widgets } = getTemplates(model)
        const logo = widgets.find(t => t.name === 'Logo')

        expect(model.widgets.w1.template).toBe(logo.id)
        expect(model.widgets.w1.style).toEqual({})
        expect(model.widgets.w1.hover).toEqual({})
        expect(model.widgets.w1.designtokens).toBeUndefined()
        expect(model.widgets.w1.isRootTemplate).toBe(true)

        expect(model.groups.g1.template).toBe(group.id)
        expect(model.groups.g1.isRootTemplate).toBe(true)
    })

    test('is undoable and redoable', async () => {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')
        const templateIds = Object.keys(model.templates)

        await controller.undo()
        expect(Object.keys(model.templates)).toHaveLength(0)
        expect(model.widgets.w1.template).toBeUndefined()
        expect(model.widgets.w1.style).toEqual({ color: '#111827' })

        await controller.redo()
        expect(Object.keys(model.templates)).toEqual(templateIds)
        expect(model.widgets.w1.template).toBe(templateIds.find(id => id.startsWith('tw')))
        expect(model.widgets.w1.style).toEqual({})
    })
})

describe('Group.addGroupByTemplate', () => {

    function createModelWithTemplate() {
        const [controller, model] = TestUtil.createController(createModel())
        controller.addNestedTemplateGroup(model.groups.g1, 'Sidebar')
        return [controller, model]
    }

    test('instantiates the template at the drop position with fresh ids', () => {
        const [controller, model] = createModelWithTemplate()
        const { group: groupTemplate } = getTemplates(model)

        const param = controller.factory.createTemplatedModel({ id: groupTemplate.id })
        controller.addGroupByTemplate(param, { x: 400, y: 200 })

        const instances = Object.values(model.groups).filter(g => g.template === groupTemplate.id)
        expect(instances).toHaveLength(2)

        const instance = instances.find(g => g.id !== 'g1')
        expect(instance.children).toHaveLength(2)
        expect(instance.children).not.toContain('w1')

        const widgets = instance.children.map(id => model.widgets[id])
        const logo = widgets.find(w => model.templates[w.template].name === 'Logo')
        const cta = widgets.find(w => model.templates[w.template].name === 'Cta')

        // template x/y are relative, the drop position is added on top
        expect(logo.x).toBe(400)
        expect(logo.y).toBe(200)
        expect(cta.x).toBe(580)
        expect(cta.y).toBe(200)
        expect(logo.w).toBe(100)
        expect(logo.h).toBe(24)
    })

    test('instance widgets carry no own style and are linked to the widget templates', () => {
        const [controller, model] = createModelWithTemplate()
        const { group: groupTemplate } = getTemplates(model)

        const param = controller.factory.createTemplatedModel({ id: groupTemplate.id })
        controller.addGroupByTemplate(param, { x: 400, y: 200 })

        const instance = Object.values(model.groups).find(g => g.template === groupTemplate.id && g.id !== 'g1')
        instance.children.forEach(id => {
            const widget = model.widgets[id]
            expect(widget.style).toEqual({})
            expect(model.templates[widget.template]).toBeDefined()
            expect(model.templates[widget.template].templateType).toBe('Widget')
            // the first instance already owns the root flag
            expect(widget.isRootTemplate).toBeUndefined()
        })
    })

    test('reuses the existing templates instead of creating new ones', () => {
        const [controller, model] = createModelWithTemplate()
        const { group: groupTemplate } = getTemplates(model)
        const before = Object.keys(model.templates).length

        const param = controller.factory.createTemplatedModel({ id: groupTemplate.id })
        controller.addGroupByTemplate(param, { x: 400, y: 200 })

        expect(Object.keys(model.templates)).toHaveLength(before)
    })
})
