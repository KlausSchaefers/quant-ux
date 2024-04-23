import ModelUtil from '../../src/core/ModelUtil'
import alignmentBug from './data/alignmentBug.json'

test('Test ModelUtil2.explodeGroupSelection() >  ', async () => {
    const result = ModelUtil.explodeGroupSelection(alignmentBug, ['g10020_48808'])
    expect(result.length).toBe(4)
    expect(result).toContain('w10010_88477')
    expect(result).toContain('w10014_27520')
    expect(result).toContain('w10015_10883')
    expect(result).toContain('w10016_51925')
})


test('Test ModelUtil2.explodeGroupSelection() >  ', async () => {

    const result = ModelUtil.explodeGroupSelection(alignmentBug, ['g10020_48808', 'g10019_13136'])
    
    expect(result.length).toBe(7)
    expect(result).toContain('w10010_88477')
    expect(result).toContain('w10014_27520')
    expect(result).toContain('w10015_10883')
    expect(result).toContain('w10016_51925')

    expect(result).toContain('w10011_49270')
    expect(result).toContain('w10017_23374')
    expect(result).toContain('w10018_20189')
    
})

test('Test ModelUtil2.explodeGroupSelection() >  ', async () => {

    const result = ModelUtil.explodeGroupSelection(alignmentBug, ['g10020_48808', 'w10011_49270'])

    expect(result.length).toBe(5)
    expect(result).toContain('w10010_88477')
    expect(result).toContain('w10014_27520')
    expect(result).toContain('w10015_10883')
    expect(result).toContain('w10016_51925')

    expect(result).toContain('w10011_49270')
    
})

