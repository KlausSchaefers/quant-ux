export let texts = [
    {
        "id": "analytics.dist",
        "name": "Data Distribution",
        "title": "Data Distribution",
        "body": `

        The data distribution gives you an overview of how much time the users spend in the prototype 
        and how many clicks they took. 
      
          

        `,
        // "video": {
        //     "src": "https://www.youtube.com/embed/eGDTAJlB-uI?t=64"
        // }
        "paragraphs": [
            {
                "id": "analytics.dist.scatter",
                "title": "",
                "body": `
                   
                    The data is shown as a scatter plot. Each user is presented 
                    as a circle in the diagram. The x-axis represents the time the users spend, 
                    the y-axis the amount of interactions.
                    
                    <p class="MatcHelpCallout">
                        By clicking on a circle, one can
                        open the session replay. Just click on the link that will appear below the chart.
                    </p> 
                `,
                "image": {
                    "src": '/help/DataDistScatter.png',
                    "caption": "Clicking on the circle allows to review the screen recording."
                }
            },
            {
                "id": "analytics.dist.scatter.why",
                "title": "",
                "body": `
                                          
                        This view is useful for two reasons:
                      
                        <p>
                                <b>First</b>, it gives an instant overview of how the data is distributed. Often the 
                                majority of the testers will use a similar amount of clicks and time. 
                                This will lead to a dense area in the plot, where a lot of the circles 
                                are close together, which can be easily spotted. If this area is at a 
                                different place than you expected, the design 
                                might have some issues or the task descriptions were not clear. 
                        
                        </p>
                        <br>
                        <p>
                                <b>Second</b>, the scatter plot makes it very easy to spot users that 
                                behaved differently. For instance a very short duration might
                                indicate that the users didn’t understand the design and quit immediately. 
                                A long duration can show that the users were interested, but didn’t understand 
                                how the design works. The same principles apply for the number of interactions. 
                                Once you have spotted such users, the best way is to 
                                examine the screen recording, to better understand the users issues.
                         </p>  
                       
                `
            },
            {
                "id": "analytics.dist.scatter.tasks",
                "title": "Task Overlay",
                "body": `
                    The scatter plot can also indicate which users 
                    have successfully completed a task. By selecting a task in the 
                    lower right corner, the corresponding sessions will 
                    be highlighted. Using the task overlay, can give additional insights. For instance,
                    you might confirm that task completion is related with the duration.
          
                `,
                "image": {
                    "src": '/help/DataDistScatterTask.png',
                    "caption": "All users that completed the task are shown in green"
                }
            },
        ]

    }
]
