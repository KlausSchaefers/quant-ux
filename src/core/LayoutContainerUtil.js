export function getLayoutContainerChildren(id, model, includeContainer =true) {
  const children = []
  if (includeContainer) {
    children.push(id)
  }
  const cntr = model.widgets[id];    
  for (let id in model.widgets) {
    const w = model.widgets[id];
    // check here also for the selected widgets?
    if (w.z >= cntr.z && w.id !== cntr.id) {
      if (isFullContained(cntr, w)) {
        children.push(id)
      }
    }
  }
  return children
}

export function getLayoutContainerModels(model) {
  const layoutContainers = [];
  const children = {};

  // get all the grid containers
  // we could make this even better by filtering for z-level...
  for (let id in model.widgets) {
    const w = model.widgets[id];
    if (w.type === "GridContainer") {
      const cntr = {
        id: w.id,
        name: w.name,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        z: w.z,
        children: [w.id],
      };
      layoutContainers.push(cntr);
      children[w.id] = cntr;
    }
  }
  layoutContainers.sort((a, b) => a.z - b.z);

  // compute the children in the layoutContainers,
  // so we the grid is not active when the element
  // is over them
  // Maybe use something like RTree (rbush)
  layoutContainers.forEach((cntr) => {
    for (let id in model.widgets) {
      const w = model.widgets[id];
      // check here also for the selected widgets?
      if (w.z >= cntr.z && w.id !== cntr.id) {
        if (isFullContained(cntr, w)) {
          cntr.children.push(w.id);
          children[w.id] = cntr;
        }
      }
    }
  });

  return [layoutContainers, children]
}

export function isLayoutContainer(id, model) {
  if (model.widgets[id] && model.widgets[id].type === "GridContainer") {
    return true; 
  }
  return false;
}

export function isLayoutContainerWidget(widget) {
  if (widget && widget.type === "GridContainer") {
    return true; 
  }
  return false;
}


export function isFullContained(outer, inner) {
  // add here some offset?
  return outer.x <= inner.x && outer.y <= inner.y && outer.x + outer.w >= inner.x + inner.w && outer.y + outer.h >= inner.y + inner.h;
}
