import * as CollabUtil from '../../src/canvas/controller/CollabUtil'
import CollabService from '../../src/canvas/controller/CollabService'


test('Test CollabService ', async () => {
  console.debug('start')

  let cs = new CollabService()

  let oldModel = {
    widgets: {
      'w1': {
        id: 'w1',
        style: {
          'color': 'red'
        }
      },
      'w2': {
        id: 'w2',
        style: {
          'color': 'blue'
        }
      }
    }
  }

  let newModel = {
    widgets: {
      'w1': {
        id: 'w1',
        style: {
          'color': 'green'
        }
      },
      'w2': {
        id: 'w2',
        style: {
          'color': 'blue'
        }
      }
    }
  }

  let changes = CollabUtil.getModelDelta(oldModel, newModel)
  console.debug(changes)

  console.debug('end', cs)
});

