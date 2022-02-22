export let texts = [
  {
      "id": "testing",
      "name":"User Testing",
      "title": "User Testing",
      "css": "MatcHelpTopicSpacer",
      "body": `
          To create a good user interface, you need to test it with real users. Best, right after the first iteration
          to validate your assumptions. The more and the earlier you test, the better. Every user that tests your UI,
          will give you valuable feedback.
      `,
      "paragraphs": [
          {
              "id": "testing.share",
              "title": "Sharing Link",
              "body": `
                  To start testing, you need to create a share link. Simply navigate to the prototype,
                  and click on the 'Share' button. A dialog will appear. Copy the first link and share it with your
                  testers. When they open the link, the protoype will be launched and they can try it out.
              `
          },
          {
            "id": "testing.landing",
            "title": "Landing Page",
            "body": `
                When the users load the share link, they will come to a landing page. On this page they will
                see a welcome message with an explanation as well as the list of tasks. You can customize the following settings:

                <ol>
                    <li>
                        <b>Welcome Messsage</b>: You can customize the welcome message that will be shown to the users. Make sure 
                        the welcome message encourages them to start the test, but also explains what is the purpose of the test,
                        and what is expected from them.
                    </li>
                    <li>
                        <b>Background Image</b>: You can upload a custom background image for the landing page. This allows you to keep
                        the test experience close to your brand.
                    </li>
                </ol>
            `
        },
          {
            "id": "testing.tasks",
            "title": "Creating Tasks",
            "css": "",
            "body": `
                Often you want your users to fulfill one or more tasks. You can tell your users about the tasks,
                by creating a Task. A task has a name and description, that will be shown to the usersa before the
                prototype is launched. In addtion, you can also specify a number of steps that make up the test, for example
                the users soould click on the 'Start' button, and navigate the the 'SignUp' screen. To create a task,
                follow these steps:

                <ol>
                    <li>
                        Create a prototype
                    </li>
                    <li>
                        Navigate to the 'Test' tab
                    </li>
                    <li>
                        Click 'Add Task'. A dialog will show up.
                    </li>
                    <li>
                        Enter a name and description, that will be shown to the users.
                    </li>
                    <li>
                        If you want to create steps, use the prototype on the right side. Simply perform the
                        task that the users should do. The relevant steps will be show in the lower left side.
                        You can remove not needed steps, by clicking on them.
                    </li>
                    <li>
                        By default, only the screen loads will be considered for steps. If you want to define
                        a a fine grained task, unselect the 'Record onyl screen views' checkbox.
                    </li>
                    <li>
                        Click on 'Save'
                    </li>
                </ol>

            `
        },
        {
            "id": "testing.howmany",
            "title": "How Many Users",
            "body": `
              To gather statistaically relevant results, one requires at least 30 users. However, often it is difficult
              to get access to a large number of users. Therefore the litarure suggest to test with at least 5 different users.
            `
        }
    ]
  }
]