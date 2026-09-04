import { TreeIndex } from '../../src/core/responsive/TreeIndex'
import app from './data/treeIndex.json'

const screenId = 's10000_80355'
const groupId = 'g10025_99127' // "Group"
const subGroupId = 'g10028_70903' // "SubGroup", nested in "Group"

test('TreeIndex.js - builds a Map<ChildId, ParentID> for every widget and group', () => {
    const index = new TreeIndex(app)

    // one entry per widget, plus one virtual entry per group
    const expectedSize = Object.keys(app.widgets).length + Object.keys(app.groups).length
    expect(index.parents.size).toBe(expectedSize)
})

test('TreeIndex.js - widgets not nested in another widget have the screen as parent', () => {
    const index = new TreeIndex(app)

    expect(index.getParent('w10018_23332')).toBe(screenId) // Grid Container
    expect(index.getParent('w10015_11776')).toBe(screenId) // Flex Container
    expect(index.getParent('w10019_53053')).toBe(screenId) // Level1
})

test('TreeIndex.js - visually nested widgets point to their direct parent', () => {
    const index = new TreeIndex(app)

    // Flex1, Flex2 and Flex3 all sit inside the Flex Container
    expect(index.getParent('w10010_43885')).toBe('w10015_11776')
    expect(index.getParent('w10016_64924')).toBe('w10015_11776')
    expect(index.getParent('w10017_84479')).toBe('w10015_11776')

    // Level1 > Level2 > Level3
    expect(index.getParent('w10020_45906')).toBe('w10019_53053')
    expect(index.getParent('w10021_59846')).toBe('w10020_45906')

    // Level1 (copy) > Level2 (copy) > Level3 (copy)
    expect(index.getParent('w10023_83102')).toBe('w10022_47770')
    expect(index.getParent('w10024_62496')).toBe('w10023_83102')

    // Grid1 and Grid2 both sit inside the Grid Container
    expect(index.getParent('w10026_33032')).toBe('w10018_23332')
    expect(index.getParent('w10027_85369')).toBe('w10018_23332')
})

test('TreeIndex.js - groups get a virtual parent entry, nested groups point to their parent group', () => {
    const index = new TreeIndex(app)

    const groupWrapperId = index.getGroupWrapperId(groupId)
    const subGroupWrapperId = index.getGroupWrapperId(subGroupId)

    // "Group" has no parent group, so it sits directly under the screen
    expect(index.getParent(groupWrapperId)).toBe(screenId)

    // "SubGroup" is nested inside "Group"
    expect(index.getParent(subGroupWrapperId)).toBe(groupWrapperId)

    // Level1 (copy) is the top most widget of "SubGroup", so it becomes its child
    expect(index.getParent('w10022_47770')).toBe(subGroupWrapperId)
})

test('TreeIndex.js - hasParent()', () => {
    const index = new TreeIndex(app)

    expect(index.hasParent('w10020_45906')).toBe(true)
    expect(index.hasParent('unknown-widget-id')).toBe(false)
})

test('TreeIndex.js - getChildren() returns only the direct children', () => {
    const index = new TreeIndex(app)

    // Grid Container has Grid2 and Grid1 as direct children, but not Grid3,
    // which is nested inside Grid2
    expect(index.getChildren('w10018_23332')).toEqual(['w10026_33032', 'w10027_85369'])

    // Grid2 has Grid3 as its direct child
    expect(index.getChildren('w10026_33032')).toEqual(['w10029_24370'])

    // Grid3 and Grid1 are leaves, they have no children
    expect(index.getChildren('w10029_24370')).toEqual([])
    expect(index.getChildren('w10027_85369')).toEqual([])

    // unknown ids just return an empty array
    expect(index.getChildren('unknown-widget-id')).toEqual([])
})
