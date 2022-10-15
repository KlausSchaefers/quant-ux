class CopyTool {

    constructor () {
        this.copies = null
    }

    copy (pos, value) {
        localStorage.setItem('quxSVGCopy', JSON.stringify({
            pos: pos,
            value: value
        }))
    }

    paste () {
        const json = localStorage.getItem('quxSVGCopy')
        if (json) {
            try {
                return JSON.parse(json)
            } catch (err) {
                console.warn('CopyTool.paste() > could not parse JSON', json)
            }
        }
    }

    getUniquePathName (paths, name) {
        const names = {}
        paths.forEach(p => {
          names[p.name] = p.id
        })
        return this.getUniqueName(name, names)
    }

    getUniqueName  (name, names) {
        const er = /^-?[0-9]+$/;
		if (!names[name]){
			return name;
		}
		let pos = name.lastIndexOf(" ");
		if (pos > 0) {
			const end = name.substring(pos+1);
			const isInt =  er.test(end);
			if (isInt){
				name = name.substring(0, pos);
			}
		}
		if (!names[name]){
			return name;
		}
		let count = 1;
		let newName = name;
		while (names[newName] && count < 1000) {
			newName = name + " " + count;
			count++;
		}
		return newName;
	}
}

export default new CopyTool()