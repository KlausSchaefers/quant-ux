export let texts = [
    {
        "id": "getting_started",
        "name":"Getting Started",
        "css": "MatcHelpTopicSpacer",
        "title": "Getting Started",
        "body": `
            Quant-UX is a prototyping tool to design, test and analyse your visual designs.
            To learn more, use the navigation on the right side.
        `,
        "paragraphs": [
                {
                    "id": "getting_started.into",
                    "title": "Overview",
                    "body": `
                        A prototype consists out of the screens in which you can place widgets. Widgets are the basic building blocks
                        of your design, but in contrast to most other prototyping tools, they are fully functional.
                        This means users can toggle a checkbox or enter data into a text field.
                        <br><br>

                        Quant-UX canvas has three main views on a prototype.

                        <ol>
                            <li>
                                The <b>Design</b> view allows you to create the visual aspect of your prototype. You can
                                add screens and widgets and change the appearance.
                            </li>
                            <li>
                                The <b>Prototype</b> view defines the interaction between the screens and elements. In the prototype
                                view, you can see and create the links between the screens. You can also customize certain
                                dynamic properties of input element, e.g. form validation and data binding.
                            </li>
                            <li>
                                In the <b>Low Code</b> view, you can define properties that are important for turning the prototype
                                into a working application.
                            </li>
                        </ol>

                        <br>
                        You can define screen transitions that link the screens together. A transition is triggered when the user
                        performs a certain action, for instance, clicks on a button or performs a screen gesture.
                    `
                },
                {
                    "id": "getting_started.screens",
                    "title": "Screens",
                    "body": `
                        To create a screen, press <strong>S</strong> or click the <span class=" mdi mdi-cellphone"/> icon.
                        You can place the screen freely on the canvas.<br>
                        Once you have placed the screen, click on it to select it. On the right property panel, you can
                        now configure the screen name, the background (color or image).
                        <br>
                        You can also set a screen to be an overlay. This means, that the screen will be rendered on top of
                        another screens. This is for instance useful if you want to build modal dialogs.
                    `
                },
                {
                    "id": "getting_started.widgets",
                    "title": "Widgets",
                    "body": `
                        Quant-UX comes with a rich selection of functional widgets. You can create a widget by pressing
                        <strong>W</strong> or selecting <span class="mdi mdi-puzzle-outline"/> icon. To create the most common widgets,
                        you can also use the  <strong>R</strong> (Rectangle), <strong>T</strong>
                        (Text) or  <strong>H</strong> (Hotspot)
                        shortcuts.<br>
                        To select a widget, simply click on it. The property panel will show up, and you can configure the visual
                        appearance of the widget. In addition, you can configure certain properties, for instance the
                        entries in a dropdown box.
                    `
                },
                {
                    "id": "getting_started.links",
                    "title": "Links",
                    "body": `
                        To create a screen transition, you have to link a source (widget or screen) to a target screen.
                        Change to the <strong>Prototype</strong> view and select the widget (or screen) and press the <strong>L</strong> or click on the
                        <span class="MatcButton">Add Action</span> button in the properties panel.
                        Now you can select the target screen.
                        <br>
                        Once you have created a link the Add Action button will disappear in the properties panel, and you
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