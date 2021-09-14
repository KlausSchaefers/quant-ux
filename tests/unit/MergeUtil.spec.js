import * as MergeUtil from '../../src/canvas/controller/MergeUtil'

test('Test MergeUtil - Add Remove Array ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      },
      children: ['a', 'b']
    }

  let b = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'green',
        'background': 'white'
      },
      children: ['b', 'c'] // added c, removed a
  }


  let delta = MergeUtil.getDelta(a, b)
  expect(delta.style.color).toBe('green')
  expect(delta.children.value.length).toBe(2)
  expect(delta.children.added.length).toBe(1)
  expect(delta.children.added[0]).toBe('c')
  expect(delta.children.removed.length).toBe(1)
  expect(delta.children.removed[0]).toBe('a')


  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.style.color).toBe('green')
  expect(merged.children.length).toBe(2)
  expect(merged.children[0]).toBe('b')
  expect(merged.children[1]).toBe('c')
})


test('Test MergeUtil - Add Array ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      },
      children: ['a', 'b']
    }

  let b = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'green',
        'background': 'white'
      },
      children: ['a', 'b', 'c']  // added c
  }


  let delta = MergeUtil.getDelta(a, b)
  expect(delta.style.color).toBe('green')
  expect(delta.children.value.length).toBe(3)
  expect(delta.children.added.length).toBe(1)
  expect(delta.children.added[0]).toBe('c')
  expect(delta.children.removed.length).toBe(0)


  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.children.length).toBe(3)
  expect(merged.children[0]).toBe('a')
  expect(merged.children[1]).toBe('b')
  expect(merged.children[2]).toBe('c')
})


test('Test MergeUtil - Remove Array ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      },
      children: ['a', 'b']
    }

  let b = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'green',
        'background': 'white'
      },
      children: ['a']  // remove b
  }


  let delta = MergeUtil.getDelta(a, b)
  expect(delta.style.color).toBe('green')
  expect(delta.children.value.length).toBe(1)
  expect(delta.children.added.length).toBe(0)
  expect(delta.children.removed.length).toBe(1)
  expect(delta.children.removed[0]).toBe('b')


  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.children.length).toBe(1)
  expect(merged.children[0]).toBe('a')

})

test('Test MergeUtil - Nested Prim Array ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      },
      a: {
        children: ['a', 'b']
      }
    }

  let b = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'green',
        'background': 'white'
      },
      a: {
        children: ['a', 'c']
      }
  }

  /**
   * Make sure for arrays of objects we do not send a delta
   */
  let delta = MergeUtil.getDelta(a, b)
  expect(delta.style.color).toBe('green')
  expect(delta.a.children.removed.length).toBe(1)
  expect(delta.a.children.removed[0]).toBe('b')
  expect(delta.a.children.added.length).toBe(1)
  expect(delta.a.children.added[0]).toBe('c')


  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.a.children.length).toBe(2)
  expect(merged.a.children[0]).toBe('a')
  expect(merged.a.children[1]).toBe('c')

})


test('Test MergeUtil - Object Array ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      },
      fonts: [
        {url: '1'}, {url:'2'}
      ]
    }

  let b = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'green',
        'background': 'white'
      },
      fonts: [
        {url: '1'}, {url:'2'}, {url:'3'}
      ]
  }

  /**
   * Make sure for arrays of objects we do not send a delta
   */
  let delta = MergeUtil.getDelta(a, b)
  expect(delta.style.color).toBe('green')
  expect(delta.fonts.value).toBeUndefined()
  expect(delta.fonts.removed).toBeUndefined()
  expect(delta.fonts.added).toBeUndefined()
  expect(delta.fonts.length).toBe(3)


  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.fonts.length).toBe(3)
  expect(merged.fonts[0].url).toBe('1')
  expect(merged.fonts[1].url).toBe('2')
  expect(merged.fonts[2].url).toBe('3')
})


test('Test MergeUtil - Inc ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      lastUUID: 1
    }

  let b = {
    id: 'w1',
    x:1,
    y:2,
    lastUUID: 6
  }

  /**
   * Make sure for arrays of objects we do not send a delta
   */
  let delta = MergeUtil.getDelta(a, b, {'lastUUID': 'inc'})
  expect(delta.lastUUID.inc).toBe(5)
  expect(delta.y).toBe(2)


  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.lastUUID).toBe(6)
  expect(merged.y).toBe(2)
  expect(merged.x).toBe(1)
})


test('Test MergeUtil - Null ', async () => {


  let a = {
      id: 'w1',
      x:1,
      y:1,
      style: {
        color: 'red',
        border: 'pink'
      },
      hover: {
        color: 'red',
        backgroundImage: 'abc.png'
      }
    }

  let b = {
    id: 'w1',
    x:1,
    y:1,
    style: { // this one should be empty
    },
    hover: {
      color: 'red',
      backgroundImage: null // this one should be still null
    }
  }

  /**
   * Make sure for arrays of objects we do not send a delta
   */
  let delta = MergeUtil.getDelta(a, b, {'lastUUID': 'inc'})

  let merged = MergeUtil.applyDelta(a, delta)
  expect(merged.style.color).toBeUndefined()
  expect(merged.style.border).toBeUndefined()
  expect(merged.hover.color).toBe('red')
  expect(merged.hover.backgroundImage).toBeNull()

})