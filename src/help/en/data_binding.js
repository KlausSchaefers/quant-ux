export let texts = [
    {
        "id": "databinding",
        "name":"Data Binding",
        "title": "Data Binding",
        "body": `
            Sometimes you want to carry over user data from one screen to another. For these kinds of scenarios,
            you can use the data binding functionality. You can also use data binding in the Logic Operators.
        `,
        "video": {
            "src": "https://www.youtube.com/embed/h1C0jbQHlbU"
        },
        "paragraphs": [
            {
                "id": "databinding.intro",
                "title": "How it works",
                "body": `
                    In Quant-UX there is hidden data which allows you to store and read data, while
                    the prototype is tested. You can think of the data as a simple JSON object
                    with different properties.

                    <br><br>
                    Imagine you build a form for the users to sign up for a service. They need
                    to enter their email, name, last name and address. The data might look 
                    like this:

                    <div class="MatcHelpExample">
             
                        <pre>
{
    "email": "PedroHauten@gmail.com"
    "name": "Pedro",
    "lastname": "Hauten",
    "address": {
        "street": "Cavar de Castelo",
        "zip": "34414-100",
        "city": "Warburgo",
        "country":"Portugal"
    }
}
                        </pre>
                    </div>

                    Data Binding allows you to link this data to the UI elements, e.g. a text input element.
                    If you want to link for example a text box to the email of the user, the correct variable name would
                    be "email". If you want to link to the street, the name would be "address.street". 
                    <br>
                    Once the user has entered data, the information is stored. You can use it in the following
                    screens, e.g. to show it again, maybe as a label. You can also use the data for rule based navigation
                    or send it with the <b>Web Service</b> to a real server.

                    <br><br>

                    To assign or edit the variable follow the steps below:

                    <ol>
                        <li>
                            Select the element
                        </li>
                        <li>
                            Click on <span class="MatcButton">Prototype</span> at the top
                        </li>
                        <li>
                            In the data section click on "<b>Add Data Binding</b>"
                        </li>
                        <li>
                            A dialog will open, that allows you to define the name of
                            the variable you want to write to. You can also select
                            an existing variable
                        </li>
                    </ol>

                    

                    <p class="MatcHelpCallout">
                        Most UI elements have only one variable that is used for input and output.
                        An example is a simple textbox, which reads or writes the text. Some elements have
                        more variables, for example, a Dropdown element. It has an input and output as well as  
                        a list of menu items. These could also be read from the data model or even a web service.
                    </p>
                `
            }
        ]
    }
]
