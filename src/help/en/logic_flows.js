export let texts = [
    {
        "id": "logic",
        "name":"Logic Flows",
        "title": "Logic Flows",
        "body": `
            Logic Flows enable you to create conditional navigations that allow you to model real world
            workflows in your prototypes.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/nY_duDdc0X0"
        },
        "paragraphs": [
            {
                "id": "logic.intro",
                "title": "When to use",
                "body": `
                    Sometimes, a prototype has to react to the user input. Imagine you are testing a checkout 
                    process, and the user must choose between several payment options, for instance, bank 
                    transfer and credit card. Depending on the selection, the next page should show 
                    the different information and input fields. 
                    <br>
                    For these kinds of scenarios, Quant-UX supports <strong>Logic Flows</strong>. In addition 
                    to linking two pages, you can also add a logical operator 
                    to dynamically decide which screen to show next.
                    <br>
                `
            },
            {
                "id": "logic.howto",
                "title": "Create Logic Flows",
                "body": `
                    Click on the <span class="mdi mdi-rhombus-outline"> icon to place a Logic Operator on
                    the canvas. Instead of creating a direct link from the button to the next page, 
                    <strong>you link the logic operator instead</strong>. 
                    Once you selected it, you can create multiple links to different pages, and add rules to each link. 
                    A rule simply states that a certain input field should be equal to a given value.
                    When the user clicks on the button, the first link which matches the rule 
                    will be followed. If no rule is matched then the first link without any rule is followed.
                `
            }
        ]
    }
]
