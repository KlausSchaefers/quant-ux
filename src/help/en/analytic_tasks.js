export let texts = [
    {
        "id": "analytics.tasks",
        "name":"Analytic Tasks",
        "title": "Analytics Tasks",
        "body": `
            Tasks are defined as a sequence of interactions that the users have to perform.
            Analytic tasks allow you to measure how long and how many clicks users need for the execution.
            <br>
        `,
        "video": {
            "src": "https://www.youtube.com/embed/eGDTAJlB-uI?t=64"
        },
        "paragraphs": [
                {
                    "id": "analytics.tasks.kpi",
                    "title": "Task KPIs",
                    "css": "MatcHelpContentParagraphSpacer",
                    "body": `
                        Once the task flow is defined the task list will update no and show you the following KPIs:
                    `
                },
                {
                    "id": "analytics.tasks.start",
                    "title": "Start",
                    "body": `
                        The start rate tells you how many users were able to start a given task. If the start rate is low,
                        this means that the users where not able to find the task in your design.
                    `
                },
                {
                    "id": "analytics.tasks.success",
                    "title": "Success",
                    "body": `
                        The success rate tells you how many users were able to complete a given task once the have <b>started</b>
                        In general, you want all users to understand your design and are able to complete
                        the task. Hence, the higher the success rate, the better your design.
                    `
                },
                {
                    "id": "analytics.tasks.duration",
                    "title": "Duration",
                    "body": `
                        The task duration measures the average time the users take to complete a task.
                        Most of the times short durations indicate that the users understood your design. But
                        be aware that often the times vary a lot between the individual users.
                        You can see the distribution of the duration by clicking on the little icon.
                        `
                },
                {
                    "id": "analytics.tasks.clicks",
                    "title": "Interactions",
                    "body": `
                        The task duration measures the average number of events for a task.
                        Please be aware that often the number of events varies a lot between
                        the individual users. You can see the distribution by clicking on the little icon.
                    `
                },
                {
                    "id": "analytic.taks.dialog",
                    "title": "Task Charts",
                    "body": `
                        You can get a deeper insight into the distribution of the duration and interactions by
                        clicking on the <span class=" mdi mdi-chart-bar"></span> button next to the “Edit Flow” button. In the dialog,
                        you can switch between scatter plots and box plots. Scatter plots show the duration
                        of a task vs the number of interactions and make it easy to spot outliers.
                        These outliers usually relate to users that had issues with the design.
                    `
                }
            ]
    }
]