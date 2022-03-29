import * as ImportUtil from '../../src/canvas/controller/ImportUtil'
import importTestTemplate from './data/importTestTemplate.json'
import importTestTemplateNested from './data/importTestTemplateNested.json'

test('Test ImportUtil.mergeModel() > Template Children', async () => {

    let model = {
        "version": 2.1,
        "name": "ExportTest",
        lastUUID: 10000,
        "description": "",
        "screenSize": {
          "w": 375,
          "h": 667
        },
        "type": "smartphone",
        "screens": {},
        "widgets": {},
        "groups": {},
        "templates": {}
    }

    ImportUtil.mergeModel(model, importTestTemplate, {x:0, y:0})
  
    let updatedTemplates = Object.values(model.templates)
    let templateGroup = updatedTemplates.find(t => t.name ==='Template')
    expect(templateGroup).not.toBeUndefined()
    expect(templateGroup.children.length).toBe(2)
    templateGroup.children.forEach(id => {
        expect(model.templates[id]).not.toBeUndefined()
        expect(model.templates[id]).not.toBeNull()
    })
    
  })


  test('Test ImportUtil.mergeModel() > Template Children', async () => {

    let model = {
        "version": 2.1,
        "name": "ExportTest",
        lastUUID: 10000,
        "description": "",
        "screenSize": {
          "w": 375,
          "h": 667
        },
        "type": "smartphone",
        "screens": {},
        "widgets": {},
        "groups": {},
        "templates": {}
    }

    ImportUtil.mergeModel(model, importTestTemplateNested, {x:0, y:0})

    console.debug(JSON.stringify(model.templates, null, 2))
  
    let updatedTemplates = Object.values(model.templates)
    let templateGroup = updatedTemplates.find(t => t.name ==='Level0')
    expect(templateGroup).not.toBeUndefined()
    expect(templateGroup.children.length).toBe(3)
    templateGroup.children.forEach(id => {
        expect(model.templates[id]).not.toBeUndefined()
        expect(model.templates[id]).not.toBeNull()
    })

    expect(templateGroup.groups.length).toBe(1)
    expect(templateGroup.groups[0].parent).toBe(templateGroup.id)
    expect(templateGroup.groups[0].children.length).toBe(2)
    templateGroup.groups[0].children.forEach(id => {
        expect(model.templates[id]).not.toBeUndefined()
        expect(model.templates[id]).not.toBeNull()
    })
  })

