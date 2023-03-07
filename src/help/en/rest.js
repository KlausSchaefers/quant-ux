export let texts = [
    {
        "id": "rest",
        "name":"Web Services",
        "title": "Web Services",
        "body": `
            With the new Web Service functionality you can load data from the internet to show in your
            prototype. You can also use the web services to send user data from your prototype to a web service
            and show the results.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/9Ex8do5vWaY"
        },
        "paragraphs": [
            {
              "id": "resyt.howto",
              "title": "Create a web service",
              "body": `
                 To create a web service, you need to first drop the "Web Service" element onto the canvas. If
                 you double click the element, or select it and click on the "Configuration" button in the properties
                 panel, the configuration dialog will be opened. In here you can configure which URL to call, which
                 HTTP method to use and which data to send.

                 There are three ways how a web service can be called, this is configured via the "Trigger" element
                 in the properties panel.
    
                 <ol>
                    <li>
                       First, you can link the element to a button. When the button is clicked, the web service is called.
                    </li>
                    <li>
                        Second, the web service can be called, when the simulator is started. Select "Loaded Trigger". This
                        option is useful, to load initial data.
                    </li>
                    <li>
                        Third, you can also execute the web servicein an interval. Select "Repeat Trigger" 
                        and set the duration to the desired seconds. 
                    </li>
                   
                  </ol>

                A web service element can be also linked to a screen, a script or a logic elements. Once the web service is 
                executed, the linked screen is shown, or the linked logic elements are executed.  

              `
            }
          ]
    }
]