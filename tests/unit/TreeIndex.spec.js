import TreeIndex, { CANVAS_ID } from '../../src/core/responsive/TreeIndex'
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

test('TreeIndex.js - getAllChildren() returns nested children as a list', () => {
    const index = new TreeIndex(app)

    // Grid Container > Grid2 > Grid3, and Grid1, depth-first
    expect(index.getAllChildren('w10018_23332')).toEqual(['w10026_33032', 'w10029_24370', 'w10027_85369'])

    // leaves and unknown ids have no children
    expect(index.getAllChildren('w10029_24370')).toEqual([])
    expect(index.getAllChildren('unknown-widget-id')).toEqual([])

    // no duplicates, and the result is a plain array
    const all = index.getAllChildren(screenId, false)
    expect(Array.isArray(all)).toBe(true)
    expect(new Set(all).size).toBe(all.length)
    expect(all.length).toBe(index.parents.size)
})

test('TreeIndex.js - getAllChildren() excludes groups by default but keeps their members', () => {
    const index = new TreeIndex(app)
    const groupWrapperId = index.getGroupWrapperId(groupId)
    const subGroupWrapperId = index.getGroupWrapperId(subGroupId)

    // default: groups are left out, their members are kept
    const withoutGroups = index.getAllChildren(groupWrapperId)
    expect(withoutGroups).not.toContain(subGroupWrapperId)
    expect(withoutGroups).toEqual(['w10022_47770', 'w10023_83102', 'w10024_62496'])

    const withGroups = index.getAllChildren(groupWrapperId, false)
    expect(withGroups).toContain(subGroupWrapperId)
    expect(withGroups).toContain('w10024_62496')
})

test('TreeIndex.js - getNonGroupParent() skips groups', () => {
    const index = new TreeIndex(app)

    // Level1 (copy) sits in SubGroup, which sits in Group, which sits on the screen
    expect(index.getNonGroupParent('w10022_47770')).toBe(screenId)

    // normal parents are returned as they are
    expect(index.getNonGroupParent('w10020_45906')).toBe('w10019_53053')

    // unknown ids have no parent
    expect(index.getNonGroupParent('unknown-widget-id')).toBeUndefined()
})

test('TreeIndex.js - widgets outside of any screen are mapped to the virtual canvas', () => {
    const model = JSON.parse(JSON.stringify(app))
    const template = model.widgets['w10027_85369']
    model.widgets['w_orphan_1'] = { ...template, id: 'w_orphan_1', x: 5000, y: 5000, w: 300, h: 300, type: 'Box' }
    model.widgets['w_orphan_2'] = { ...template, id: 'w_orphan_2', x: 5010, y: 5010, w: 50, h: 50 }
    const index = new TreeIndex(model)

    expect(index.getParent('w_orphan_1')).toBe(CANVAS_ID)
    expect(index.getParent('w_orphan_2')).toBe('w_orphan_1')
    expect(index.getChildren(CANVAS_ID)).toEqual(['w_orphan_1'])
    expect(index.getAllChildren(CANVAS_ID)).toEqual(['w_orphan_1', 'w_orphan_2'])

    // the screens are untouched
    expect(index.getParent('w10018_23332')).toBe(screenId)
})

test('TreeIndex.js - no canvas entry if all widgets are in a screen', () => {
    const index = new TreeIndex(app)

    expect(index.getChildren(CANVAS_ID)).toEqual([])
})
