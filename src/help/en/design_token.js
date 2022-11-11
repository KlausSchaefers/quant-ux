export let texts = [
  {
      "id": "design_tokens",
      "name":"Design Tokens",
      "title": "Design Tokens",
      "body": `
          A design token is a global style, such as color, border or shadow. You can 'link' the tokens to your
          widgets. Updates on the design tokens will be visible on all
          widgets that are lined to the particular style.
      `,
      "paragraphs": [
          {
              "id": "design_token.add",
              "title": "Create a design token",
              "body": `
                  To create a design token follow these steps:
                  <ol>
                      <li>
                          Create a widget and style it as you like. For instance, define a background color.
                      </li>
                      <li>
                          Click the <span class="mdi mdi-dots-horizontal"></span> icon and select 'Create Token'. Enter a
                          name for the token in the dialog and press 'Create'.
                      </li>
                      <li>
                         Now the view will change, and the name of the token will be shown.
                      </li>
                  </ol>

              `
          },
          {
            "id": "design_token.link",
            "title": "Change or add a design token",
            "body": `
                To link an existing design token to a widget perform the following steps:
                <ol>
                    <li>
                        Select a widget
                    </li>
                    <li>
                        Click the <span class="mdi mdi-dots-horizontal"></span> icon and select the style you want to link. If the widget
                        is already linked, the new style will be applied.
                    </li>
                    <li>
                       Now the view will change, and the name of the token will be shown.
                    </li>
                </ol>

            `
            }, {
            "id": "design_token.update",
            "title": "Update a design token",
            "body": `
                To update a design token follow these steps:
                <ol>
                    <li>
                        Select a canvas. The list of all design tokens will be shown.
                    </li>
                    <li>
                        Hover over the token you want to change, and click on the <b><span class="mdi mdi-cogs"></span> </b> icon.
                    </li>
                    <li>
                       Change the style or the name in the popup.
                    </li>
                    <li>
                        Press <span class="MatcButton">Save</span>.
                    </li>
                    <li>
                        All instances of the style will be updated.
                    </li>
                </ol>

            `
        }
      ]
  }
]