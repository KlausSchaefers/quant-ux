import AbstractService from './AbstractService'
import Logger from '../common/Logger'

class NotificationService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('UserService')
        this.rules = this.initRules()
    }

    setUser (user) {
        this.user = user
    }

    async getNotications () {
        const notifications = await this._get('/rest/notifications.json')
        const user = await this._get('/rest/user/' + this.user.id + '.json')
        this.addUserJourneyNotifications(notifications, user)
        notifications.forEach(n => {
            if (n.lastUpdate > user.lastNotification) {
                n.isNew = true
            }
        })
        return notifications
    }

    addUserJourneyNotifications (notifications, user) {

        let isDirty = false
        if (!user.notifications) {
            user.notifications = {}
            isDirty = true
        }
        this.logger.log(-1, 'addUserJourneyNotifications', 'Seen notifications:', user.notifications )
        let addCount = 0
        this.rules.forEach(rule => {
            if (user.notifications[rule.id]) {
                this.logger.log(-1, 'addUserJourneyNotifications', 'Add OLD:', rule.id)
                notifications.push({
                    id: rule.id,
                    type: 'UserJourney',
                    title: rule.title,
                    more: rule.more,
                    video: rule.video,
                    lastUpdate: user.notifications[rule.id]
                })
            } else if (rule.matches(user)) {
                if (addCount < 1) {
                    this.logger.log(-1, 'addUserJourneyNotifications', 'Add NEW:', rule.id)
                    const lastUpdate = new Date().getTime()
                    notifications.push({
                        id: rule.id,
                        type: 'UserJourney',
                        title: rule.title,
                        more: rule.more,
                        video: rule.video,
                        lastUpdate: lastUpdate
                    })
                    user.notifications[rule.id] = lastUpdate
                    isDirty = true
                    addCount++
                }
            }
        })

        if (isDirty) {
            this.newNotifcations = user.notifications
        }
     
    }

    flush() {
        if (this.newNotifcations) {
            this.logger.log(-1, 'flush', 'enter')
            this._post('rest/user/' + this.user.id + ".json", {
                notifications: this.newNotifcations
            })
        }
    }

    reset () {
        this.logger.warn('reset', 'enter')
        this._post('rest/user/' + this.user.id + ".json", {
            notifications: {}
        })
    }

    setLastNotication () {
        this.flush()
        return this._post('/rest/user/notification/last.json')
    }

    getLastNotication () {
        return this._get('/rest/user/notification/last.json')
    }

    initRules () {
        return [
            {
                matches () {
                    return true
                },
                id:"WelcomeToDev",
                more: `
                    Welcome to the <b>new</b> beta version of Quant-UX. 
                    We are working hard to finish the new release. You can
                    help us by trying the new version. If you spot any bugs,
                    please reach out to us.
                `,
                title: 'Quant-UX 5!'
            },
            {
                matches () {
                    return true
                },
                id:"GiveUsAStar",
                more: `
                    If you like Quant-UX and you have an GitHub account, it would be 
                    great if you could give us a <b>STAR</b>. Here is the link to our
                    project: <a href="https://github.com/KlausSchaefers/quant-ux" target="github">Quant-UX</a>
                `,
                title: 'Give us a star at GitHub'
            },
            {
                matches () {
                    return true
                },
                id:"Discord",
                more: `
                    Did you know that we have a <a href="https://discord.gg/TQBpfAAKmU" target="github">Discord</a>
                    channel? You can reach us also there.
                `,
                title: 'Chat with us on Discord'
            },
            {
                matches () {
                    return true
                },
                id:"Youtube",
                more: `
                    Did you know that we have a <a href="https://www.youtube.com/@quant-ux8332" target="github">YouTube</a>
                    channel? You can find there a lot of tutorials. If you like the content, subscribe to 
                    the channel to not miss our on new content.
                `,
                title: 'YouTube'
            },
            {
                matches () {
                    return true
                },
                id:"ProfilePic",
                more: `
                    You can upload a profile picture in your 
                    <a href="#/my-account.html" target="account">Account Settings</a>.
                   
                `,
                title: 'Add a profile picture'
            }
            
        ]
    }

   
}
export default new NotificationService()