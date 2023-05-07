export function l2 (p, q) {
    let sum = 0;
    let i = Math.min(p.length, q.length);
    while (i--) {
        sum += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return Math.sqrt(sum);
}

export function l2Squared (p, q) {
    let sum = 0;
    let i = Math.min(p.length, q.length);
    while (i--) {
        sum += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return sum;
}