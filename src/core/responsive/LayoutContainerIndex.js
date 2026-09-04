import Logger from '../Logger'
import ModelGeom from '../ModelGeom'

export default class LayoutContainerIndex {

    constructor(model, sourceModel, types = new Set(['GridContainer', 'FlexContainer']), selectedModel = {}, maxZ = -1) {
        Logger.log(2, "LayoutContainerIndex.constrcutor() ", maxZ, types)
        this.layoutContainers = []
        this.init(model, selectedModel, maxZ, types)
    }

    init(model, selectedModel, maxZ, filterTypes) {
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
            if (w.z < maxZ || maxZ < 0) {
               
                
                if (w !== undefined && filterTypes.has(w.type)) {      
                    const g = structuredClone(w)               
                    // copy source style so we have the real paddings
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


    findHoverLayoutContainer(absPos, boundingBoxOffsetX=0, boundingBoxOffsetY=0) {
        const box = this.getOffSetCorrectedPosition(absPos, boundingBoxOffsetX, boundingBoxOffsetY)

        // find the highest container. can we just search by zlevel and take the first one
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

    findContainedLayoutContainer(absPos, boundingBoxOffsetX=0, boundingBoxOffsetY=0) {
        const box = this.getOffSetCorrectedPosition(absPos, boundingBoxOffsetX, boundingBoxOffsetY)

        // find the highest container. can we just search by zlevel and take the first one
        let found = null
        for (let i = 0; i < this.layoutContainers.length; i++) {
            const c = this.layoutContainers[i] 
            console.debug(this.isFullContained(box, c))
            if (c.z < box.z && this.isFullContained(box, c)) {
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

    getOffSetCorrectedPosition(pos, boundingBoxOffsetX, boundingBoxOffsetY) {
        const box = {
            x: pos.x,
            y: pos.y,
            w: pos.w,
            h: pos.h,
            z: pos.z,
            id: pos.id,
            name: pos.name
        }
        if (boundingBoxOffsetX > 0) {
            box.x -= boundingBoxOffsetX;
        }
        if (boundingBoxOffsetY > 0) {
            box.y -= boundingBoxOffsetY;
        }
        return box
    }
}