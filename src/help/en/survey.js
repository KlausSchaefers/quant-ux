export let texts = [
  {
      "id": "survey.intro",
      "name":"Qualitative Surveys",
      "title": "Qualitative Surveys",
      "body": `
          When users test a Quant-UX prototype, the user input is saved. For instance, a Star Rating that they are giving is stored.
          You can use this mechanism to also collect qualitative feedback from the users.
          <br>
          You can see the survey answers in the "Dashboard" section.

      `,

      "paragraphs": [
        {
          "id": "survey.howto",
          "title": "Create Survey",
          "body": `
             To create a survey in your prototype, simply use the normal input elements, such as Star Ratings or input boxes. You have to
             create a data binding for every element that you want to be visible in the survey section. To create for
             instance a Star Rating after at the end of the test do:

             <ol>
                <li>
                    Add a new screen to your prototype, and link it such as it is the last screen in the flow.
                </li>
                <li>
                    Add a Star Rating element to the screen
                </li>
                <li>
                    Select the new element
                </li>
                <li>
                    In the properties section click on "Add Data Binding" in the data section in the properties panel
                </li>
                <li>
                    Create a new varibale in the dialog, for instance "Satisfaction"
                </li>
              </ol>
          `
        }
      ]
  }
]