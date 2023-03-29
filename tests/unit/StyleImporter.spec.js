import * as StyleImporter from '../../src/core/ai/StyleImporter'
import app from './data/styleImporter.json'

test('Test StyleImporter.getCustomStyleCounts() >  ', async () => {

    const result = StyleImporter.getCustomStyleCounts(app, 2)
    expect(result.Screen.background[0]).toBe('#58e6ff')
    expect(result.Screen.background[1]).toBe('#57fba1')

    expect(result.Button.background[0]).toBe('#e3de2d')
    expect(result.Button.background[1]).toBe('#333333')
    expect(result.Button.color[0]).toBe('rgb(0, 0, 0)')
    expect(result.Button.color[1]).toBe('#ffffff')

    expect(result.Button.borderTopColor[0]).toBe('#333333')
    expect(result.Button.borderTopColor.length).toBe(1)
   
    //console.debug(result)
})

test('Test StyleImporter.getCustomStyle) >  ', async () => {

    const result = StyleImporter.getCustomStyle(app, 2)
    expect(result.Screen.background).toBe('#58e6ff')


    expect(result.Button.background).toBe('#e3de2d')
    expect(result.Button.color).toBe('rgb(0, 0, 0)')

   
   
   console.debug(result)
})

test('Test StyleImporter.getButtons() >  ', async () => {

    const result = StyleImporter.getButtons(app)
    expect(result.length).toBeGreaterThan(5)
   
})