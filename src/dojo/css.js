class css {

    toggle (node, cls) {
        if (node && node.toLowerCase) {
            node = document.getElementById(node)
        }
        if (node) {
            if (this.contains(node, cls)) {
                this.remove(node, cls)
            } else {
                this.add(node, cls)
            }
        }
    }

    add (node, cls) {
        if (cls === undefined || cls === null) {
            return
        }
        if (node && node.toLowerCase) {
            node = document.getElementById(node)
          }
          if (node) {
              cls = cls.trim()
              let classes = node.className.split(' ')
              if (classes.indexOf(cls) < 0) {
                classes.push(cls)
              }
              node.className = classes.join(' ')
          }
    }

    contains (node, cls) {
        /** SVG nodes have no string... */
        if (node.className && node.className.split) {
            let classes = node.className.split(' ')
            return classes.indexOf(cls) >= 0
        }
        return false
    }

    remove (node, cls) {
        if (cls === undefined || cls === null) {
            return
        }
        if (node && node.toLowerCase) {
            node = document.getElementById(node)
        }
        if (node) {
            let remove = cls.split(' ')
            let classes = node.className.split(' ')
            let result = classes.filter(c => remove.indexOf(c) < 0)
            node.className = result.join(' ')
        }
    }
}
export default new css()