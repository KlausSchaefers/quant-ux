export let texts = [
    {
        "id": "validation",
        "name":"Form Validation",
        "title": "Form Validation",
        "body": `
            Quant-UX supports form validation. You can specify for most of 
            the widgets if the user input is <strong>required</strong>. For text boxes, you 
            can even specify different input formats. You can, for instance, 
            define that a certain input field requires valid email addresses, 
            whereas another widget requires numbers larger than zero. Quant-UX ships 
            with a number of built in patterns, such as phone numbers, dates, times or 
            email addresses, but you can also specify custom patterns.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/RXxzpK7hFck"
        },
        "paragraphs": [
            {
                "id": "validation.intro",
                "title": "When to use",
                "body": `
                    When you are designing a complex workflow, data validation is mandatory to
                    prevent users from entering the wrong data. Thus, validation is also 
                    crucial during prototyping, if you want to create a realistic prototype.
                `
            },
            {
                "id": "validation.enable",
                "title": "Enable Validation",
                "body": `
                    To enable validation, select a widget and select the <strong>Required</strong> checkbox 
                    in the <strong>Data & Validation</strong> section of the property panel. You can also
                    set for certain types of widgets the required input pattern. To change this, click on the
                    <strong>No Validation</strong> button to select the type of pattern that is allowed.
                `
            },
            {
                "id": "validation.feedback",
                "title": "User Feedback",
                "body": `
                    Of course, simply validating the input is not enough. In case the input is wrong, 
                    you want to give some feedback to the user. With Quant-UX you can do this in two ways. 
                    First, you can define a special <strong>error style</strong> of the error case, 
                    and customize the appearance of the widget in case the input is wrong. 
                    For instance, the border of the input field can turn red. Second, you can 
                    also specify a so called <strong>error label</strong>, which will be shown 
                    when the user input is wrong.

                `
            },
            {
                "id": "validation.links",
                "title": "Block Navigation",
                "body": `
                    In most scenarios, you don’t want the user to progress in the workflow 
                    when the input is wrong. For example, the user should only be able 
                    to move on in the sign-up process, when he has entered a valid 
                    email address. Therefore, you can also <strong>enforce data validation on links</strong>. 
                    The linked screen will only be loaded when all fields 
                    in the current screen are valid. 

                `
            }
        ]
    }
]

