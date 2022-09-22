import QRCode from 'qrcode'
import Logger from 'common/Logger'

class QR  {

    constructor () {
        this.logger = new Logger("QR");
    }

    getQRCode (hash, log, live, ln) {
        const base = location.protocol + "//" + location.host;
        let url = base + "/#/simulate.html?&h=" + hash + "&log=" + log +"&qr=true&live=" + live
        if (ln) {
            url += '&ln=' + ln
        }
        this.logger.log(-1, 'gerQRCode', `generate >> ${url}`)
        return QRCode.toDataURL(url)
    }

}
export default new QR()