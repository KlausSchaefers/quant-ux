export default class MockModelService{

    constructor () {
    }

    createApp (model) {
      
    }

    updateAppProps (id, change) {
    }

    saveApp (model) {
      
    }

    copyApp (model, newName) {
       
    }

    updateApp (model, changes) {
       
    }

    deleteApp (model) {
       
    }

    findPublicSummaries () {
       
    }

    findMyAppSummaries () {
        
    }

    findPublic () {
     
    }

    findMyApps () {
       
    }

    findApp (id) {
    }

    findAppByHash (hash) {
    }

    checkAppUpdateByHash (hash) {
    }

    findImages(id) {
       
    }

    /**
     * Commands
     */

    getCommands (id) {
       
    }

    addCommand (model, command) {
       
    }

    deleteCommand (model, count) {
       
    }

    undoCommand (model, command) {
       
    }

    redoCommand (model, command) {
       
    }

    /**
     * Team
     */
    findTeam (id) {
       
    }

    findTeamSuggestions (id) {
        
    }

    createTeam (id, user) {
       
    }

    updateTeam (id, user) {
        
    }

    deleteTeam (id, user) {
       
    }

    resetTeam(id) {
       
    }

    /**
     * Events
     */
    saveEvent (id, hash, event) {
     
    }

    findEvents (id) {
      
    }

    findEventsBatch (id) {

    }

    countEvents (id) {
       
    }

    findEventsBySession (id, session) {
    
    }

    deleteEventsBySession (id, session) {
       
    }

    /**
     * Mouse
     */
    findMouse (id) {
  
    }

    findMouseBySession (id, session) {
        
    }

    saveMouse (id, hash, events) {
       
    }

    deleteMouseBySession (id, session) {
       
    }


    /**
     * Annotations
     */
    findSessionAnnotations (id) {
    }

    findTagAnnotations (id) {
     
    }

    deleteAnnotation (id, annotationId) {
       
    }

    saveAnnotation (id, annotation) {
     
    }

    updateAnnotation (id, annotation) {
       
    }

    /**
     * Inivitations
     */
    findInvitation (id) {
       
    }

    /**
     * Test
     */
    findTest (id) {
    }

    findTestByHash (app, hash) {
       
    }

    saveTestSettings (id, test) {
    }

    saveCommands () {}


    /**
     * Examples
     */
    findPublicMouse (id) {
    }

    findPublicMouseBySession (appId, sessionId) {
      
    }

    findPublicTagAnnotations (id) {
    }
}