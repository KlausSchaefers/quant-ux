import BaseController from './BaseController'
import lang from '../../dojo/_base/lang'
import ModelFixer from './ModelFixer'

export default class Command extends BaseController{

    setCommandService (s) {
        this.logger.log(1,"setCommandService", "entry");
		this.commandService = s
        this.changeStackMaxLength = 25
		this._useChangeStack = true
	}

    initChangeStack (id){
   
        const changeStack = this.commandService.loadChangeStack(id)
        if (changeStack && Array.isArray(changeStack.stack)) {
            this.logger.log(1,"initChangeStack", "loaded", id);
            this.commandChangeStack = changeStack
			console.debug('initChangeStack', this.commandChangeStack)
        } else {
            this.logger.log(1,"initChangeStack", "create fresh", id);
            this.commandChangeStack = {
				appID: id,
                stack: [],
                pos:-1
            }
        }

    }

	addChangeStack (modelChanges){
        this.logger.log(1,"addChangeStack", "entry > " + modelChanges.length);

		//console.debug('addChangeStack', JSON.stringify(modelChanges, null, 2))

		if(this.commandChangeStack.pos + 1 < this.commandChangeStack.stack.length){		
			this.commandChangeStack.stack = this.commandChangeStack.stack.slice(0, this.commandChangeStack.pos + 1);
		}

        this.commandChangeStack.stack.push({
            ts: new Date().getTime(),
            modelChanges: lang.clone(modelChanges),
        });
        this.commandChangeStack.pos++;
        this.compactChangeStack()
        this.commandService.storeChangeStack(this.model.id, this.commandChangeStack)
    }

    undoChangeStack() {
        this.logger.log(-1,"undoChangeStack", "entry");
		console.debug('undoChangeStack', this.commandChangeStack)
        if ( this.commandChangeStack.pos < 0) {
            this.logger.log(-1,"undoChangeStack", "pos is < 0");
			this.showError("No undo available");
            return false
        }

        const change = this.commandChangeStack.stack[this.commandChangeStack.pos];
		this.commandChangeStack.pos--;
        if (change) {
            const modelChanges = change.modelChanges
			if (modelChanges) {
				for (let i = 0; i < modelChanges.length; i++) {
					const c = modelChanges[i]
					console.debug('undoChangeStack', c)
					this.applyUndoChange(c, this.model)
				}
			}
	
        } else {
            this.logger.warn("undoChangeStack", "no change ??");
        }

        this.compactChangeStack()
        this.commandService.storeChangeStack(this.model.id, this.commandChangeStack)
 
        // this will call saveModelChanges(), which will not call 
        // updateChangeStack() as this is called in commitModelChange()
        this.onCommandChangeStackChange()		
		return true
    }


    redoChangeStack() {
        this.logger.log(1,"redoChangeStack", "entry");

		if(this.commandChangeStack.pos + 1 >= this.commandChangeStack.stack.length){
			this.logger.log(-1,"redoChangeStack", "pos is too hight");
			this.showError("No redo available");
			return false
		}

        this.commandChangeStack.pos++;
        const change = this.commandChangeStack.stack[this.commandChangeStack.pos];
        if (change) {
            const modelChanges = change.modelChanges
			if (modelChanges) {
				for (let i = 0; i < modelChanges.length; i++) {
					const c = modelChanges[i]
					this.applyRedoChange(c, this.model)
				}
			}
        } else {
            this.logger.warn("redoChangeStack", "No change ?");
        }

        this.compactChangeStack()
        this.commandService.storeChangeStack(this.model.id, this.commandChangeStack)
 
        // this will call saveModelChanges(), which will not call 
        // updateChangeStack() as this is called in commitModelChange()
        this.onCommandChangeStackChange()
		return true
    }

	onCommandChangeStackChange () {
		//this.setDirty(false)
	}


	compactChangeStack() {
        if (this.commandChangeStack.stack.length > this.changeStackMaxLength) {
			this.commandChangeStack.stack.shift()
			this.commandChangeStack.pos = Math.max(-1, this.commandChangeStack.pos - 1)
        }
    }

	applyRedoChange(c, model) {
        if (c.name !== 'lastUUID' || c.name !== 'lastUpdate') {
			//console.debug('applyRedoChange', c)
            let parent = c.parent ? model[c.parent] : model
            if (c.type == 'add') {
				const value = c.object
				if (this.isObject(value)) {
					value.modified = new Date().getTime()
				}
                if (c.name) {                   
					parent[c.name] = value
                }

            }
        
            if (c.type == 'update') {              
                const value = c.object
				if (this.isObject(value)) {
					value.modified = new Date().getTime()
				}
                if (c.name) {
                    parent[c.name] = value
                }
            }

            if (c.type == 'delete') {              
                if (c.name) {
                    delete parent[c.name]
                }
            }     

        }
    }

    applyUndoChange(c, model) {
        if (c.name !== 'lastUUID') {

            let parent = c.parent ? model[c.parent] : model
			
            if (c.type == 'add') {
                if (c.name) {
                    delete parent[c.name]	
                } else {
                    console.error('undoChangeStack() > add > no name', c)
                }
            }
        
            if (c.type == 'update') {              
                const value = c.oldValue
				if (value.props)
				if (this.isObject(value)) {
					value.modified = new Date().getTime()
				}
                if (c.name) {
                    parent[c.name] = value
                }
				
            }

            if (c.type == 'delete') {              
                const value = c.oldValue
				if (this.isObject(value)) {
					value.modified = new Date().getTime()
				}
                if (c.name) {
                    parent[c.name] = value
                }
            }
        }
    }

    /**********************************************************************
	 * MulitCommand
	 **********************************************************************/

	undoMultiCommand (command){
		this.logger.log(0,"undoMultiCommand", "enter > " + command.id);

		for(let i=0; i< command.children.length; i++){
			const child = command.children[i];
			if(this["undo" + child.type]){
				this["undo"+ child.type](child);
			} else {
				console.warn("No Undo function defined for ", command);
			}
		}
	}

	redoMultiCommand (command){
		this.logger.log(0,"redoMultiCommand", "enter > " + command.id);

		for(let i=0; i< command.children.length; i++){
			const child = command.children[i];
			if(this["redo" + child.type]){
				this["redo"+ child.type](child);
			} else {
				console.warn("No Undo function defined for ", command);
			}
		}
	}

	isObject (value) {
		return typeof value === 'object'
		&& value !== null
		&& !Array.isArray(value)
		&& !(value instanceof RegExp)
		&& !(value instanceof Date)
		&& !(value instanceof Set)
		&& !(value instanceof Map)
	}


	/**********************************************************************
	 * CommandStack
	 **********************************************************************/


	async addCommand (command){

		// Since 4.0.60: Create a copy. Some commands are sloppy and contain 
		// live objects which will be messed up by later editing on the command 
		// stack
		command = lang.clone(command)

		if(!this.commandStack.lastUUID){
			this.commandStack.lastUUID = 0;
		}
		command.id = "c" + this.commandStack.lastUUID++;
		if (command.p) {
			console.error('addCommand() > command must not have p prop', command)
		}
		command.p = this.currentPage

		/**
		 * It might have happened that we have moved back in the stack via undo.
		 * if a new command comes, we throw away all newer commands.
		 */
		if(this.commandStack.pos < this.commandStack.stack.length){
			const count = Math.max(0, (this.commandStack.stack.length - this.commandStack.pos))
			this.logger.log(-1,"addCommand", "cut off future! > stack: " + this.commandStack.stack.length + " > pos"  + this.commandStack.pos + ' > ' + count);
	
			if(this.mode == "public"){
				this.onCommandDeleted(command);
			} else {	
				this.commandService.deleteCommand(this.model, count).then(res => {
					this.logger.log(-1,"addCommand", "cut off future! >> server pos:"  + res.pos + " >> client pos: " + this.commandStack.pos );
					this.onCommandDeleted(command)
				}).catch(err => {
					this.logger.error("addCommand", "ERROR deleting", err);
					this.showError('Could not reach server! Changes not saved')
				})
			}
		} else {
			this.postCommand(command);
		}
		this.emit("commandAdded", this.commandStack.stack.length);
	}

	onCommandDeleted (command){
		/**
		 * just remove the command. also update the pos, altough it should be updated
		 * in the next step
		 */
		this.commandStack.stack = this.commandStack.stack.slice(0, this.commandStack.pos);
		this.logger.log(-1,"onCommandDeleted", "enter > pos : " + this.commandStack.pos + " > stack : " +	this.commandStack.stack.length);

		if(this.toolbar){
			this.toolbar.disableRedo();
		}
		this.postCommand(command);
	}


	async postCommand (command){
		this.logPageEvent("addCommand", command.type)
		
		/**
		 * Since 2.1.3 we put stuff on the stack, without waiting
		 * for the backend.
		 */
		const result = {
			pos : this.commandStack.pos + 1,
			command : command,
			lastUUID : this.commandStack.lastUUID + 1
		}
		this.commandStack.stack.push(result.command);
		this.commandStack.pos = result.pos;
		this.commandStack.lastUUID = result.lastUUID;

		this.logger.log(1,"postCommand", "enter > " + this.mode);
		if (this.mode == "public"){
			/**
			 * In public mode, we do not call network, and just add
			 */
			this.onCommandAdded(result);
		} else {

			try {
				this.commandService.addCommand(this.model, command).then(pos => {
					this.onCommandAdded(pos);
				}).catch(err => {
					this.logger.error("postCommand", "ERROR saving", err);
					this.showError('Could not reach server! Changes not saved')
				})
				this.logger.log(1,"postCommand", "exit > lastUUID: " + this.commandStack.lastUUID  + ' > pos: ' + this.commandStack.pos);
			} catch (err) {
				this.logger.sendError("postCommand", err);
			}
		}
	}

	async onCommandAdded (result){
		if(result.errors){
			this.logger.sendError("onCommandAdded", new Error("Server returned error"));
		}

		if (result.pos < 0) {
			this.logger.sendError("onCommandAdded", new Error("Server negative pos"));
		}

		/**
		 * Since 2.1.3 we put stuff and the stack. here we just update the
		 * lastUUID ans pos with the server one, in case we would have
		 * concurrant editing
		 *
		 * FIXME: for some reason the last UUID on the server lacks
		 * the one we have in browser. Question: Do we need the last UUID on the stack?
		 * Can`t we use the normal lastUUID? Or just created with Date()
		 */
		if (this.commandStack.pos !== result.pos) {
			this.logger.log(1, "onCommandAdded", "Not match pos > server: "+ result.pos +  " > local: " + this.commandStack.pos, result);
		}
		/**
		 * This is needed when we cut pop the stack
		 */
		this.commandStack.pos = result.pos;
		this.commandStack.lastUUID = result.lastUUID;

		/**
		 * Since 4.5.4 we shift to large command stacks,
		 * to make them small again
		 */		
		if (this.commandStack.stack.length > this.stackMaxLength) {

			const oldLength = this.commandStack.stack.length
			const oldPos = this.commandStack.pos

			this.commandStack.stack = this.commandStack.stack.slice(this.stackElementToRemove);
			this.commandStack.pos = Math.max(0, this.commandStack.pos - this.stackElementToRemove)

			this.commandService.saveCommands(this.model.id, this.commandStack)
			this.logger.log(-1, "onCommandAdded", `Shift stack > stack: ${oldLength} to ${this.commandStack.stack.length} > pos:  ${oldPos} > ${this.commandStack.pos}` );
		}

		if(this.toolbar){
			this.toolbar.enbaleUndo();
		}
		this.logger.log(1,"onCommandAdded", "exit > id: "+ result.command.id + " > lastUUID: " + this.commandStack.lastUUID + " > pos: " + this.commandStack.pos);
	}

	canUndo (){
		return 	this.commandStack.pos > 0;
	}

	async undo (){
		this.logger.log(2,"undo", "enter > " + (this.commandStack.pos > 0));
		this.logPageEvent("undo", "")
		if (this._useChangeStack) {
			this.startModelChange()
			this.undoChangeStack()
			this.completeRender()
			this.commitModelChange(false)
			
		} else {
			if(this.commandStack.pos > 0){
				/**
				 * Do do things faster for large requests,
				 * we do not wait for the rest response.
				 */
				if (this.mode !== "public"){
					this.commandService.undoCommand(this.model, {}).then(res => {
						if (res.pos != this.commandStack.pos) {
							this.logger.error('undo', "server is behind", res)
						}
						this.logger.log(2,"undo", "saved", res.pos + '==' + this.commandStack.pos);
					})
				}
				const result = {
					pos : this.commandStack.pos - 1
				}
				this.onUndoCompleted(result);

			} else {
				this.showError("No undo available");
			}
			if(this.commandStack.pos <= 0){
				if(this.toolbar){
					this.toolbar.disableUndo();
				}
			}
		}
	}


	async onUndoCompleted (result){
		this.logger.log(1,"onUndoCompleted", "enter > " + result.pos);
		this.commandStack.pos = result.pos;
		const command = this.commandStack.stack[this.commandStack.pos];
		if(command){
			this.logger.log(0,"onUndoCompleted", "enter > "+ command.id);
			if (this["undo" + command.type]) {
				try{
					this.startModelChange()
					await this.onCommandPageChange(command)
					this["undo"+ command.type](command);
					this.commitModelChange()
				} catch(e){
					console.debug(e.stack);
				}
			} else {
				this.logger.log(-1,"onUndoCompleted", "No Undo function for", command.type);
			}
			if(this.toolbar){
				this.toolbar.enbaleRedo();
			}
		} else {
			this.logger.log(-1,"onUndoCompleted", "No command at position");
		}
	}

	async redo (){
		this.logger.log(2,"redo", "enter > "+ (this.commandStack.pos >= this.commandStack.stack.length));
		if (this._useChangeStack) {
			this.startModelChange()
			this.redoChangeStack()
			this.completeRender()
			this.commitModelChange(false)
		} else {
        
			this.logPageEvent("redo", "")
			if(this.commandStack.pos >= 0 && this.commandStack.pos  < this.commandStack.stack.length){
				/**
				 * Do do things faster for large requests,
				 * we do not wait for the rest response.
				 */
				if(this.mode !=="public"){
					this.commandService.redoCommand(this.model, {}).then(res => {
						if (res.pos !== this.commandStack.pos) {
							this.logger.log(1, 'redo', "server is behind")
						}
						this.logger.log(2,"redo", "saved",  res.pos + '==' + this.commandStack.pos);
					})
				}

				const result = {
					pos : this.commandStack.pos+1
				}
				this.unRedoCompleted(result);
			} else {
				this.logger.log(0,"redo", "No redo > ");
				this.showError("No redo available");
			}

			if(this.commandStack.pos >= this.commandStack.stack.length){
				if(this.toolbar){
					this.toolbar.disableRedo();
				}
			}
		}
	}

	async unRedoCompleted (result){
		const command = this.commandStack.stack[this.commandStack.pos];
		this.commandStack.pos = result.pos;
		this.logger.log(2,"unRedoCompleted", "enter > "+ command.id);
		if(this["redo" + command.type]){
			try{
				this.startModelChange()
				await this.onCommandPageChange(command)
				this["redo"+ command.type](command);
				this.commitModelChange()
			}catch(e){
				console.debug(e.stack);
			}
		} else {
			console.warn("No Redo function defined for ", command.type);
		}
		if(this.toolbar){
			this.toolbar.enbaleUndo();
		}
	}

	async onCommandPageChange (command) {
		if (command.p && command.p != this.currentPage) {
			this.setPage(command.p)
			return new Promise(resolve => {
				setTimeout(() => {
					resolve()
				}, 200)
			})
		}
	}

	setCommandStack (s){
		this.logger.log(1,"setCommandStack", "enter > length: " + s.stack.length + " > pos: " + s.pos);
		/**
		 * In some rare cases teh position might be < 0. We fix it, and store 
		 * the entire command stack!
		 */
		if (ModelFixer.fixCommandStack(s) ) {
			if (this.modelService) {
				this.commandService.saveCommands(s.appID, s)
			}
			
		}
		this.commandStack = s;
		if(this.toolbar){
			if(this.commandStack.pos > 0){
				this.toolbar.enbaleUndo();
			} else {
				this.toolbar.disableUndo();
			}
			if(this.commandStack.pos < this.commandStack.stack.length){
				this.toolbar.enbaleRedo();
			} else{
				this.toolbar.disableRedo();
			}
		}
	}

}