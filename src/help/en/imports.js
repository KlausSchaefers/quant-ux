export let texts = [
    {
        "id": "import",
        "name":"Import",
        "title": "Import",
        "body": `
           You can import images (png, jpg) or Figma projects into Quant-UX.
        `,
        "paragraphs": [
            {
                "id": "import.bitmap",
                "title": "Image Import",
                "body": `
                    You can import PNG and JPEG files from other tools into Quant-UX. Simply drag and drop them on the canvas,
                    and the images will be uploaded as screens. If you drop the images within an existing screen, they will be
                    added as images.
                    <br>
                    As an alternative, you can also select the <span class="mdi mdi-image"/> image icon when
                    you have a screen or image widget selected to open the Upload dialog. Once the dialog is open, you can drag and drop
                    you files in here, or select already uploaded files.
                `
            },
            {
                "id": "import.figma",
                "title": "Figma Import",
                "body": `
                    You can import Figma projects into Quant-UX by opening the Import wizard. Before you start you need to create an Access key:

                    <ol>
                        <li>
                            Login to your Figma account.
                        </li>
                        <li>
                            Open the "Account Settings" in the top left menu
                        </li>
                        <li>
                            Go to the "personal Access Tokens" section
                        </li>
                        <li>
                            Click on "Create new token"
                        </li>
                        <li>
                            Copy the generated token, and save it somewhere save.
                        </li>
                    </ol>

                    You need to create the token only once, it is valid for all projects in Figma.
                    Once you have a token, perform the following steps:

                    <ol>
                        <li>
                            Click the menu (<span class="mdi mdi-menu"/>) and select "Import"
                        </li>
                        <li>
                            Select the "Figma" tab
                        </li>
                        <li>
                            Enter your access key and copy the url of the Figma project.
                        </li>
                        <li>
                            Click on "Import"
                        </li>
                    </ol>
                `
            }
        ]
    }
]