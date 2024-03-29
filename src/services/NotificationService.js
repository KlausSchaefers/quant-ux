import AbstractService from './AbstractService'
import Logger from '../common/Logger'

function getDays (user) {
    const now = new Date().getTime()
    const created = user.created ? user.created : 0
    const age = now - created
    const days = age / 86400000
    return Math.floor(days)
}

function getDaysSinceLastNotification (user) {
    const now = new Date().getTime()
    const lastNotification = user.lastNotification ? user.lastNotification : now
    const age = now -lastNotification
    const days = age / 86400000
    return Math.floor(days)
}

class NotificationService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('NotificationService')
        this.rules = this.initRules()
        this.day = 86400000
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
  
        let addCount = 0
        const maxAdd = getDaysSinceLastNotification(user) > 1 ? 1 : 0
        this.logger.log(-1, 'addUserJourneyNotifications', `> days since last ${getDaysSinceLastNotification(user)} > maxAdd: ${maxAdd} > Seen notifications:`, user.notifications )
        this.rules.forEach(rule => {
            if (user.notifications[rule.id]) {
                this.logger.log(-1, 'addUserJourneyNotifications', 'Add OLD:', rule.id)
                notifications.push({
                    id: rule.id,
                    type: 'UserJourney',
                    title: rule.title,
                    more: rule.more,
                    video: rule.video,
                    details: rule.details,
                    lastUpdate: user.notifications[rule.id]
                })
            } else if (rule.matches(user)) {
                if (addCount < maxAdd) {
                    this.logger.log(-1, 'addUserJourneyNotifications', 'Add NEW:', rule.id)
                    const lastUpdate = new Date().getTime()
                    notifications.push({
                        id: rule.id,
                        type: 'UserJourney',
                        title: rule.title,
                        more: rule.more,
                        video: rule.video,
                        details: rule.details,
                        lastUpdate: lastUpdate
                    })
                    user.notifications[rule.id] = lastUpdate
                    isDirty = true
                    addCount++
                } else {
                    this.logger.log(-1, 'addUserJourneyNotifications', 'Ignored:', rule.id)
                }
            } else {
                this.logger.log(-1, 'addUserJourneyNotifications', 'No match:', rule.id)
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
                    Welcome at the cutting-edge beta edition of Quant-UX!
                    We are working hard to finish the new release. You can
                    help us by trying out the new version. If you spot any bugs,
                    or have ideas for improvements, please reach out to us via the
                    "Contact" button or our <a href="https://discord.gg/TQBpfAAKmU" target="github">Discord</a> 
                    channel.
                `,
                Xdetails: {
                    title: "What is new in Quant-UX 5",
                    body: `
                      <ul>
                        <li>
                            <b>Project Overview</b>: After you login, you will not see a list of thumbnails. Instead 
                            you will see the new studio. You can select the recent prototypes on the left side. The 
                            selected prototype is show in the center. On the right side we show you the most important
                            indicators, e.g. how many test you habe run, or the avergae success rate.
                        </li>
                        <li>
                            <b>New Design</b>: We have completey redesigned the canvas. 
                        </li>
                      <ul>
                    
                    `
                },
                title: 'Quant-UX 5! 🚀 '
            },
            {
                matches (user) {
                    return user.loginCount >= 2
                },
                id:"GiveUsAStar",
                more: `
                    If Quant-UX has been lighting up your projects and you're part of the GitHub community, 
                    we'd be over the moon if you could shower us with a ⭐️ star ⭐️! Simply hop over to 
                    our GitHub project page and hit that star button to show your support. 
                    Together, let's keep the momentum going! Give us a star right here
                     <a href="https://github.com/KlausSchaefers/quant-ux" target="github">Quant-UX on GitHub</a> 
                `,
                title: 'Give us a star at GitHub'
            },
            {
                matches (user) {
                    return getDays(user) > 2
                },
                id:"Discord",
                more: `
                    We have a <a href="https://discord.gg/TQBpfAAKmU" target="github">Discord</a>
                    channel! You can reach us there or discuss with other users.
                `,
                title: 'Chat with us on Discord'
            },
            {
                matches (user) {              
                    return getDays(user) > 1
                },
                id:"Youtube",
                more: `
                    hey there, do you know that we have a <a href="https://www.youtube.com/@quant-ux8332" target="github">YouTube</a>
                    channel?  Dive into a treasure trove of tutorials and sneak peeks that'll supercharge your learning journey.
                    If you like the content, subscribe to the channel to not miss out on new content.
                `,
                title: 'YouTube'
            },
            {
                matches (user) {
                    return getDays(user) > 3 && !user.image
                },
                id:"ProfilePic",
                more: `
                    Boost the collaboration with your team! You can upload a profile picture in your 
                    <a href="#/my-account.html" target="account">Account Settings</a>. This will
                    make it easier for others to distinguish your account.
                   
                `,
                title: 'Add a profile picture'
            },
            {
                matches (user) {
                    return user.loginCount >= 5 && !user.name
                },
                id:"UserName",
                more: `
                    If you add your name and lastname in the
                    <a href="#/my-account.html" target="account">Account Settings</a>,
                    other users can better collaborate with you.
                   
                `,
                title: 'Add your name and lastname'
            },
            {
                matches (user) {
                    return getDays(user) > 4
                },
                id:"CollaborativeWork",
                more: `
                    Do you know that you can invite other Quant-UX members to collaborate 
                    on a prototype? You can even work in realtime in the same canvas with them!
                   
                `,
                title: 'Work with others'
            }
            
        ]
    }

   
}
export default new NotificationService()