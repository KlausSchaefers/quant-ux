export let texts = [
  {
      "id": "survey.intro",
      "name":"User Surveys",
      "title": "User Surveys",
      "body": `
          When users test a Quant-UX prototype, the user input is saved. For instance, a Star Rating that they are giving is stored.
          You can use this mechanism to also collect qualitative feedback from the users.
          <br>

          <p class="MatcHelpCallout">
             You can see the survey answers in the "Dashboard" section.
          </p>
          
          Quant-UX comes with many elements that can be used to collect direct user feedback. In the widget menu in the design canvas,
          you can find for instance Star Ratings or NPS feedback elements.
 

      `,
     
      "paragraphs": [
        {
          "id": "survey.howto",
          "title": "Create Survey",
          "body": `
             To create a survey in your prototype, simply use the normal input elements, such as Star Ratings or input boxes. You have to
             create a data binding for every element that you want to be visible in the survey section. To create for
             instance a Star Rating at the end of the test follow these steps:

             <ol>
                <li>
                    Add a new screen to your prototype, and link it as the last screen in the flow.
                </li>
                <li>
                    Add for instance a Star Rating element to the screen
                </li>
                <li>
                    Select the new element
                </li>
                <li>
                    Select the 'Prototype' view
                </li>
                <li>
                    Select the 'Survey Element' checkbox.
                </li>
              </ol>
          `,
          "image": {
                "src": '/help/SurveyCanvas.png',
                "caption": "The survey checkbox is in the Prototype view"
            }
        },
        {
            "id": "survey.tasks",
            "title": "Tasks",
            "body": `
               You can also show for each user the successful task. Simply select "Show Tasks" in the "Options" menu.

               <br>
               By comparing the user feedback and the task success, it becomes easy to varify if there is a correlation between the 
               objective performance of a tester and the implicit, personal perception of the app. 
               If there is a mismatch, it might make sense to check the screen recording for further details.
  
            ` ,
            "image": {
                "src": '/help/SurveyTask.png',
                "caption": "The survey section showing the successfull tasks."
            }
          }
      ]
  }
]
