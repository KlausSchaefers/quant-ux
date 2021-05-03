export let texts = [
  {
      "id": "components",
      "name":"Components",
      "title": "Components",
      "css": "",
      "body": `
          Components encapsulate common styles, e.g. buttons, links and input elements. Once you have creates,
          the archetypes of your design system, you can turn them into components and reuse them at different
          place in the prototype. The bug benefit, over simply copy-pasting the elements is, that changes in a
          component, will be automatically updates in all instances.
      `,
      "paragraphs": [
        {
          "id": "components.create",
          "title": "Create a component",
          "body": `
             To create a component perform the following steps:

             <ol>
                <li>
                   Create an UI element as style is as you like. You can also group several elements.
                </li>
                <li>
                    Select the element. In the toolbar on top, the 'Create Component'.
                </li>
                <li>
                    Enter the name of the component in the dialog.
                </li>
                <li>
                    Click <span class="MatcButton">Create</span>
                </li>
              </ol>
          `
        },
        {
          "id": "components.use",
          "title": "Reuse a component",
          "body": `
             To create reuse a component do:

             <ol>
                  <li>
                  Press <strong>W</strong> or selecting <span class="mdi mdi-puzzle-outline"/> icon. The widget
                  menu will open
                </li>
                <li>
                    Select the 'My Componets' section.
                </li>
                <li>
                    Click on the component you would like to add.
                </li>
              </ol>
          `
        },
        {
          "id": "components.update",
          "title": "Update a component",
          "body": `
             At some point in time, you might want to update a component.

             <ol>
                <li>
                    Select an instance of a component.
                </li>
                <li>
                    Perform the changes.
                </li>
                <li>
                    Click on 'Update Component' in the top toolbar.
                </li>
              </ol>
          `
        }
      ]
  }
]