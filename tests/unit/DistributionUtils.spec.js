import * as DistributionUtil from '../../src/core/DistributionUtil'
import ModelUtil from '../../src/core/ModelUtil'
import alignmentBug2 from './data/alignmentBug2.json'

test('Test ModelUtil2.explodeGroupSelection() > getBoxesInSelection(false) ', async () => {

    const result = DistributionUtil.getBoxesInSelection(alignmentBug2, ["w10011_49270", "w10017_23374", "w10018_20189"], true)
    expect(result.length).toBe(3)

    const result2 = DistributionUtil.getBoxesInSelection(alignmentBug2, ["w10011_49270", "w10017_23374", "w10018_20189", "g10034_6454" ], true)
    expect(result.length).toBe(3)
})


test('Test ModelUtil2.explodeGroupSelection() > getBoxesInSelection(false) ', async () => {

    const result = DistributionUtil.getBoxesInSelection(alignmentBug2, ["w10011_49270", "w10017_23374", "w10018_20189"], false)
    expect(result.length).toBe(3)
})

test('Test ModelUtil2.explodeGroupSelection() > getBoxesInSelection(true) ', async () => {
    const wrapper = alignmentBug2.groups['g10034_6454']
    const all = ModelUtil.getAllGroupChildren(wrapper, alignmentBug2)
    const result = DistributionUtil.getBoxesInSelection(alignmentBug2, all, true)
    expect(result.length).toBe(13)
})


test('Test ModelUtil2.explodeGroupSelection() > getBoxesInSelection(true) ', async () => {
    const wrapper = alignmentBug2.groups['g10034_6454']
    const all = ModelUtil.getAllGroupChildren(wrapper, alignmentBug2)
    const result = DistributionUtil.getBoxesInSelection(alignmentBug2, all, false)
    expect(result.length).toBe(4)
    expectChild(result, 'g10019_13136', true, 3)
    expectChild(result, 'g10020_48808', true, 4)
    expectChild(result, 'g10033_87376', true, 5)
    expectChild(result, 'w10008_49981', true, 1)

})

function expectChild(result, id, expectedFound, expectedChildren) {
    const found = result.find(r => r.id === id)
    expect(found !== undefined).toBe(expectedFound)
    if (found)
        expect(found.children.length).toBe(expectedChildren)
}

