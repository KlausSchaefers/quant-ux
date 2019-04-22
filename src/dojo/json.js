class json {
    stringify (s) {
        return JSON.stringify(s)
    }

    parse (s) {
        return JSON.parse(s)
    }
}
export default new json()