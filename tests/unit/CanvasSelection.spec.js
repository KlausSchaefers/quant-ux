import CanvasSelection from '../../src/canvas/CanvasSelection'
import model from './data/selectionCanvas.json'

test('CanvasSelection.setSelectedScreens() > ', async () => {

    const selection = new CanvasSelection()
    selection.setSelectedScreens(model, ['s10067_76213'], false)
    expect(selection.screens.length).toBe(1)

    selection.reset()
    selection.setSelectedScreens(model, ['s10000_36844'], false)
    expect(selection.screens.length).toBe(1)

    // expand
    selection.reset()
    selection.setSelectedScreens(model, ['s10000_36844'], false)
    selection.reset()
    selection.setSelectedScreens(model, ['s10067_76213'], true)
    expect(selection.screens.length).toBe(2)

    // unselect
    selection.reset()
    selection.setSelectedScreens(model, ['s10067_76213'], true)
    expect(selection.screens.length).toBe(1)
    expect(selection.screens[0].id).toBe('s10000_36844')

 
    selection.print()
});

