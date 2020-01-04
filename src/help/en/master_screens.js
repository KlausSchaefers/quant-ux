export let texts = [
    {
        "id": "master",
        "name":"Master Screens",
        "title": "Master Screens",
        "body": `
            Integrating repeating elements such as navigation bars into a design system is tricky, as these elements 
            usually need a slight modification in each screen. To ease this task, 
            Quant-UX supports Master Screens.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/6MuqBiHjiDs"
        },
        "paragraphs": [
            {
                "id": "logic.intro",
                "title": "When to use",
                "body": `
                    Screen designs often share the same design elements across multiple screens. Examples are for 
                    instance navigation bars or visual styles for text and buttons. The simplest way to 
                    share the elements is to copy them from one screen to another. This approach has 
                    a significant drawback. Once you want to change the style of the elements, you 
                    have to apply the changes on all screens.
                `
            },
            {
                "id": "logic.how",
                "title": "How it works",
                "body": `
                    For such scenarios, we introduced Master Screens in Quant-UX.com. 
                    A master screen is a kind of symbol for screens that the different screens 
                    in your app can extend. Changes to the master screen are automatically 
                    updated in all screens. It’s basically like a master slide in PowerPoint, 
                    but we extended the concept to boost productivity further.
                    <br>
                    In Quant-UX you can extend (or overrule) the master screen for 
                    selected elements, for instance, to highlight the current position in the screen flow.
                `
            },
            {
                "id": "logic.setmaster",
                "title": "Set a master screen",
                "body": `
                    First you have to create a master screen. This contains for instance a navigation bar that should be shared
                    with all other screens.
                    <br>
                    Once it is created, you can create a new screen and place it on the canvas. After selecting the screen,
                    you can select the master screen in the "Master Screen" section 
                    by clicking on <strong>Add Master Screen</strong>. Now, all elements form 
                    the master screen are copied to child screen.
                `
            },{
                "id": "logic.example",
                "title": "Extend the master screen",
                "body": `
                    When you want to change to style of a element that is copied from a mastre screen, you have
                    to explicitly enbale  editing. Select the element, and click <span class="MatcButton">Enable Editing</span>.
                    In the properties panel on the right side, you have to enable editing. 
                    Once editing is enabled, you can change the font color to give the visual 
                    indication. 
                `
            },
        ]
    }
]
