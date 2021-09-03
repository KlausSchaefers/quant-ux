import * as CollabUtil from '../../src/canvas/controller/CollabUtil'

test('Test CollabUtil.getMiniChange() ', async () => {

  let change = {
    name: 'w1',
    type: 'update',
    parent: 'widgets',
    object: {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      }
    },
    oldValue: {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'green',
        'background': 'white'
      }
    }
  }

  let minichange = CollabUtil.getMiniChange(change)
  expect(minichange.parent).toBe('widgets')
  expect(minichange.id).toBe('w1')
  expect(minichange.type).toBe('update')
  expect(minichange.value.style.color).toBe('red')
  expect(minichange.value.style.background).toBeUndefined()
  expect(minichange.value.x).toBeUndefined()
  expect(minichange.value.y).toBeUndefined()
  expect(minichange.value.id).toBeUndefined()


  change = {
    name: 'w1',
    type: 'update',
    parent: 'widgets',
    object: {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'white'
      }
    },
    oldValue: {
      id: 'w1',
      x:2,
      y:1,
      style: {
        'color': 'green',
        'background': 'black'
      }
    }
  }

  let minichange2 = CollabUtil.getMiniChange(change)
  expect(minichange2.parent).toBe('widgets')
  expect(minichange2.id).toBe('w1')
  expect(minichange2.type).toBe('update')
  expect(minichange2.value.style.color).toBe('red')
  expect(minichange2.value.style.background).toBe('white')
  expect(minichange2.value.x).toBe(1)
  expect(minichange2.value.y).toBeUndefined()
  expect(minichange2.value.id).toBeUndefined()


  change = {
    name: 'w1',
    type: 'update',
    parent: 'widgets',
    object: {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red'
      }
    },
    oldValue: {
      id: 'w1',
      x:2,
      y:1,
      style: {
        'color': 'green',
        'background': 'black'
      }
    }
  }

  let minichange3 = CollabUtil.getMiniChange(change)
  expect(minichange3.value.style.color).toBe('red')
  expect(minichange3.value.style.background).toBe(null)
  expect(minichange3.value.x).toBe(1)
  expect(minichange3.value.y).toBeUndefined()
  expect(minichange3.value.id).toBeUndefined()


  change = {
    name: 'w1',
    type: 'add',
    parent: 'widgets',
    object: {
      id: 'w1',
      x:1,
      y:1,
      style: {
        'color': 'red',
        'background': 'yellow'
      }
    }
  }

  /**
   *  we should have full change
   */
  let minichange4 = CollabUtil.getMiniChange(change)
  expect(minichange4.value.style.color).toBe('red')
  expect(minichange4.value.style.background).toBe('yellow')
  expect(minichange4.value.x).toBe(1)
  expect(minichange4.value.y).toBe(1)
  expect(minichange4.value.id).toBe('w1')


})

test('Test CollabUtil.getMiniChanges() ', async () => {

  let oldModel = {
    widgets: {
      'w1': {
        id: 'w1',
        x:1,
        y:1,
        style: {
          'color': 'red',
          'background': 'white'
        }
      },
      'w2': {
        id: 'w2',
        x:2,
        y:2,
        style: {
          'color': 'blue',
          'background': 'white'
        }
      }
    },
    screens: {
      's1' :{
        id: 's1',
        children: ['w1', 'w2']
      }
    }
  }

  let newModel = {
    widgets: {
      'w1': {
        id: 'w1',
        x:1,
        y:1,
        style: {
          'color': 'red',
          'background': 'white'
        }
      },
      'w2': {
        id: 'w2',
        x:2,
        y:2,
        style: {
          'color': 'green',
          'background': 'white'
        }
      }
    },
    screens: {
      's1' :{
        id: 's1',
        children: ['w1', 'w2']
      }
    }
  }

  let changes = CollabUtil.getModelDelta(oldModel, newModel)
  let minichanges = CollabUtil.getMiniChanges(changes)
  expect(minichanges.length).toBe(1)
  expect(minichanges[0].id).toBe('w2')
  expect(minichanges[0].value.style.color).toBe('green')
  expect(minichanges[0].value.style.background).toBeUndefined()


});


test('Test CollabUtil.getMiniChanges() ', async () => {

  let oldModel = {
    widgets: {
      'w1': {
        id: 'w1',
        x:1,
        y:1,
        style: {
          'color': 'red',
          'background': 'white'
        }
      },
      'w2': {
        id: 'w2',
        x:2,
        y:2,
        style: {
          'color': 'blue',
          'background': 'white'
        }
      }
    },
    screens: {
      's1' :{
        id: 's1',
        children: ['w1', 'w2']
      }
    }
  }

  let newModel = {
    widgets: {
      'w1': {
        id: 'w1',
        x:1,
        y:1,
        style: {
          'color': 'red',
          'background': 'white'
        }
      },
      'w2': {
        id: 'w2',
        x:2,
        y:2,
        style: {
          'color': 'blue',
          'background': 'white'
        }
      },
      'w3': { // add
        id: 'w3',
        x:2,
        y:2,
        style: {
          'color': 'black',
          'background': 'white'
        }
      }
    },
    screens: {
      's1' :{
        id: 's1',
        start:true,
        children: ['w1', 'w2', 'w3']  // update
      }
    }
  }

  let changes = CollabUtil.getModelDelta(oldModel, newModel)
  let minichanges = CollabUtil.getMiniChanges(changes)
  expect(minichanges.length).toBe(2)
  expect(minichanges[0].id).toBe('w3')
  expect(minichanges[1].id).toBe('s1')
  expect(minichanges[1].value.start).toBe(true)
  expect(minichanges[1].value.children.value.length).toBe(3)
  expect(minichanges[1].value.children.added.length).toBe(1)
  expect(minichanges[1].value.children.added[0]).toBe('w3')
  expect(minichanges[1].value.children.removed.length).toBe(0)

});

