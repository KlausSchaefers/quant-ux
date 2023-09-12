import * as SelectionUtil from '../../src/core/SelectionUtil'
import model from './data/selectionUtil'


test('SelectionUtil.updateSelection() >  Nothing selected, Group Child ', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10187_77514', null, null)
    expect(selectedWidgetID).toBe(null)
    expect(selectedGroupId).toBe('g10189_82564')
})

test('SelectionUtil.updateSelection() >  Nothing selected, Nest Group Child ', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10084_4553', null, null)
    expect(selectedWidgetID).toBe(null)
    expect(selectedGroupId).toBe('g10090_3958')
})

test('SelectionUtil.updateSelection() >  Nothing selected, Single Widget', async () => {
    const  [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10137_20407', null, null)
    expect(selectedWidgetID).toBe('w10137_20407')
    expect(selectedGroupId).toBe(null)
})

test('SelectionUtil.updateSelection() >  Same Widget Selected, Single Widget', async () => {
    const  [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10137_20407', 'w10137_20407', null)
    expect(selectedWidgetID).toBe('w10137_20407')
    expect(selectedGroupId).toBe(null)
})

test('SelectionUtil.updateSelection() >  Other Widget Selected, Single Widget', async () => {
    const  [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10137_20407', 'w10118_49948', null)
    expect(selectedWidgetID).toBe('w10137_20407')
    expect(selectedGroupId).toBe(null)
})


test('SelectionUtil.updateSelection() >  Simple Group Selected, Child Widget', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10187_77514', null, 'g10189_82564')
    //console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe('w10187_77514')
    expect(selectedGroupId).toBe(null)
})

test('SelectionUtil.updateSelection() >  Simple Group Selected, Other Widget -> Other Top', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10087_67866', null, 'g10189_82564')
    //console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe(null)
    expect(selectedGroupId).toBe('g10090_3958')
})

test('SelectionUtil.updateSelection() >  Nested Group Selected, Other Widget -> Other Simple', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10187_77514', null, 'g10090_3958')
    //console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe(null)
    expect(selectedGroupId).toBe('g10189_82564')
})

test('SelectionUtil.updateSelection() >  Nested Group Selected, Same Widget -> Child Group Simple', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10087_67866', null, 'g10090_3958')
    console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe(null)
    expect(selectedGroupId).toBe('g10089_11289')
})

test('SelectionUtil.updateSelection() >  Nested Group Selected, Single Widget ->  Single Widgte', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10137_20407', null, 'g10090_3958')
    console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe('w10137_20407')
    expect(selectedGroupId).toBe(null)
})

test('SelectionUtil.updateSelection() >  Leaf Widget Selected, Single Widget ->  Single Widget', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10088_54007', 'w10088_54007', null)
    console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe('w10088_54007')
    expect(selectedGroupId).toBe(null)
})

test('SelectionUtil.updateSelection() >  Leaf Widget Selected, Same Group Widget ->  Other Widget', async () => {
    const [selectedWidgetID, selectedGroupId] =  SelectionUtil.updateSelection(model, 'w10084_4553', 'w10085_72837', null)
    console.debug(selectedWidgetID, selectedGroupId)
    expect(selectedWidgetID).toBe('w10084_4553')
    expect(selectedGroupId).toBe(null)
})