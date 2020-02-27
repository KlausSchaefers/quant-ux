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
        "paragraphs": [
                {
                    "id": "analytics.tasks.create",
                    "title": "Create analytic tasks",
                    "body": `
                        To create an analytic task, go to the “DashBoard” tab and scroll to the “Tasks” section. 
                        There you can create new tasks and edit an existing one. Click on the “Edit Flow” 
                        button to launch the task recorder. The task recorder will show you the 
                        prototype and allows you to define the task by simply clicking through the prototype. 
                        Once you have finished the task, click on “Done”. 
                        The list of recorded events is shown so that you can select the relevant 
                        events for the task. Most of the time, only the start and end are important. 
                        For instance that the user has clicked on button “A” and at later on button ”X”. 
                        The interactions between and their order are often not important, therefore you 
                        do not have to select the events. If however, certain intermediate events are 
                        important, select them as well. Click on “Save” to save the task and close the dialog. 
                        <br>
                       
                    `,
                    "video": {
                        "src": "https://www.youtube.com/embed/mdYEBEhd33Q"
                    },
                },

                {
                    "id": "analytics.tasks.kpi",
                    "title": "Task KPIs",
                    "css": "MatcHelpContentParagraphSpacer",
                    "body": `
                        Once the task flow is defined the task list will update no and show you the following KPIs:
                    `
                },
                {
                    "id": "analytics.tasks.success",
                    "title": "Success Rate",
                    "body": `
                        The success rate tells you how many users were able to complete a given task. 
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