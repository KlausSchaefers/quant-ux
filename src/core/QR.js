import QRCode from 'qrcode'
import Logger from 'common/Logger'

class QR  {

    constructor () {
        this.logger = new Logger("QR");
    }

    getQRCode (hash, log, live) {
        var base = location.protocol + "//" + location.host;
        let url = base + "/#/simulate.html?&h=" + hash + "&log=" + log +"&qr=true&live=" + live
        this.logger.log(0, 'gerQRCode', `generate >> ${url}`)
        return QRCode.toDataURL(url)
    }

}
export default new QR()