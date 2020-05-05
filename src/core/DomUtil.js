class DomUtils {

  removeAllChildNodes(node) {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  }
}

export default new DomUtils()