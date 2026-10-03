/**
 * The tunable numbers of the AI agent, in one place.
 *
 * None of these were measured on a benchmark yet - they are starting points
 * picked from a few real runs. Keeping them here (instead of as local
 * constants spread over the tools) makes them visible and lets an eval
 * harness tune them without touching the code that uses them.
 */
const AIConfig = {

    agent: {
        // screens one create_app run generates at most
        maxScreens: 6
    },

    layout: {
        // px between the generated screens on the canvas
        screenGap: 64,
        // a screen narrower than this is designed as a mobile app
        mobileMaxWidth: 500
    },

    validation: {
        // px of rounding error from getBoundingClientRect() that never counts
        overflowTolerance: 4,
        // px a page may be wider than the screen before it is worth a retry;
        // less is clipped by HTML2QUX without losing content
        maxClippedOverflow: 16,
        // badness of an error vs a warning when keeping the best attempt: any
        // error (no or empty screen) outweighs any number of warnings
        errorWeight: 1000,
        warningWeight: 1,
        // how many overflowing elements the retry feedback names
        maxReportedOverflowElements: 5,
        // and how much of their text and class list
        maxReportedTextLength: 30,
        maxReportedClasses: 2,
        // regenerations of a screen after the first attempt
        maxRetries: 2,
        // two texts overlap when they share more than this part of the
        // smaller one's box
        textOverlapRatio: 0.3,
        // how many text problems (overlap, does not fit) one check reports
        maxReportedTextIssues: 3
    },

    /**
     * HTML2QUX measures the generated HTML with the canvas fonts. A web font
     * that never loads would otherwise block the import forever.
     */
    import: {
        // ms to wait for the capture iframe to load its fonts
        fontLoadTimeout: 3000,
        // ms a whole HTML2QUX.run() may take (loading the HTML, the fonts and
        // parsing) before it gives up, so one broken screen never blocks a run
        parseTimeout: 20000
    },

    /**
     * The canvas camera when the first generated screen is focused (see
     * Render.zoomToBox).
     */
    focus: {
        // share of the visible canvas the screen may fill
        fitRatio: 0.85,
        // below this zoom a whole screen is too small to read, so a long
        // screen is fitted by its width and shown from the top instead
        minReadableZoom: 0.5,
        minZoom: 0.25,
        // never zoom in past 100%
        maxZoom: 1,
        topMargin: 40
    }
}

export default AIConfig
