export let texts = [
  {
    id: "testing",
    name: "User Testing",
    title: "User Testing",
    css: "MatcHelpTopicSpacer",
    body: `
          To create a good user interface, you need to test it with real users. It is best to validate your assumptions 
          right after the first iteration. The more and the earlier you test, the better. Every user that tests your UI,
          will give you valuable feedback.
      `,
    paragraphs: [
      {
        id: "testing.share",
        title: "Sharing Link",
        body: `
                  To start testing, you need to create a shareable link. Simply navigate to the prototype,
                  and click on the 'Share' button. A dialog will appear. Copy the first link and share it with your
                  testers. When they open the link, the prototype will be launched and they can try it out.
              `,
      },
      {
        id: "testing.landing",
        title: "Test Settings",
        body: `
                When the users load the shared link, they will come to a landing page. On this page, they will
                see a welcome message with an explanation as well as a list of tasks. You can customize the following settings:

                <ol>
                    <li>
                        <b>Welcome Message</b>: You can customize the welcome message that will be shown to the users. Make sure 
                        the welcome message encourages them to start the test, but also explains what is the purpose of the test,
                        and what is expected from them.
                    </li>
                    <li>
                        <b>Splash Image</b>: You can upload a custom background image for the landing page. This allows you to keep
                        the test experience close to your brand.
                    </li>
                    <li>
                        <b>Single Test per user</b>: Sometimes users open the prototype several times, which can mess up the 
                        collected data. You can avoid the this, by enabling the checkbox "Record data only for the 
                        first time a user tests the prototype." If checked, only the first test session is recorded.
                    </li>
                </ol>
            `,
      },

      {
        id: "testing.tasks",
        title: "Creating Tasks",
        css: "",
        body: `
                Often you want your users to fulfil one or more tasks. You can tell your users about the tasks,
                by creating a Task. A task has a name and description, that will be shown to the users before the
                prototype is launched. In addition, you can also specify the number of steps that make up the test, for example,
                the users should click on the 'Start' button, and navigate to the 'SignUp' screen. To create a task,
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
                        task that the users should do. The relevant steps will be shown on the lower left side.
                        You can remove not needed steps, by clicking on them.
                    </li>
                    <li>
                        By default, only the screen loads will be considered for steps. If you want to define
                        a fine grained task, unselect the 'Record only screen views' checkbox.
                    </li>
                    <li>
                        Click on 'Save'
                    </li>
                </ol>

            `,
      },
      {
        id: "testing.howmany",
        title: "How Many Users",
        body: `
              To gather statistically relevant results, one requires at least 30 users. However, often it is difficult
              to get access to a large number of users. Therefore the literature suggests to test with at least 5 different users.
            `,
      },
      {
        id: "testing.transcribeVoice",
        title: "Think-aloud Testing",
        css: "",
        body: `
                Think-aloud Testing is a powerful technique where testers narrate their thoughts, feelings, and
                decisions out loud while using your prototype. This gives you direct insight into how users
                understand and experience your design — not just what they click, but <em>why</em> they click it.

                <p class="MatcHelpContentParagraph">
                    When you enable the <b>Think-aloud Testing</b> checkbox, testers will be given the option to
                    turn on their microphone at the start of the session. Their spoken words are automatically
                    transcribed to text and saved alongside the interaction data, so you can review exactly what
                    each tester was thinking at every step of the test.
                </p>

                <p class="MatcHelpContentParagraph">
                    <b>Why is Think-aloud Testing so valuable?</b>
                </p>

                <ol>
                    <li>
                        <b>Uncover hidden confusion</b>: Click data tells you <em>what</em> went wrong.
                        Think-aloud narration tells you <em>why</em>. A tester might say "I expected this button
                        to open a menu" — feedback you would never get from metrics alone.
                    </li>
                    <li>
                        <b>Validate your language and labels</b>: Testers often read UI labels out loud and
                        react to them in real time, revealing whether your wording is clear or misleading.
                    </li>
                    <li>
                        <b>Surface unexpected mental models</b>: Users bring their own assumptions to your
                        interface. Hearing them reason through the prototype helps you understand the gap between
                        what you designed and what users expect.
                    </li>
                    <li>
                        <b>Rich qualitative data without moderation</b>: Normally, think-aloud studies require
                        a facilitator in the room. With automatic transcription, you get the same qualitative depth
                        from remote, unmoderated sessions — at any scale.
                    </li>
                    <li>
                        <b>Easy to review and share</b>: Transcripts are searchable and easy to share with your
                        team, making it simple to identify recurring themes and build a shared understanding of
                        user needs.
                    </li>
                </ol>

                <p>
                    Testers are never forced to use the microphone — participation is always optional. If a tester
                    declines, the session is still recorded normally. This ensures you never lose test data while
                    still giving willing participants the chance to provide richer feedback.
                </p>
            `,
      },
    ],
  },
];
