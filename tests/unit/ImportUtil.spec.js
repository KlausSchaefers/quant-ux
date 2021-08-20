import * as ImportUtil from '../../src/canvas/controller/ImportUtil'
import app from './data/importTest.json'
import importApp from './data/importTestAdd.json'

test('Test ImportUtil', async () => {

  let changes = ImportUtil.mergeModel(app, importApp, {x:0, y:0})

  let updatedTemplates = Object.values(app.templates)
  let updatedWidgets = Object.values(app.widgets)
  let updatedScreens = Object.values(app.screens)
  let updatedGroups = Object.values(app.groups)
  let updatedLines = Object.values(app.lines)


  /**
   * Template created
   */
  expect(changes.filter(c => c.type === 'template').length).toBe(1)
  expect(updatedTemplates.length).toBe(2)

  /**
   * Groups created
   */
  expect(changes.filter(c => c.type === 'group').length).toBe(2)
  expect(updatedGroups.length).toBe(4)

  /**
   * group and subgroups are still linked
   */
  let importedParentGroup = updatedGroups.find(g => g.importSourceId === 'g10006')
  let importedChildGroup = updatedGroups.find(g => g.importSourceId === 'g10004')
  expect(importedParentGroup.groups.length).toBe(1)
  expect(importedParentGroup.groups[0]).toBe(importedChildGroup.id)


  /**
   * Check widgets created
   */

  /**
   * Check widget template refs updated
   */
    //let newTemplateId = changes.filter(c => c.type === 'template')[0].id
  console.debug('end', changes)
});

