import showdown from 'showdown';

class MDUtil {

    constructor () {
        // https://github.com/showdownjs/showdown?tab=readme-ov-file
        const converter = new showdown.Converter();
        converter.setOption('tables', true);
        converter.setOption('underline', true);
        converter.setOption('simpleLineBreaks', true);
        converter.setOption('smoothLivePreview', true);
        this.converter = converter
    }

    makeHtml(txt) {
        return this.converter.makeHtml(txt);
    }
}

export default new MDUtil()