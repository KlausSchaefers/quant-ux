
import Widget from 'canvas/controller/Widget'

export default class DesignToken extends Widget{

	constructor () {
		super()
	}

	addDesignToken (id, tokenType, cssProps, cssState, name, modelType) {
		this.logger.log(-1,"addDesignToken", "enter > " + id, tokenType, cssProps);

		let token = this.modelAddDesignToken(id, tokenType, cssProps,cssState, name, modelType)
		if (!token) {
			return
		}

		/**
		 * make command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "AddDesignToken",
			modelId: id,
			tokenName: name,
			tokenId: token.id,
			modelType: modelType,
			cssProps: cssProps,
			cssState: cssState,
			tokenType: tokenType
		};

		this.addCommand(command);
		this.render();

		this.logger.log(-1,"addDesignToken", "exit");
	}

	modelAddDesignToken(id, tokenType, cssProps, cssState, name, modelType ){
		let box = modelType === 'widget' ? this.model.widgets[id] : this.model.screens[id]
		if (!box) {
			this.logger.warn(-1,"modelAddDesignToken", "NO BOX WITH ID > ", id);
			return
		}

		if(!box[cssState]) {
			return
		}

		/**
		 * create token. can be simple or complex.
		 */


		let token = {
			id: 'dt' + this.getUUID(),
			modified: new Date().getTime(),
			isComplex: cssProps.length > 1,
			name: name,
			type: tokenType,
			value: this.getDesignTokenValue(box, cssState, cssProps)
		}

		if (!this.model.designtokens) {
			this.model.designtokens = {}
		}
		this.model.designtokens[token.id] = token

		/** Update widget */
		if (!box.designtokens) {
			box.designtokens = {}
		}
		if (!box.designtokens[cssState]) {
			box.designtokens[cssState] = {}
		}


		cssProps.forEach(key => {
			// or thing of something like 			box[cssState]['dt-' + key] = token.id
			box.designtokens[cssState][key] = token.id
			box[cssState][key] = '' // delete is not detected in
		});

		this.onModelChanged([{type:"designtoken", action:'add', id: null}, {type: modelType, action:'update', id: id}]);

		return token
	}

	getDesignTokenValue (box, cssState, cssProps) {
		if (cssProps.length === 1) {
			let key = cssProps[0]
			return box[cssState][key]
		} else {
			let value = {}
			cssProps.forEach(key => {
				value[key] = box[cssState][key]
			});
			return value
		}
	}

	modelRemoveDesignToken (tokenId) {
		if (this.model.designtokens) {
			delete this.model.designtokens[tokenId];
			this.onModelChanged([{type:"designtoken", action:'remove', id: tokenId}]);
		}
	}

	undoAddDesignToken (command) {
		this.logger.log(-1,"undoAddDesignToken", "enter > ", command);
		this.modelRemoveDesignToken(command.tokenId)
	}

	redoAddDesignToken (command) {
		this.logger.log(-1,"redoAddDesignToken", "enter > ", command);
		this.modelAddDesignToken(command.modelId, command.tokenType, command.cssProps, command.cssState, command.tokenName, command.modelType)
	}

	/**********************************************************************
	 * Clip Board
	 **********************************************************************/

	unlinkDesignToken (id, tokenId, cssState, modelType) {
		this.logger.log(-1,"unlinkDesignToken", "enter > " + id, tokenId);

		this.modelUnLinkDesignToken(id, tokenId, cssState, modelType)

		/**
		 * make command
		 */
		 var command = {
			timestamp : new Date().getTime(),
			type : "UnlinkDesignToken",
			modelId: id,
			tokenId: tokenId,
			modelType: modelType,
			cssState: cssState
		};

		this.addCommand(command);
		this.render();

		this.logger.log(-1,"unlinkDesignToken", "exit");

	}

	modelUnLinkDesignToken (id, tokenId, cssState, modelType) {



		if(!this.model.designtokens) {
			this.logger.warn("modelUnLinkDesignToken", "NO Design tokens in model");
			return
		}

		let box = modelType === 'widget' ? this.model.widgets[id] : this.model.screens[id]
		if (!box) {
			this.logger.warn("modelUnLinkDesignToken", "NO BOX WITH ID > ", id);
			return
		}

		//console.debug('modelUnLinkDesignToken', JSON.stringify(box, null, 2))

		let token = this.model.designtokens[tokenId]
		if (!token) {
			this.logger.warn("modelUnLinkDesignToken", "NO Design token or state > ", token);
			return
		}

		if (box.designtokens && box.designtokens[cssState]) {
			let style = box[cssState]
			let state = box.designtokens[cssState]


			for (let key in state) {
				let keyTokenId = state[key]
				if (keyTokenId === tokenId) {
					if (!token.isComplex) {
						style[key] = token.value
					} else {
						style[key] = token.value[key]
					}

					/**
					 * Remove the key
					 */
					 delete state[key]
				}
			}

		}

		/**
		 * Do not forget to clean up!
		 */
		if (Object.values(box.designtokens[cssState]).length === 0) {
			this.logger.log(-1,"modelUnLinkDesignToken", "Remove box.designtoken." +cssState);
			delete box.designtokens[cssState]
		}

		if (Object.values(box.designtokens).length === 0) {
			this.logger.log(-1,"modelUnLinkDesignToken", "Remove box.designtoken");
			delete box.designtokens
		}

		//console.debug(JSON.stringify(box, null, 2))

		this.onModelChanged([{type:modelType, action:'update', id: id}]);

	}

	undoUnlinkDesignToken (command) {
		this.logger.log(-1,"undoUnlinkDesignToken", "enter > ", command);
		//this.modelRemoveDesignToken(command.tokenId)
	}

	redoUnlinkDesignToken (command) {
		this.logger.log(-1,"redoUnlinkDesignToken", "enter > ", command);
		this.modelUnLinkDesignToken(command.modelId, command.tokenId, command.cssState, command.modelType)
		this.render();
	}

}