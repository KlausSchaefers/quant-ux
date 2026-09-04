import ModelGeom from '../ModelGeom'

export default class LayoutContainerIndex {

    constructor(model, sourceModel, selectedModel = {}, minZ = 0) {
        this.layoutContainers = []
        this.init(model, sourceModel, selectedModel, minZ)
    }

    init(model, sourceModel, selectedModel, minZ) {
        this.layoutContainers = []

        // make this also work just with ids?
        const excluded = {}
		excluded[selectedModel?.id] = true
		if (selectedModel.ids) {
			for (let id of selectedModel.ids) {
				excluded[id] = true
			}
		}

        // get all the grid containers
        // we could make this even better by filtering for z-level...
        for (let id in model.widgets) {
            const w = model.widgets[id]
            // we just take lowe layer containers
            if (w.z < minZ) {
                const s = sourceModel.widgets[id]
                if (w !== undefined & s !== undefined && w.type === 'GridContainer') {
                    const g = structuredClone(w)
                    // copy source style so we have the real paddings
                    g.style = s.style
                    g.children = []
                    this.layoutContainers.push(g)
                }
            }
        }
        this.layoutContainers.sort((a, b) => a.z - b.z)

        // compute the children in the layoutContainers, 
        // so we the grid is not active when the element
        // is over them
        // Maybe use something like RTree (rbush)
        this.layoutContainers.forEach(cntr => {
            for (let id in model.widgets) {
                const w = model.widgets[id]
                // check here also for the selected widgets?
                if (w.z >= cntr.z && w.id !== cntr.id && !excluded[w.id]) {
                    if (this.isFullContained(cntr, w)) {
                        cntr.children.push(w)
                    }
                }
            }
        })
    }

    isFullContained(outer, inner) {
        // add here some offset?
        return (
            outer.x <= inner.x &&
            outer.y <= inner.y &&
            outer.x + outer.w >= inner.x + inner.w &&
            outer.y + outer.h >= inner.y + inner.h
        )
    }


    findHoverLayoutContainer(absPos) {

        const box = this.getOffSetCorrectedPosition(absPos)

        // find the highest container
        let found = null
        for (let i = 0; i < this.layoutContainers.length; i++) {
            const c = this.layoutContainers[i]
            // we use the partial overlap
            if (c.z < box.z && ModelGeom._isBoxChild(box, c)) {
                found = c
            }
        }
        if (found) {
            if (found.children) {
                // check that we are not in a child
                for (let child of found.children) {
                    if (this.isFullContained(child, box)) {
                        return null
                    }
                }
            }            
        }
        
        return found
    }

    getOffSetCorrectedPosition(pos) {
        const box = {
            x: pos.x,
            y: pos.y,
            w: pos.w,
            h: pos.h,
            z: pos.z,
            id: pos.id,
            name: pos.name
        }
        if (this.boundingBoxOffsetX > 0) {
            box.x -= this.boundingBoxOffsetX;
        }
        if (this.boundingBoxOffsetY > 0) {
            box.y -= this.boundingBoxOffsetY;
        }
        return box
    }
}