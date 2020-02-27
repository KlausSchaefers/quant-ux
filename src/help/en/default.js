export let texts = [
    {
        "id": "default",
        "name":"Getting Started",
        "css": "MatcHelpTopicSpacer",
        "title": "Quant-UX",
        "body": `
            Quant-UX is a prototyping tool to design, test and analyse your visual designs. 
            To learn more, use the navigation on the right side.
        `,
        "paragraphs": [
                {
                    "id": "default.into",
                    "title": "Overview",
                    "body": `
                        A prototype consists out of the screens in which you can place widgets. Widgets are the basic building blocks
                        of your design, but in contrast to most other prototypibg tools, they are fully functional. 
                        This means users can toggle a checkbox or enter data into a text field.
                        <br>
                        You can define screen transitions that link the screens together. A transition is triggered when the user
                        performs a certain action, for instance clicks on a button or performs a screen gesture.
                    `
                },
                {
                    "id": "default.screens",
                    "title": "Screens",
                    "body": `
                        To create a screen press <strong>S</strong> or click the <span class=" mdi mdi-cellphone"/> icon. 
                        You can place the screen freely on the canvas.<br>
                        Once you have placed the screen, click on it to select it. On the the right property panel, you can
                        now configure the screen name, the background (color or image). 
                        <br>
                        You can also set a screen to be an overlay. This means, that the screen will be rendered on top of
                        another screens. This is for instance usefull if you want to build a modal dialogs.
                    `
                },
                {
                    "id": "default.widgets",
                    "title": "Widgets",
                    "body": `
                        Quant-UX comes with a rich selection of functional widgets. You can create a widget by pressing 
                        <strong>W</strong> or selecting <span class="mdi mdi-puzzle"/> icon. To create the most common widgets,
                        you can use also the  <strong>R</strong> (Rectangle), <strong>T</strong>
                        (Text) or  <strong>H</strong> (Hotspot) 
                        shortcuts.<br>
                        To select a widget, simply click on it. The property panel will show up, and you can configure the visual
                        appearance of the widget. In additional you can configure certain properties, for instance the 
                        entries in a dropdownbox.
                    `
                },
                {
                    "id": "default.links",
                    "title": "Links",
                    "body": `
                        To create a screen transition, you have to link a source (widget or screen) to target screen. 
                        Select the widget (or screen) and press the <strong>L</strong> or click on the 
                        <span class="MatcButton">Add Action</span> button in the properties panel. 
                        Now you can select the target screen.
                        <br>
                        One you have created a link the button will disappear in the properies panel, and you
                        can configure certain properties of the link, for instance the animation and the user
                        event that should trigger the screen transition. For screens, you can also create timed
                        transitions to create splash screens.
                        <br>
                        <strong>Hint:</strong> To clean up the design, you can also place waypoints, by clicking on the canvas.
                    `
                }
            ]
    }
]