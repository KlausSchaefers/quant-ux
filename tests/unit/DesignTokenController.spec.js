import Controller from '../../src/canvas/controller/Controller'
//import PublicModelService from '../../src/services/PublicModelService'
import app from './data/designToken1.json'

test('Test DesignToken CRUD', async () => {

  let controller = new Controller()
  //controller.setModelService(new PublicModelService());
  //controller.setModel(app)

  console.debug('end', controller)
});

