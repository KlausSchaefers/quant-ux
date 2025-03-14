import app from './data/simSimpleForm.json'
import * as Flat2Tree from '../../src/core/responsive/Flat2Tree'
import Config from '../../src/core/responsive/Config'
import AISimService from '../../src/services/AiSimService';


test('Test AISimService.convertAppToText() > simpleApp', async () => {

    const conf = Config.getDefault()
    const treeModel = Flat2Tree.transform(app, conf)

    const service = new AISimService()
    const result = service.convertAppToText(treeModel, 's10000_29014')
    console.log(result)
});

