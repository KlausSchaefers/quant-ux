import Optics from '../../src/dash/Optics'

test('Test Optics.run() > ', async () => {

    const df = new Optics()
    const details = outlier.getBaseData(df, tests.tasks)
    expect(details.length).toBe(8)
})

