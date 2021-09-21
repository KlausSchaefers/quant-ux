export let texts = [
    {
        "id": "analytics.canvas",
        "name": "Analytic Canvas",
        "title": "Analytic Canvas",
        "body": `
            To open the analytic canvas select the "Heatmaps" tab in the prototype overview page. Now select one of
            the heap maps or click "Analytic Canvas" button in the right corner. In the tollbar of the analytic canvas
            your can select the different kind of tools to vizualize the user behavior.
        `,
        "paragraphs": [
            {
                "id": "analytics.canvas.intro",
                "title": "What are heatmaps",
                "body": `
                    Click heatmaps visualize where the users have clicked. The more the users 
                    click on a certain area, the hotter (more reddish) the area gets. Thus, the 
                    elements in the area are likely important for the user.
                `
            },
            {
                "id": "analytics.canvas.click",
                "title": "Click Heatmaps",
                "body": `
                    When you review click heat maps, you should analyze them in the context of your
                    uses cases. Before you created the interface, you identified and 
                    prioritized user tasks and designed the interface accordingly. The primary 
                    elements should be easy to find and you expect them to be used a lot.
                    <br>  </br>
                    If the primary elements are hot your hypothesis was most likely right 
                    and the users behave as you expected. If the primary elements are cold, 
                    this usually indicates a problem. The users might not be able to 
                    find the elements or do not want to use the function.
                    Unexpected hot areas indicate that the users behave differently than you thought. 
                    </br>  </br>
                    There are five different types of click heatmaps supported:
                    <ol>
                        <li>
                            <b>All Clicks</b> gives you a good understanding on
                            busy areas of your design, but also makes it easy to spot areas 
                            that did not catch the users attention.
                        </li>
                        <li>
                            <b>First Click</b> help you to uncover which 
                            elements draw the most attention from the users, and were 
                            clicked right after a screen was loaded.
                        </li>
                        <li>
                            <b>First three Click</b> extends the first clicks to three clicks. 
                            Elements that are not touched withing three 
                            clicks, may be hard to discover for the user.
                        </li>
                        <li>
                            <b>Missed Clicks</b> show clicks on not actionable elements, for instance
                            when the users click on the screen background. This can indicate that the users made an
                            error and could not understand the intended interaction.
                        </li>
                    </ol>

                `
            },
            {
                "id": "analytics.canvas.mouse",
                "title": "Mouse Heapmaps",
                "body": `
                    Cursor heat maps work different than click heat maps. The longer the cursor 
                    is over a certain screen estate, the hotter it gets. Research shows some 
                    correlation between the cursor movement and eye gaze. This means long hover 
                    times over a specific area can indicate strong user interest, but it can also mean 
                    that the user simply didn’t move the mouse. 
                    <br>
                    Often you these hepatmaps are the reuslt of a “reading pattern”, which often takes 
                    ans F shaped form. 
                `
            },
            {
                "id": "analytics.canvas.journey",
                "title": "User Journey",
                "body": `
                    The user journey shows how the users have navigated over the prototype. By default, 
                    the different journeys are merged and common paths are shown in a warmer color. 
                    You can deselect the merge option in the properties panel to show the individual 
                    flows. 
                    <br>
                    In the properties section, you can also see the list of all user tests. 
                    You can toggle the visibility and also launch the screen recordings.         
                `
            },
            {
                "id": "analytics.canvas.scroll-visibility",
                "title": "Scroll Visibility",
                "body": `
                    The scroll visibility shows for each screen which parts of the screen were shown to the users. 
                    This is important for you have longer screens. Parts below the fold (the bottom of the screen) 
                    are usually less often seen and are therefore shown in colder colors. 
                    The scroll visibility helps you to detect if the users explored the entire screen.          
                `
            },
            {
                "id": "analytics.canvas.scroll-time",
                "title": "Scroll Time",
                "body": `
                    The scroll time shows on which parts of the screen the users have spend 
                    most of their time. The more time the users spend on a given 
                    section, the warner is the color.          
                `
            },
            {
                "id": "analytics.canvas.views",
                "title": "Screen Views",
                "body": `
                    The view heatmap shows how many times a screen was seen by the users in 
                    relation to the other screens. Cold colors indicate that the majority 
                    of users have not seen the screen, which could be an indicator that the navigation is broken.        
                `
            },
            {
                "id": "analytics.canvas.dwell",
                "title": "Dwell Time",
                "body": `
                    The dwell time indicate how much time the users have spent on a screen. 
                    If you have for instance a screen where the users have to fill out a form, 
                    the screen is usually hot.           
                `
            },
            {
                "id": "analytics.canvas.kpis",
                "title": "Element KPIs",
                "css": "MatcHelpContentParagraphSpacer",
                "body": `
                    When you select a widget or screen you can also see certain KPIs 
                    that are related to the widget. These KPIs include:            
                `
            },
            {
                "id": "analytics.canvas.kpi.clicks",
                "title": "Widget Clicks",
                "body": `
                    The widget clicks tell you how many time a certain widget was clicked. 
                    This kpi relate directly to the heat maps. The gauge shows the absolute 
                    number of clicks, the position of the ring shows the relation to all 
                    other widgets in the prototype.
                    <br>
                    Example: During test 100 clicks were recorded by 5 users. Widget a was clicked 20 times. The relative frequency is therefore 20%.
                    
                `
            },
            {
                "id": "analytics.canvas.kpi.first-clicks",
                "title": "First Clicks",
                "body": `
                    The widget clicks tell you how many time a certain widget <strong>was clicked directly 
                    after a screen was loaded</strong>. The first clicks show which elements catch the most 
                    attention of the users. The gauge shows the absolute number, and the position 
                    visualizes the relation to the screen loads.
                    <br>
                    Example: A screen has two elements, A and B. The screen was loaded 10 times 
                    and 4 times element B was clicked immediately afterwards. 
                    The relative frequency is thus 40%.
                                    
                `
            },
            {
                "id": "analytics.canvas.kpi.before-click",
                "title": "Time before Click",
                "body": `
                    The time before click tells you how many seconds the users took in average 
                    until the interacted the first time with the given element. In general elements 
                    in the top should have shorter times the elements at the bottom of a screen.
                    <br>
                    Example: A screen is loaded and after 10s the user interacts with element A. 
                    In a second test, the user only clicked on the element after 2s. 
                    The average time before the click is therefore 15s.
                `
            },
            {
                "id": "analytics.canvas.kpi.coverage",
                "title": "Test Coverage",
                "body": `
                    The test coverage tell you how many time a screen was tested. 
                    This metric indicates how easy the screen is to find. The gauge 
                    shows the absolute number of screen tests in the middle. 
                    The position of the ring indicates the relative test ratio.
                    <br>
                    Example: Your prototype has two screens and was tested by two users. 
                    The first user saw both screens, whereas the second user saw only the 
                    first screen. This means there are two test. The relative frequency 
                    of the first screen is 100% because it was tested by every users, 
                    where is the relative frequency of the second screen is 50%.
                    
                `
            },
            {
                "id": "analytics.canvas.kpi.dwell",
                "title": "Dwell Time",
                "body": `
                    The average dwell times tells you how much times the users have in average spend 
                    on a screen. A high number might indicate that the users had to perform a lot of 
                    interactions, e.g. fill out a form. However, it can also indicate that the 
                    users had some problems, for instance finding the right elements.
                    The gauge shows the absolute dwell time and also puts in in relation to the total test duration.
                    
                    <br>
                    Example: Five tests were done, each taking exactly 60 seconds. 
                    The users spend 20, 30, 30, 30 and 40 seconds in the first screen. 
                    The average dwell time is 30 seconds, and the relative dwell 
                    time 50% ((20 + 30 + 30 +30 + 40) / (5*60)).
                `
            },
            {
                "id": "analytics.canvas.kpi.screen-views",
                "title": "Screen views",
                "body": `
                    The screen views tell you how many time a screen was shown. If this number is 
                    much higher than the "Test Views", this indicates that the users came often 
                    back to this screen. The gauge shows the absolute number in the middle. 
                    The position of the ring indicates the relative frequency.
                    <br>
                    Example: Your prototype has two screens and was tested by two users. 
                    The first user saw both screens, whereas the second user saw only the 
                    first screen. This means there were three screen loads. The relative 
                    frequency of the first screen is thus 67% and of the second 33%.
                
                `
            },
            {
                "id": "analytics.canvas.kpi.screen-clicks",
                "title": "Screen Background Clicks",
                "body": `
                    The background clicks tell you how many times the users have clicked on the screen, 
                    and not on a widget. A high number indicates often problems, for instance, that the 
                    users expect certain elements to be clickable. The gauge shows the absolute number, 
                    and the position indicates the relative frequency with respect to all clicks on the screen.
                    <br>
                    Example: During the test, 100 events were recorded by three users on a given screen A. 
                    10 events were on screen A. The relative frequency is therefore 10%
                `
            },
            {
                "id": "analytics.canvas.kpi.screen-widget-clicks",
                "title": "Screen Widget Clicks",
                "body": `
                    The widget clicks tell you how many times the users have clicked on on elements. 
                    The number indicates how much "work" the users have performed on a certain screen. 
                    The gauge shows the absolute number, and the position indicates the relative 
                    frequency with respect to all clicks on the screen.
                    <br>
                    Example: During the test, 100 events were recorded by three users in screen A. 
                    90 events were on the five widgets of the screen. The relative frequency is therefore 90%
                `
            }
        ]
    }
]