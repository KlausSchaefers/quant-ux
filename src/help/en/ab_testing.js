export let texts = [
    {
        "id": "ab-testing",
        "name":"A/B Testing",
        "title": "A/B Testing ",
        "body": `
            You can create A / B tests with the help of the Logic Flows. Simply place a
            logic operator <span class="mdi mdi-rhombus-outline"> on the canvas and add a wire from the
            source widget that should trigger the screen transition. Afterwards, select the logic
            operator and tick the <strong>A/B Test</strong> checkbox. Now wire the target screens. During a
            test, the operator will send the users randomly along one of the links.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/0DCUbyaG1Qw"
        },
        "paragraphs": [
            {
                "id": "ab-testing.users",
                "title": "How to run",
                "body": `

                    A / B tests are a great way to compare two designs. However, you must carefully think 
                    about how to design the test. If you test two completely different designs, 
                    the results will give you an idea of which design works better, but you might 
                    not understand why. This can be fine, but if you aim for a deeper understanding, 
                    you should keep most of the design stable and only change one aspect. 
                    For example, the type of a UI element or its color.

                `
            },
            {
                "id": "ab-testing.stats",
                "title": "Statistic Significance",
                "body": `

                If you run A / B tests you should aim for a large number of tests, otherwise, 
                the differences in the KPIs might be statistically not significant. 
                For instance, a single user, that did not understand the design, might skew the KPIs quite a lot.


               
                <p class="MatcHelpCallout">
                    Best test with more than 60 people in each variant.
                </p>
                    
                `
            }
        ]
    }
]