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
        if ( this.user.id === -1) {
            return []
        }
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
        let maxAdd = getDaysSinceLastNotification(user) > 1 ? 1 : 0
        if (location.href.indexOf('localhost') > 0) {
            maxAdd = 1
        }
        this.logger.log(-1, 'addUserJourneyNotifications', `> days since last ${getDaysSinceLastNotification(user)} > maxAdd: ${maxAdd} > Seen notifications:`, user.notifications )
        this.rules.forEach(rule => {
            if (user.notifications[rule.id]) {
                this.logger.log(1, 'addUserJourneyNotifications', 'Add OLD:', rule.id)
                notifications.push({
                    id: rule.id,
                    type: 'UserJourney',
                    title: rule.title,
                    more: rule.more,
                    video: rule.video,
                    img: rule.img,
                    details: rule.details,
                    lastUpdate: user.notifications[rule.id]
                })
            } else if (rule.matches(user)) {
                if (addCount < maxAdd) {
                    this.logger.log(1, 'addUserJourneyNotifications', 'Add NEW:', rule.id)
                    const lastUpdate = new Date().getTime()
                    notifications.push({
                        id: rule.id,
                        type: 'UserJourney',
                        title: rule.title,
                        more: rule.more,
                        video: rule.video,
                        img: rule.img,
                        details: rule.details,
                        lastUpdate: lastUpdate
                    })
                    user.notifications[rule.id] = lastUpdate
                    isDirty = true
                    addCount++
                } else {
                    this.logger.log(1, 'addUserJourneyNotifications', 'Ignored:', rule.id)
                }
            } else {
                this.logger.log(1, 'addUserJourneyNotifications', 'No match:', rule.id)
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

    async getAutoOpen() {
        const user = await this._get('/rest/user/' + this.user.id + '.json')
        this.logger.log(-1, 'getAutoOpen', 'exit', user.isAutoOpenNotifcations)
        return user.isAutoOpenNotifcations !== false
    }

    setAutoOpen(isAutoOpen) {
        this.logger.log(-1, 'setAutoOpen', 'enter', isAutoOpen)
        this._post('rest/user/' + this.user.id + ".json", {
            isAutoOpenNotifcations: isAutoOpen
        })
    }

    reset () {
        this.logger.warn('reset', 'enter')
        this._post('rest/user/' + this.user.id + ".json", {
            notifications: {},
            lastNotification: 1
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
                id:"Welcome",
                img: 'Welcome.png',
                more: `
                    <p>
                        We're excited to have you on board! Quant-UX is your all-in-one platform to design, test, and analyze UX prototypes with ease. 
                        Whether you're wireframing your next big idea or diving into user behavior, 
                        Quant-UX helps you bring it all together in one seamless workflow.
                    </p>

                    <p>
                        To help you get started, check out our <a href="https://www.youtube.com/@quant-ux8332" target="github">YouTube</a> channel where we share tutorials, feature overviews, 
                        and pro tips to make the most of the platform.
                    </p>
                    <p>                                     
                        And if you’d like to connect with other designers, get support, or share your feedback, join our <a href="https://discord.gg/TQBpfAAKmU" target="github">Discord</a> 
                        community — we would love to have you there.
                    </p>
                    <p>     
                        Let's build better experiences together! 🚀
                    </p>


                `,              
                title: 'Welcome to Quant-UX!'
            },
            {
                matches (user) {
                    return user.loginCount >= 2
                },
                id:"GiveUsAStar",
                img: 'Github.png',
                more: `
                    If you like Quant-UX and you're part of the GitHub community, 
                    pleaese give us a ⭐️ star ⭐️! Simply hop over to 
                    our GitHub project page and hit that star button to show your support. 
                    Together, let's keep the momentum going! Give us a star right here:
                     <a href="https://github.com/KlausSchaefers/quant-ux" target="github">Quant-UX on GitHub</a> 
                `,
                title: 'Give us a star at GitHub'
            },
            {
                matches () {
                    return true
                },
                id:"AiSimUser",
                img: 'AiSimUser.png',
                more: `
                    You can now simulate user interactions with your application in the Analytic Canvas. 
                    Simply describe your user and their task, and the AI will generate a simulation, 
                    including heatmaps and other insights [<a href="https://www.youtube.com/watch?v=Uwr-ig1gxc4" target="yt">Video</a>].
                `,
                title: 'AI Tests - Simulate UX tests with AI (Beta)'
            },
            {
                matches () {
                    return true
                },
                id:"NewUndoRedo",
                img: 'UndoRedo.png',
                more: `
                    We have rewritten the complete <b>Undo-Redo</b> functionality to eliminate the last bugs. If you face issues, 
                    please let us know and contact us. 
                `,
                title: 'New Undo-Redo '
            },
            {
                matches (user) {
                    return getDays(user) > 2
                },
                id:"Discord",
                img: 'Discord.png',
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
                img: 'Youtube.png',
                more: `
                    hey there, do you know that we have a <a href="https://www.youtube.com/@quant-ux8332" target="github">YouTube</a>
                    channel?  Dive into a treasure trove of tutorials and sneak peeks that'll supercharge your learning journey.
                    If you like the content, subscribe to the channel to not miss out on new content.
                `,
                title: 'YouTube'
            },
            // {
            //     matches (user) {
            //         return getDays(user) > 3 && !user.image
            //     },
            //     id:"ProfilePic",
            //     img: 'Youtube.png',
            //     more: `
            //         Boost the collaboration with your team! You can upload a profile picture in your 
            //         <a href="#/my-account.html" target="account">Account Settings</a>. This will
            //         make it easier for others to distinguish your account.
                   
            //     `,
            //     title: 'Add a profile picture'
            // },
            {
                matches (user) {
                    return user.loginCount >= 2
                },
                id:"UserName",
                img: 'Profile.png',
                more: `
                    Don't forget to add your name, surname, and a profile picture to your account — it helps others recognize you and makes collaboration smoother and more personal! Visit your
                    <a href="#/my-account.html" target="account">Account</a> to add your personal details.
                   
                `,
                title: 'Complete your profile'
            },
            {
                matches (user) {
                    return getDays(user) > 4
                },
                id:"CollaborativeWork",
                img: 'Team.png',
                more: `
                    <p> 
                        Did you know you can invite other Quant-UX members to collaborate on the same prototype? 
                        You can even work together in real time on the same canvas and watch updates happen live — just like magic.
                    </p>
                    <p>                                   
                        And with comments, you can capture insights, give feedback, and keep the
                        conversation flowing with your team — all right where the work is happening.
                    </p>
                   
                `,
                title: 'Work with others'
            },
            {
                matches (user) {
                    return getDays(user) > 5
                },
                id:"Luisa",
                img: 'Luisa.png',
                more: `
                    Quant-UX has a sister project, called <a href="https://luisa.cloud" target="luisa">Luisa</a>.
                    With Luisa you can turn your prototypes into real apps, add your own data and logic.
                    Check it out!
                   
                `,
                title: 'Turn prototypes into real apps'
            },
            {
                matches (user) {
                    return getDays(user) > 6
                },
                id:"AudioWithVideo",
                img: 'Audio.png',
                more: `
                    We're excited to announce that Quant-UX now supports audio player elements in your prototypes!
                    Whether you're designing a podcast app, a meditation experience, or anything that needs sound, 
                    you can now bring your ideas to life with built-in audio playback. Drag. Drop. Play. 
                    It's that simple. See the it in <a href="https://youtu.be/Nm64WGlTwIc" target="_youtube">action</a>.
                `,
                title: 'New Audio Player Widget'
            },
            {
                matches (user) {
                    return getDays(user) > 2
                },
                id:"PaddingConstraint",
                img: 'PaddingConstraint.png',
                more: `
                    Designing just got smoother. Now when you drag elements into a Rectangle (Shortcut R), 
                    the paddings are automatically respected —no more manual nudging! 
                    Simply drop a Rectangle onto your canvas, set your desired paddings, 
                    and start dragging elements in. They'll snap into place perfectly, 
                    making alignment effortless and your layouts cleaner than ever. 
                    Check out the <a href="https://youtu.be/oKiw1bvdRvo" target="_youtube">Video</a>.
                `,
                title: 'Smarter Drag & Drop with Rectangle Paddings'
            }
            
        ]
    }

   
}
export default new NotificationService()