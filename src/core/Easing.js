export function getEasing (name) {
    switch (name) {
        case "linear":
            return function (t) {
                return t
            };

        case "easeInQuad":
            return function (t) {
                return t * t
            };

        case "easeOutQuad":
            return function (t) {
                return t * (2 - t)
            };
            
        case "easeInOutQuad":
            return function (t) {
                return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            };
    
        case "easeElasticIn":
            {
                let tau = 2 * Math.PI;
                let a = 1;
                let p = 0.3;
                let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);
                return function (t) {
                    return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p)
                };
            }

        case "easeElasticOut":
            {
                let tau = 2 * Math.PI;
                let a = 1;
                let p = 0.3;

                let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);
                return function (t) {
                    return 1 - a * Math.pow(2, -10 * (t = +t)) * Math.sin((t + s) / p);
                };
            }

        case "easeBounceIn":
            {
                let b1 = 4 / 11,
                    b2 = 6 / 11,
                    b3 = 8 / 11,
                    b4 = 3 / 4,
                    b5 = 9 / 11,
                    b6 = 10 / 11,
                    b7 = 15 / 16,
                    b8 = 21 / 22,
                    b9 = 63 / 64,
                    b0 = 1 / b1 / b1;
                const bounceOut = function (t) {
                    return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
                }
                return function (t) {
                    return 1 - bounceOut(1 - t);
                };
            }

        case "easeBounceOut":
            {
                let b1 = 4 / 11,
                    b2 = 6 / 11,
                    b3 = 8 / 11,
                    b4 = 3 / 4,
                    b5 = 9 / 11,
                    b6 = 10 / 11,
                    b7 = 15 / 16,
                    b8 = 21 / 22,
                    b9 = 63 / 64,
                    b0 = 1 / b1 / b1;
                return function (t) {
                    return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
                };
            }

        default:
            return function (t) {
                return t
            };
    }
}