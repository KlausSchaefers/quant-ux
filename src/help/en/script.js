export let texts = [
    {
        "id": "scripts",
        "name":"Scripts",
        "title": "Scripts",
        "body": `
            Script components allow you to run small JavaScripts to make your prototypes even more interactive. You can for example
            use them to set databinding values, load or send data to a server, or calculate dynamic values, like the sum
            of two input fields.
        
            <p class="MatcHelpCallout">
                Scripts are  currently in beta phase. You need to enable them in the settings menu. Click on the menu ( <span class="mdi mdi-menu"/> ) ,
                select "Settings" and tick the "Enable Beta Features" checkbox.
            </p>
            
        `,
        "video": {
            "src": "https://www.youtube.com/embed/NyqgRo79vfU"
        },
        "paragraphs": [
            {
                "id": "script.intro",
                "title": "Introduction",
                "body": `
                    Select the <span class="mdi mdi-code-tags"/> icon in the right toolbar and drop the widget on the canvas. When you select the script
                    widget, you can see in the right menu an "Edit Script" button. Clicking it, well open the Script editor. The editor has on the right side,
                    the simulator and on the left a simple JavaScript editor. You can enter you scripts in there. Click on "Run" to execute and test the script.
                    In the "Console" tab, you can see the output of the script.
                `,
                "image": {
                    "src": '/help/ScriptEditor.png'
                }
            },
            {
                "id": "script.basics",
                "title": "Basics",
                "body": `
                    The script has access to Quant-UX objects, the "data" binding and the "qux" object.
                    
                    <ol>
                        <li> 
                            The <b>data</b> object allows you to read
                            and write data through the data binding that is defined for the components in your prototype.
                        </li>
                        <li>
                            The <b>qux</b> object allows to change the styles for the 
                            components or to change the visibility.
                        </li>
                        <li>
                            The <b>event</b> object shows from which widget the script was triggered.
                        </li>
                    </ol>

                 

                    Scripts can be executed on three different events.

                    <ol>
                        <li> 
                            If the user <b>clicks</b> on a component and the component is wired to a script. Use this 
                            to trigger the actions only on explicit user interactions.
                        </li>
                        <li>
                            On <b>data-binding</b> changes. For instance the user changes the value of a text field. Use
                            this to update other components are set dynamic data-binding values.
                        </li>
                        <li>
                            When the simulator is <b>loaded</b>. Use this to prefetch data, or set data.
                        </li>
                    </ol>

               
                    The script can also return a value. If the value matches the name if a 
                    screen, the simulator will load the corresponding screen. The following sections 
                    contain some sample scripts for common use cases.
                    
                `,
              
            },
            {
                "id": "script.setting",
                "title": "Reading & Writing data",
                "body": `
                   To access data, you need to use the data-binding mechanism. Suppose you want to calculate the sum
                   of two text fields. You need to 
                    
                    <ol>
                        <li> 
                           Create two text fields and a label to show the sum.
                        </li>
                        <li>
                            Select the first text field and set the data bining to "valueA"
                        </li>
                        <li>
                             Select the second text field and set the data bining to "valueB"
                        </li>
                        <li>
                            Select the label and set the data bining to "sum"
                        </li>
                        <li>
                            Add a script component to the canvas 
                        </li>
                        <li>
                            Add a button and wire it to the script. When the user clicks on the button the script is executed.
                        </li>
                    </ol>

                    Your prototype could look like:
                
                    
                `,
                "image": {
                    "src": "/help/ScriptDataBinding.png"
                }
              
            },
            {
                "id": "script.setting2",
                "title": "",
                "body": `
                   Now open the script editor and enter the following script. "

                   <pre class="MatcHelpCode">data.sum = data.valueA * 1 + data.valueB * 1</pre>

                   The script will
                   read the user inout from the first text field, which is saved in "data.valueA" and add
                   the value of the second field ("data.valueB"). The result is written to  "data.sum" and thus shown
                   in the label.
                
                   <p class="MatcHelpCallout">
                        Text fields return string values. You need to cast them to numbers, e.g. by 
                        multiplying with 1.
                    </p>

                `,
            },
            {
                "id": "script.programmatic",
                "title": "Programmatic Navigation",
                "body": `
                    To navigate after the exuction of a script to a specific screen just return the name of the screen. You can
                    also use it with the data binding to build conditional navigation. The follwoing example will show "Screen A"
                    if 'a' is entered into a text box, and otherwise "Screen B"
                  
                    <pre class="MatcHelpCode">
if (data.valueA === 'a') {
    return 'Screen A'
} else {
    return 'Screen B
}
</pre>
                `,
            },
            {
                "id": "script.auto1",
                "title": "Automatic calculations",
                "body": `
                    You can also run the script automatically, every time the data has changed. Also, you 
                    want to initialize some values when the prototype is tested. Perform the following steps:


                    <ol>
                    <li> 
                       Create a "Grid" elements, which can repeat the child elements.
                    </li>
                    <li>
                        Add a single text field into the grid.
                    </li>
                    <li>
                       Create a label and set the text to "Sum: {0}". The {0} is a placeholder
                       and will be later replaced.
                    </li>
                    <li>
                        Bind the "Grid" to a "items" data-binding.
                    </li>
                    <li>
                        Bind the text field to a "value" data-binding.
                    </li>
                    <li>
                        Bind the label to a "sum" data-binding.
                    </li>
                    <li>
                        Add two Script components. Rename the first to "Load" and the second to "Sum"
                    </li>
                </ol>

                The prototype coould look like this:


                `,
                "image": {
                    "src": "/help/ScriptAuto.png"
                }
            },
            {
                "id": "script.auto2",
                "title": "",
                "body": `
                   Select the "Load" script and enter the following value:

                   <pre class="MatcHelpCode">
data.items = [
    {value:1},
    {value:2},
    {value:3}
]</pre>

                To execute the script on load, change the trigger in the right properties panel to "Loaded Trigger".

                Now the script is excuted when the simualator is launched. It will set the "items" variable to the 
                list of objects. The "Grid" will now loop over the list and create a text field for each element in the list, 
                because it is bound to "items". The text fields
                will be bound to the "value". So the the first element is bound to "items[0].value", while the second
                is bound to "items[1].value" and so on.
                

                `,
            },
            {
                "id": "script.auto3",
                "title": "",
                "body": `
                   Select the "Sum" script and enter the following value:

                   <pre class="MatcHelpCode">
let sum = 0
data.items.forEach(item => {
    sum += item.value * 1
})
data.sum = sum</pre>

                To execute the script on any input change, select  the trigger the "Data Trigger" in the properties.

                When the user changes the value (and after the first load), the script will calculate the sum and set it to the "data" object.
                

                `,
            },

            {
                "id": "script.toggle1",
                "title": "Toggle Visibility",
                "body": `
                    To toggle the visiblity of an element you need to:


                    <ol>
                        <li> 
                            Create a screen called "ToggleScreen"
                        </li>
                        <li>
                            Create a button
                        </li>
                        <li>
                            Create an element to toggle, e.g. a rectangle. Call it "ToggleCntr"
                        </li>
                            Add a Script components and wire it to the button
                        </li>
                    </ol>
                  
                    the result could look like this.
                `,
                "image": {
                    "src": "/help/ScriptToggle.png"
                }
            },

            {
                "id": "script.toggle2",
                "title": "",
                "body": `

                Now edit the script and add the following code:

                <pre class="MatcHelpCode">
let toggleScreen = qux.getScreen('ToggleScreen')
let widget = toggleScreen.getWidget('ToggleCntr')
widget.toggle()                
                </pre>

                The script uses the qux API object. 

                <ol>
                    <li> 
                       In the first line it well get the screen by it's name.
                    </li>
                    <li>
                       In the second line, we get the "ToggleCntr"
                    </li>
                    <li>
                       In the last line we will toggle() it's visibility.
                </ol>


                <p class="MatcHelpCallout">
                    You can also use the <b>hide()</b> and <b>show()</b> methods to 
                    set the visiblity depending on a value!
                </p>

                If you want to hide several elements, you need to group them and use the 
                <b>getGroup()</b> method.

                <pre class="MatcHelpCode">
let toggleScreen = qux.getScreen('ToggleScreen')
let group = toggleScreen.getGroup('ToggleGroup')
group.toggle()           
                </pre>
                  
                `
            },

            {
                "id": "script.style",
                "title": "Styles",
                "body": `
                    You can also set the style of an object. Let's assume we want to
                    make an element red, if the value is too low. The code would look like:

                    <pre class="MatcHelpCode">
let screen = qux.getScreen('Screen')
let widget = screen.getWidget('Element')
if (data.valueA * 1 < 100) {
    widget.setStyle({color: 'red'})  
} else {
    widget.setStyle({color: 'black'})  
}
                 
                    </pre>

                    The script uses the <b>setStyle()</b> method to set a new style. You simple need to pass
                    a JavaScript object of key-value pairs. The keys are the CSS property you want to change,
                    the value is the corresponding CSS value. You can also pass several properties in one call. 
                    
                    <p class="MatcHelpCallout">
                        Quant-UX follows the standard JavaScript way of set CSS styles. For instance the 
                        "border-top-color" would have the key "borderTopColor"
                    </p>

                `,
            }
        ]
    }
]
