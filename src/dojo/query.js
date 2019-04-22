export default function query(str, node) {
    if (!node) {
        node = document
    }
    return node.querySelectorAll(str)
}