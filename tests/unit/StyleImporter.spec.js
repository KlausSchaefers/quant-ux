import * as StyleImporter from '../../src/core/ai/StyleImporter'
import app from './data/styleImporter.json'

test('Test SnappUtil.getMinLine() >  ', async () => {

    const result = StyleImporter.getCustomStyles(app)
    console.debug(result)
   
})