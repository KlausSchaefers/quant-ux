import * as SVGUtil from '../../src/svg/SVGUtil'

test('Test SVGUtil.splitPathAt() >  ', async () => {
    const path = {
        d:[ 
            [
                { "t": "M", "x": 149, "y": 196 }, 
                { "t": "C", "x": 342, "y": 196, "x1": 217, "y1": 107, "x2": 270, "y2": 103 
              }]
        ] 
    }
    console.debug(SVGUtil.pathToSVG(path.d))

    const path2 = SVGUtil.splitPathAt(path, 0, {x: 242, y: 125}, {x:0, y:2})

    console.debug(SVGUtil.pathToSVG(path2.d))
})