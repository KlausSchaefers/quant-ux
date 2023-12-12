import YAMLImporter from "../../src/core/ai/YAMLImporter"

test('YAMLImporter.spec.js - Simple', async () => {

    const yaml = `
        CONTAINER:
            FLEX-DIRECTION: COLUMN
            CHILDREN:
                - LABEL:
                    TYPE: Headline
                    CONTENT: "Join the Party!"
                - LABEL:
                    TYPE: Paragraph
                    CONTENT: "Come on in! The more the merrier. But first, we need some details. 😜"
                - INPUT:
                    TYPE: Text
                    PLACEHOLDER: "Username"
                - INPUT:
                    TYPE: Password
                    PLACEHOLDER: "Password"
                - INPUT:
                    TYPE: Password
                    PLACEHOLDER: "Confirm Password"
                - INPUT:
                    TYPE: Text
                    PLACEHOLDER: "Email"
                - INPUT:
                    TYPE: Checkbox
                    PLACEHOLDER: "I agree to terms and conditions"
                - CONTAINER:
                    FLEX-DIRECTION: ROW
                    CHILDREN:
                    - LABEL:
                        TYPE: LABEL
                        CONTENT: "Already have an account?"
                    - LABEL:
                        TYPE: LABEL
                        CONTENT: "Log in!"
                    - BUTTON:
                        CONTENT: "Sign Up and Start Laughing!"
    `
   
    const importer = new YAMLImporter()
    const result = await importer.yamlQuantUX(yaml)
    expect(Object.values(result.screens).length).toBe(1)
})