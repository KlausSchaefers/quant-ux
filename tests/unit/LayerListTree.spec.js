/* eslint-env jest */
/**
 * Replays LayerList.createNestedModel() on a model, without mounting the
 * component: its methods run on a plain object with the same fields.
 */
import fs from 'fs'
import TreeIndex from '../../src/core/responsive/TreeIndex'

jest.mock('sanitize-html', () => (s) => s)
jest.mock('../../src/canvas/toolbar/chat/AIChat.vue', () => ({}))
jest.mock('../../src/canvas/toolbar/components/AIModeButton.vue', () => ({}))
jest.mock('../../src/common/Tree.vue', () => ({}))

const LayerList = require('../../src/canvas/toolbar/LayerList.vue').default

// the methods of the component and of its mixins
function allMethods(component, result = {}) {
  (component.mixins || []).forEach(m => allMethods(m, result))
  return Object.assign(result, component.methods)
}

function buildTree(model) {
  const methods = allMethods(LayerList)
  const self = Object.assign({}, methods, {
    openNodes: {},
    selection: null,
    includeMasterNodes: false,
    logger: { log () {}, warn () {}, error () {} },
    $set (obj, key, value) { obj[key] = value }
  })
  Object.keys(methods).forEach(key => { self[key] = methods[key].bind(self) })
  self.treeIndex = new TreeIndex(model)
  self.model = model
  self.createNestedModel(model)
  return self
}

const countNodes = (node) => (node.children || []).reduce((sum, c) => sum + 1 + countNodes(c), 0)

const MODEL = process.env.LAYER_MODEL
;(MODEL ? describe : describe.skip)('LayerList on a saved model', () => {
  test('every widget is in the tree of its screen', () => {
    const model = JSON.parse(fs.readFileSync(MODEL, 'utf8'))
    const self = buildTree(model)
    self.root.children.forEach(screen => {
      console.log(screen.label, 'nodes:', countNodes(screen))
    })
    const inTree = new Set()
    const walk = (n) => { inTree.add(n.id); (n.children || []).forEach(walk) }
    self.root.children.forEach(walk)
    const missing = Object.keys(model.widgets).filter(id => !inTree.has(id))
    // where did the missing ones go: their node and the chain of its parents
    missing.slice(0, 10).forEach(id => {
      const chain = []
      let node = self.nodes[id]
      const seen = new Set()
      while (node && !seen.has(node.id)) {
        seen.add(node.id)
        const w = model.widgets[node.id]
        const g = model.groups && model.groups[node.id]
        chain.push(`${node.id} [${w ? w.type + ' ' + w.name : g ? 'group ' + g.name : node.type}]`)
        node = node.groupID ? self.nodes[node.groupID] : null
      }
      if (node) chain.push('CYCLE back to ' + node.id)
      console.log('missing', chain.join(' -> '))
    })
    expect(missing).toEqual([])
  })
})

describe('LayerList with FlexContainers', () => {
  test('the items of a container are under it, all in the screen tree', () => {
    const w = (id, type, x, y, ww, h, z) => ({ id, name: id, type, x, y, w: ww, h, z, props: {}, style: {}, has: {} })
    const model = {
      id: 'a',
      screens: { s1: { id: 's1', name: 'S', x: 0, y: 0, w: 400, h: 800, children: ['f', 'a', 'b', 'other'], props: {}, style: {} } },
      widgets: {
        f: w('f', 'FlexContainer', 0, 0, 400, 100, 1),
        a: w('a', 'Label', 10, 10, 50, 20, 2),
        b: w('b', 'Label', 100, 10, 50, 20, 3),
        other: w('other', 'Box', 0, 200, 50, 20, 4)
      },
      groups: { g: { id: 'g', name: 'G', children: ['f', 'other'], groups: [] } },
      templates: {}
    }
    const self = buildTree(model)
    expect(countNodes(self.root.children[0])).toBeGreaterThanOrEqual(5)
  })
})

describe('LayerList with a container in a sub group of its item', () => {
  // the shape of an AI screen: group Screen > group Brand > {Brand Mark (FlexContainer), its icon}
  test('does not put the outer group into the container, every widget is in the tree', () => {
    const w = (id, type, x, y, ww, h, z) => ({ id, name: id, type, x, y, w: ww, h, z, props: {}, style: {}, has: {} })
    const model = {
      id: 'a',
      screens: { s1: { id: 's1', name: 'Login', x: 0, y: 0, w: 400, h: 800, children: ['bg', 'brandBg', 'mark', 'icon', 'heading'], props: {}, style: {} } },
      widgets: {
        bg: w('bg', 'Button', 0, 0, 400, 800, 1),
        brandBg: w('brandBg', 'Button', 10, 10, 300, 80, 2),
        mark: w('mark', 'FlexContainer', 20, 20, 64, 64, 3),
        icon: w('icon', 'SVGIcon', 40, 40, 24, 24, 4),
        heading: w('heading', 'Label', 10, 100, 300, 30, 5)
      },
      groups: {
        screen: { id: 'screen', name: 'Screen', children: ['bg', 'heading'], groups: ['brand'] },
        brand: { id: 'brand', name: 'Brand', children: ['brandBg', 'mark', 'icon'], groups: [] }
      },
      templates: {}
    }
    const self = buildTree(model)
    const inTree = new Set()
    const walk = (n) => { inTree.add(n.id); (n.children || []).forEach(walk) }
    self.root.children.forEach(walk)
    expect(Object.keys(model.widgets).filter(id => !inTree.has(id))).toEqual([])
    // selecting does not hang on the parent chain
    self.expandIfNeeded('icon')
  })
})
