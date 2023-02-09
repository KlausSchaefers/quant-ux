export let texts = [
    {
        "id": "segments",
        "name":"Screen Segments",
        "title": "Screen Segments",
        "body": `
            Screen Segments allow you to embed a screen in another screen, for instance, to allow
            vertical or horizontal scrolling. To create a screen segment perform the following steps:
            <br>
                <ol>
                    <li>
                        Create a screen
                    </li>
                    <li>
                        Press <strong>W</strong> to open the widget menu and select the <strong>Screen Segment</strong>
                        widget. Place it on the screen.
                    </li>
                    <li>
                        Create a second screen and select it.
                    </li>
                    <li>
                        Select the <strong>Segment</strong> Checkbox. You can now resize the screen freely to match the
                        dimensions of the Screen Segment widget. A larger size will result in a scroll behavior.
                    </li>
                    <li>
                        Select the Screen Segment widget. In the properties section, click 
                        on the <strong>Select Screen Segment</strong> option. A dialog will show up, listing all the
                        segment screens.
                    </li>
                    <li>
                        Select the second screen and press save.
                    </li>
                </ol>
            <br>

            <p class="MatcHelpCallout">
                Please note that the screen background will not be copied. 
                Set the background on the segment widget instead.
            </p>

            You can also bind a screen segment to a data variable, to enbale dynamic chaning of the content.
            In this case, the screen segment will load the screen, where the name matches the 
            value in the variable. If the value is set to "Start", the start screen
            will be loaded, if the value is "Welcome", the welcome screen will be loaded. 
            <br>
           
            
        `
    }
]
