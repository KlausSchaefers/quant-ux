import * as ImportUtil from '../../src/canvas/controller/ImportUtil'
import app from './data/importTest.json'
import importApp from './data/importTestAdd.json'
import importAppLines from './data/importTestAddWithLines.json'

test('Test ImportUtil', async () => {

  let model = JSON.parse(JSON.stringify(app))

  let changes = ImportUtil.mergeModel(model, importApp, {x:0, y:0})

  let updatedTemplates = Object.values(model.templates)
  let updatedWidgets = Object.values(model.widgets)
  let updatedScreens = Object.values(model.screens)
  let updatedGroups = Object.values(model.groups)

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


  expect(updatedScreens.length).toBe(2)
  expect(changes.filter(c => c.type === 'screen').length).toBe(1)

  /**
   * Check widgets created
   */
   expect(updatedWidgets.length).toBe(12)
   expect(changes.filter(c => c.type === 'widget').length).toBe(6)

   /**
    * Check template reference updated
    */
  let newTemplateId = changes.find(c => c.type === 'template').id
  let newWidget = updatedWidgets.find(w => w.importSourceId === 'w10001')
  expect(newWidget.template).toBe(newTemplateId)

  /**
   * Check screen references given
   */
  let newScreenId = changes.find(c => c.type === 'screen').id
  let newScreen = updatedScreens.find(s => s.id === newScreenId)
  let newWidgetIds = changes.filter(c => c.type === 'widget').map(c => c.id)
  newWidgetIds.forEach(id => expect(newScreen.children.indexOf(id) >=0).toBe(true))

});


test('Test ImportUtil with Lines', async () => {

  let model = JSON.parse(JSON.stringify(app))

  let changes = ImportUtil.mergeModel(model, importAppLines, {x:0, y:0})

  let updatedScreens = Object.values(model.screens)
  let updatedLines = Object.values(model.lines)
  let updatedWidgets = Object.values(model.widgets)

  expect(updatedScreens.length).toBe(3)
  expect(changes.filter(c => c.type === 'screen').length).toBe(2)


  expect(updatedLines.length).toBe(2)
  expect(changes.filter(c => c.type === 'line').length).toBe(2)


  let line1 = updatedLines.find(l => l.importSourceId === 'l10016')
  let line2 = updatedLines.find(l => l.importSourceId === 'l10017')
  let widget1 = updatedWidgets.find(w => w.importSourceId === 'w10001')

  let screen1 = updatedScreens.find(s => s.importSourceId === 's10000')
  let screen2 = updatedScreens.find(s => s.importSourceId === 's10015')

  expect(line1.from).toBe(widget1.id)
  expect(line1.to).toBe(screen2.id)
  expect(line2.from).toBe(screen2.id)
  expect(line2.to).toBe(screen1.id)
});

test('Test ImportUtil.replaceValue', async () => {

  let result = ImportUtil.replaceValue(['a', 'b', 'c', 'd', 'e'], 'a', 'a2')
  expect(result[0]).toBe('a2')

  result = ImportUtil.replaceValue(['a', 'b', 'c', 'd', 'e'], 'e', 'e2')
  expect(result[4]).toBe('e2')
})


test('Test ImportUtil.replaceValues', async () => {

  let result = ImportUtil.replaceValues(['a', 'b', 'c', 'd', 'e'], {'a': 'a1', 'b': 'b1'})
  expect(result[0]).toBe('a1')
  expect(result[1]).toBe('b1')
  expect(result[2]).toBe('c')

  result = ImportUtil.replaceValues(['a', 'b', 'c', 'd', 'e'], {'d': 'd1'})
  expect(result[0]).toBe('a')
  expect(result[3]).toBe('d1')
})