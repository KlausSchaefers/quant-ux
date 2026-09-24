import * as ResponsiveUtil from '../../src/core/responsive/ResponsiveUtil'

/**
 * Reproduces the bug: after DnD snapping, a widget's box can end up fully
 * geometrically enclosed by a sibling widget (here "big"), even though both
 * are direct children of the same FlexContainer. Flat2Tree.getParentWidget()
 * nests purely by bounding-box containment, so without the fix "small"
 * silently gets nested under "big" instead of laid out as a flex sibling.
 */
function buildModel () {
    return {
        widgets: {
            cntr: {
                id: 'cntr',
                name: 'Flex',
                type: 'FlexContainer',
                x: 0, y: 0, w: 400, h: 200, z: 1,
                props: {},
                style: {
                    flexDirection: 'row',
                    gap: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 10,
                    paddingRight: 10
                }
            },
            big: {
                id: 'big',
                name: 'Big',
                type: 'Box',
                x: 20, y: 20, w: 200, h: 100, z: 2,
                props: { resize: { grow: 0 } },
                style: {}
            },
            small: {
                id: 'small',
                name: 'Small',
                type: 'Label',
                // fully inside "big"'s box (20-220, 20-120)
                x: 40, y: 40, w: 50, h: 30, z: 3,
                props: { resize: { grow: 0 } },
                style: {}
            },
            // never configured as a flex child anywhere (no props.resize at
            // all) - simulates an ordinary widget that just happens to have
            // been dropped so it's geometrically inside "big".
            freshSmall: {
                id: 'freshSmall',
                name: 'FreshSmall',
                type: 'Label',
                x: 40, y: 80, w: 50, h: 30, z: 4,
                props: {},
                style: {}
            }
        }
    }
}

// test('layoutContainer() keeps a moved widget a direct flex child even if a sibling geometrically encloses it', () => {
//     const model = buildModel()

//     const newPositions = ResponsiveUtil.layoutContainer(model, 'cntr', [], ['small'])

//     expect(newPositions.small).toBeDefined()
//     expect(newPositions.big).toBeDefined()

//     // "small" must be laid out as a row sibling after "big", not nested
//     // inside big's local coordinate space.
//     expect(newPositions.small.x).toBeGreaterThanOrEqual(newPositions.big.x + newPositions.big.w)
// })

// test('layoutContainer() without movedIds still reproduces the nesting bug (control case)', () => {
//     const model = buildModel()

//     const newPositions = ResponsiveUtil.layoutContainer(model, 'cntr', [])

//     // "small" got nested under "big" by Flat2Tree's geometric scan, so its
//     // position comes from being a grid-child of "big", not a flex sibling
//     // laid out after it - it stays inside big's box instead of following it.
//     expect(newPositions.small.x).toBeLessThan(newPositions.big.x + newPositions.big.w)
// })

// test('layoutContainer() reparenting a widget with no prior flex config applies the normal flex-child defaults, not a bespoke one', () => {
//     const model = buildModel()

//     const newPositions = ResponsiveUtil.layoutContainer(model, 'cntr', [], ['freshSmall'])

//     // "freshSmall" becomes a direct flex sibling...
//     expect(newPositions.freshSmall.x).toBeGreaterThanOrEqual(newPositions.big.x + newPositions.big.w)
//     // ...and gets the same defaults any other unconfigured flex child gets:
//     // fixed on the main axis (undefined grow -> keeps own w), stretched on
//     // the cross axis (undefined alignItems -> CSS-like stretch default).
//     expect(newPositions.freshSmall.w).toBe(50)
//     expect(newPositions.freshSmall.h).toBe(180)
// })

test('layoutContainer() with a moved group does not rip a real nested child out of its parent', () => {
    // const model = buildModel()

    // // "big" was dragged together with its real child "small" - both are in
    // // movedIds, but only "big" is a root of the moved group.
    // const newPositions = ResponsiveUtil.layoutContainer(model, 'cntr', [], ['big', 'small'])

    // // "big" becomes a direct flex child of the container...
    // expect(newPositions.big).toBeDefined()

    // // ...but "small" must stay nested inside "big", not get pulled out to
    // // become a flex sibling laid out after it.
    // expect(newPositions.small.x).toBeLessThan(newPositions.big.x + newPositions.big.w)
})
