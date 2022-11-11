export let texts = [
    {
        "id": "analytics",
        "name":"Analytic Dashboard",
        "title": "Analytics",
        "css": "MatcHelpTopicSpacer",
        "body": `
            Quant-UX provides a rich selection of analytic tools and KPIs that help you understand how your users have interacted
            with your prototype. The "<strong>Dashboard</strong>" tab shows the most important KPIs about the tests. In addition, you can 
            define analytic tasks to better understand the user behavior. The "<strong>Heatmap</strong>" tab shows the click heat maps 
            for each screen and allows you to launch the <strong>Analytic Canvas</strong> which gives you access to the most fine grained
            information.
            <br>
            Before you can use the analytic tools you have to run a couple of tests.
        `,
        "paragraphs": [
                {
                    "id": "analytics.dash.users",
                    "title": "Users",
                    "body": `
                        The question of how many users should participate in trials is heavily discussed in the scientific 
                        community. The bare minimum is <strong>5 users</strong>, which allows you to get some qualitative insights into 
                        user behaviour. You should be able to spot if the users understand the design or if they do errors. 
                        The best tool is in such a case the video recordings, which allow you to review each testing session. 
                        <br>
                        5 users, however, do not yield statically relevant results and thus the heatmaps and other KPIs are 
                        very biased. This means, that if you test with more users the results might change significantly. 
                        This bias will get smaller with every user that tests the prototype and after roughly <strong>40 testers</strong>, 
                        you can expect the results to stabilize.  
                        <br>
                        If you want to run A / B tests you should aim for more than 60 
                        testers in each variant. Otherwise, the differences that you observe in certain KPIs, e.g. 
                        the duration, might still be biased. Also, be aware, the outliers might strongly 
                        influence the results in small tests.
                        <p class="MatcHelpCallout">
                            In conclusion, you should try to test with as many users as possible. 
                            If you have access to only a small user group, be careful when you report the 
                            results to your stakeholders. 
                            <br>
                            It is always correct to say that 4 of 5 users clicked 
                            on a given button, but concluding that 80% of all users will click on the button is likely to be wrong.
                        </p>
                        
                    `
                },
                {
                    "id": "analytics.dash.coverage",
                    "title": "Test Coverage",
                    "body": `
                        The test coverage is calculated as the fraction of screens that have been seen by the testers. 
                        The test coverage gives you a quick hint if your testers understood your prototype.
                        <p class="MatcHelpExample">
                            <b>Example</b>: If your prototype has 3 screens, and all users have only 
                            managed to see 2 of them, the test coverage is 66%
                        </p>
                        `
                },
                {
                    "id": "analytics.dash.duration",
                    "title": "Duration",
                    "body": `
                        The test duration tells you how long the users tried out your prototype. 
                        It is calculated as the average duration of a test, starting from the first 
                        event until the last interaction. The standard derivation is also shown 
                        and gives you a hint of how similarly the users tested the prototype.
                        <p class="MatcHelpExample">
                            <b>Example</b>: Three users have tested your prototype. The first user took 30s, 
                            the second 40s and the third 50s. The average duration is 
                            then 40s and the standard derivation is 10s.
                        </p>
                    `
                }
            ]
    }
]
