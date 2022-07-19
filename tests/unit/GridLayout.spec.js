import GridLayout from '../../src/core/layout/GridLayout'
import app from './data/gridApp1.json'


test('Test GridLayout', async () => {

  const model = JSON.parse(JSON.stringify(app))

  const g = new GridLayout(["w10001_60025", "w10004_9803", "w10009_12669", "w10011_16753", "w10016_34814", "w10021_30886", "w10024_99870"], model)
  const tree = g.tree
  console.log(printTree(tree))
  expect(tree.children.length).toBe(1)
  expect(tree.children[0].children.length).toBe(3)
  
  let positions = g.resize({w: 900, h:200})
  //expect(positions).not.toBeUndefined()
 
});

function printTree (tree, fct = false) {
  let res = []
  printElement(res, tree, '', fct)
  if (screen.fixedChildren && screen.fixedChildren.length > 0) {
      res.push('--------------')
      screen.fixedChildren.forEach(c => {
          printElement(res, c, '*  ', fct)
      })
  }
  return res.join('\n')
}

function printElement(res, e, space='', fct) {
  let l = e.layout ? e.layout.type : '?'
  res.push(`${space}${e.name} - (${l})`)
  if (e.children) {
      e.children.forEach(c => {
          printElement(res, c, space + '  ', fct)
      });
  }
}

