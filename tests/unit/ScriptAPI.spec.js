import ScriptAPI from '../../src/core/engines/ScriptAPI'

test('Test ModelUtil.getViewModeStyle() >  No Template', async () => {

    const app = {
        templates: {
            't1': {
                style: {a:1, b:2, c:3},
                hover: {a:11}
            }
        }
    }
    const viewModel = {}
    const api = ScriptAPI(app, viewModel)
})