import * as CollabUtil from '../../src/canvas/controller/CollabUtil'
import CollabService from '../../src/canvas/controller/CollabService'

test('Test CollabService.update() ', async () => {

  let cs = new CollabService('app1')
  let cs2 = new CollabService('app1')

  let oldModel = {
    id: 'app1',
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
    },
    lastUpdate: 1,
    lastUUID: 1
  }

  let newModel = {
    id: 'app1',
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
          'color': '****', // CHANGED
          'background': 'white'
        }
      }
    },
    screens: {
      's1' :{
        id: 's1',
        children: ['w1', 'w2']
      }
    },
    lastUpdate: 2,
    lastUUID: 1
  }

  let changes = CollabUtil.getModelDelta(oldModel, newModel)
  let event = cs.createEvent(changes)
  expect(changes.length).toBe(2)

  /**
   * event should be ignored, because it wa already applied
   */
  let notMerged = cs.applyEvent(oldModel, event)
  expect(notMerged).not.toBeUndefined()
  expect(notMerged.widgets.w2.style.color).toBe('blue')

  /**
   * In fresh service, event should be merged
   */
  let merged = cs2.applyEvent(oldModel, event)
  expect(merged).not.toBeUndefined()
  expect(merged.widgets.w2.style.color).toBe('****')
  expect(merged.lastUpdate).toBe(2)

});


test('Test CollabService.add() ', async () => {

  let cs = new CollabService('app1')
  let cs2 = new CollabService('app1')

  let oldModel = {
    id: 'app1',
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
    },
    lastUpdate: 1,
    lastUUID: 1
  }

  let newModel = {
    id: 'app1',
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
      'w3': {
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
        children: ['w1', 'w2', 'w3']
      }
    },
    lastUpdate: 3,
    lastUUID: 2
  }

  let changes = CollabUtil.getModelDelta(oldModel, newModel)
  let event = cs.createEvent(changes)
  expect(changes.length).toBe(4)


  /**
   * In fresh service, event should be merged
   */
  let merged = cs2.applyEvent(oldModel, event)
  expect(merged).not.toBeUndefined()
  expect(merged.widgets.w2.style.color).toBe('blue')
  expect(merged.widgets.w3.style.color).toBe('black')
  expect(merged.screens.s1.children.length).toBe(3)
  expect(merged.screens.s1.children[0]).toBe('w1')
  expect(merged.screens.s1.children[1]).toBe('w2')
  expect(merged.screens.s1.children[2]).toBe('w3')
  expect(merged.lastUpdate).toBe(3)
  expect(merged.lastUUID).toBe(2)
});


test('Test CollabService.delete() ', async () => {

  let cs = new CollabService('app1')
  let cs2 = new CollabService('app1')

  let oldModel = {
    id: 'app1',
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
    },
    lastUpdate: 1,
    lastUUID: 1
  }

  let newModel = {
    id: 'app1',
    widgets: {
      'w1': {
        id: 'w1',
        x:1,
        y:1,
        style: {
          'color': 'red',
          'background': 'white'
        }
      }
    },
    screens: {
      's1' :{
        id: 's1',
        children: ['w1']
      }
    },
    lastUpdate: 3,
    lastUUID: 6
  }

  let changes = CollabUtil.getModelDelta(oldModel, newModel)
  expect(changes.length).toBe(4)

  let event = cs.createEvent(changes)
  expect(event.changes.length).toBe(4)

  /**
   * Maker sure we have an inc on lastUUID
   */
  let lastUUIDChange = event.changes.find(c => c.id === 'lastUUID')
  expect(lastUUIDChange.value.inc).toBe(5)

  /**
   * In fresh service, event should be merged
   */
  let merged = cs2.applyEvent(oldModel, event)
  expect(merged).not.toBeUndefined()
  expect(merged.widgets.w2).toBeUndefined()
  expect(merged.screens.s1.children.length).toBe(1)
  expect(merged.screens.s1.children[0]).toBe('w1')
  expect(merged.lastUpdate).toBe(3)
  expect(merged.lastUUID).toBe(6)
});