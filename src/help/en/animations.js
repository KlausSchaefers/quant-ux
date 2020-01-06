export let texts = [
    {
        "id": "animations",
        "name":"Animations",
        "title": "Animations",
        "body": `
            Quant-UX supports two kind of annimations. Widget animations change the style of a widget, depending on the
            user interactions. For instance you can define a hover color of a button, or a error color for a text box.
            In addtion, you can also create screen animation, that are shown once a screen is loaded. These include entrance
            animations, such as slide in effects, and more complex animations that are defined for every widget.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/RXxzpK7hFck"
        },
        "paragraphs": [
            {
                "id": "animations.widget",
                "title": "Widget Animations",
                "body": `
                    To create a widget animation select a widget. If the widget supports animations you can see in the 
                    lower right corner a tab bar with the different widget states, e.g. <strong>Normal</strong>
                    and <strong>Hover</strong>. If you press Hover,
                    the properties panel will change and only show the properties that you can change for the Hover state.
                    Change the background, or text color. When you launch the simulator the selected color will be shown when 
                    you hover with the mouse over the widget. 
                `
            },
            {
                "id": "animations.screens",
                "title": "Screen Animations",
                "body": `
                    Before you create a screen animation, you have to create a link between a source (widget or screen) 
                    and a target screen. Once you have created the link, select the souce element. In the properties panel,
                    you can now select in the <strong>Action</strong> section the <strong><span class="mdi mdi-close"/> No Animation</strong> button. 
                    A popup will show up,
                    that lets you define how the new screen is animated, for instance if it is faded or slidedin. 
                    You can also configure the duration and the easing function.
                    <br>
                    You can also create dedicated loading animations that will animate each widget separately. Select a screen, and press
                    the <strong><span class="mdi mdi-video" /> Animation</strong> button. The animation composer will show up,
                    which let's you define for each widget a animation time line. You can set the start and end of the animation. Press the 
                    <span class="mdi mdi-close"/> icon to select the type of animation.
                    <br> 
                    Please note that the <strong><span class="mdi mdi-auto-fix"/> Transform</strong> animation type work only of the first screen
                    has an element with the <strong>same name</strong>. The animation will transform the 
                    previous widget (position and style) to the current one.
                `
            },
            {
                "id": "animations.transforms",
                "title": "Screen Transforms",
                "body": `
                    If you want complex animation you can use the <strong>Animation</strong> links. These special kind of links create 
                    under the hoods for every widget a transorm animation that is shown when the screen is loaded. The best way to work with
                    animation links is to:
                    <ol>
                        <li>
                            Create a screen with all elements as the initial state.
                        </li>
                        <li>
                            Create a copy of the screen.
                        </li>
                        <li>
                            Change the elements in the second screen to define the end state of the animation.
                        </li>
                        <li>
                            Select the element which should trigger the animation and click on 
                            <span class="MatcButton">Add Action</span> button and select <strong>Animation</strong>
                        </li>
                    </ol>
                `
            }
        ]
    }
]