
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
	}

	modelAddDesignToken(id, tokenType, cssProps, cssState, name, modelType ){
		let box = modelType === 'widget' ? this.model.widgets[id] : this.model.screens[id]
		if (!box) {
			this.logger.warn(-1,"undoAddDesignToken", "NO BOX WITH ID > ", id);
			return
		}

		if(!box[cssState]) {
			return
		}

		/**
		 * create token. can be simple or complex.
		 */
		let value = {}
		cssProps.forEach(key => {
			value[key] = box[cssState][key]
		});

		let token = {
			id: 'dt' + this.getUUID(),
			modified: new Date().getTime(),
			name: name,
			type: tokenType,
			value: value
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

		this.onModelChanged([{type:"designtoken", action:'add', id: null}, {type:"widget", action:'update', id: id}]);

		return token
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

}