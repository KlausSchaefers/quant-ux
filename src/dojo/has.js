export default function has (key) {

    if (key === 'mobile') {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPad|iPhone|iPod/.test(userAgent) || /android/i.test(userAgent)
    }

    if (key === 'android') {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android/i.test(userAgent)
    }

    if (key === 'touch') {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPad|iPhone|iPod/.test(userAgent) || /android/i.test(userAgent)
    }


    if (key === 'ios') {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPad|iPhone|iPod/.test(userAgent)
    }

    if (key === 'chrome') {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /chrome/i.test(userAgent)
    }

    if (key === 'ff') {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /firefox/i.test(userAgent)
    }

    if (key === 'mac') {
        return navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;
    }
}