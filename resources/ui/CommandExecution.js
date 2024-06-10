ext.AIEditingAssistant.ui.CommandExecution = function ( commandData, text, config ) {
	this.commandData = commandData;
	this.operationalText = text;
	this.finalText = this.operationalText;
	this.chatHistory = [];

	config = config || {};
	config.padded = false;
	config.expanded = false;
	ext.AIEditingAssistant.ui.CommandExecution.super.call( this, 'commandPage_' + commandData.data.key, config );

	this.$element.addClass( 'ext-AIEditingAssistant-CommandExecution' );
	this.isInitialized = false;
};

OO.inheritClass( ext.AIEditingAssistant.ui.CommandExecution, OO.ui.PageLayout );
OO.mixinClass( ext.AIEditingAssistant.ui.CommandExecution, OO.ui.mixin.PendingElement );

ext.AIEditingAssistant.ui.CommandExecution.prototype.init = function () {
	if ( this.isInitialized ) {
		return;
	}
	this.bot = new ext.AIEditingAssistant.Bot();
	this.$element.append( this.getHeader() );
	this.$element.append( this.getBody() );

	this.executeCommand();
	this.isInitialized = true;
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.getHeader = function () {
	const label = new OO.ui.LabelWidget( {
			/* eslint-disable-next-line */
			label: mw.msg( this.commandData.data.labelMsg ),
			classes: [ 'ext-AIEditingAssistant-CommandExecution-header-label' ]
		} ),
		description = new OO.ui.LabelWidget( {
			/* eslint-disable-next-line */
			label: this.commandData.data.descriptionMsg ? mw.msg( this.commandData.data.descriptionMsg ) : '',
			classes: [ 'ext-AIEditingAssistant-CommandExecution-header-description' ]
		} );

	return $( '<div>' ).append( label.$element, description.$element );
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.getBody = function () {
	const origText = new OO.ui.LabelWidget( {
			classes: [ 'ext-AIEditingAssistant-CommandExecution-body-original' ],
			label: this.operationalText
		} ),
		origHeader = new OO.ui.LabelWidget( {
			label: mw.msg( 'aieditingassistant-ui-commandexecution-original' ),
			class: [ 'ext-AIEditingAssistant-CommandExecution-field-header' ]
		} );
	this.finalTextLabel = new OO.ui.LabelWidget( {
		classes: [ 'ext-AIEditingAssistant-CommandExecution-body-final' ]
	} );

	OO.ui.mixin.PendingElement.call( this, { $pending: this.finalTextLabel.$element } );

	const panel = new OO.ui.PanelLayout( {
		expanded: false,
		padded: false,
		classes: [ 'ext-AIEditingAssistant-CommandExecution-body' ]
	} );

	panel.$element.append( origHeader.$element, origText.$element );
	panel.$element.append( new OO.ui.LabelWidget( {
		label: mw.msg( 'aieditingassistant-ui-commandexecution-final' ),
		class: [ 'ext-AIEditingAssistant-CommandExecution-field-header' ]
	} ).$element );
	panel.$element.append( this.finalTextLabel.$element );
	panel.$element.append( this.getChatPanel().$element );
	return panel.$element;
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.getFinalText = function () {
	return this.finalText;
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.executeCommand = function () {
	this.setLoading( true );
	const msg = this.commandData.data.commandMsg,
		/* eslint-disable-next-line */
		msgObject = mw.message( msg );
	/* eslint-disable-next-line */
	if ( this.commandData.data.hasOwnProperty( 'paramsCallback' ) ) {
		const params = this.commandData.data.paramsCallback( msg );
		if ( typeof params === 'object' && params.length > 0 ) {
			msgObject.params( params );
		}
	}

	const command = msgObject.parse();
	this.bot.initialize( command, this.operationalText ).done( ( result ) => {
		this.finalText = result;
		this.setLoading( false, true );
	} ).fail( ( e ) => {
		/* eslint-disable-next-line */
		if ( e.hasOwnProperty( 'error' ) && e.error.hasOwnProperty( 'message' ) ) {
			this.finalText = e.error.message;
		}
		this.setLoading( false, false );
		this.finalTextLabel.$element.addClass( 'ext-AIEditingAssistant-CommandExecution-body-final-error' );
	} );
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.onMorePromptSubmitClick = function () {
	const prompt = this.morePrompt.getValue().trim();
	if ( prompt === '' ) {
		return;
	}
	let historyEntry = {
		prompt: prompt,
		// Text at the time of prompt
		text: this.finalText
	};
	historyEntry = this.addChatHistory( historyEntry );
	this.morePromptLayout.setErrors( [] );
	this.setLoading( true );
	this.bot.continue( prompt ).done( ( result ) => {
		this.finalText = result;
		this.setLoading( false, true );
	} ).fail( ( e ) => {
		/* eslint-disable-next-line */
		if ( e.hasOwnProperty( 'error' ) && e.error.hasOwnProperty( 'message' ) ) {
			this.morePromptLayout.setErrors( [ e.error.message ] );
		}
		this.setLoading( false, false, false );
		this.finalTextLabel.setLabel( this.finalText );
		if ( historyEntry.widget ) {
			historyEntry.widget.setIcon( 'alert' );
		}

	} );
};

/* eslint-disable-next-line */
ext.AIEditingAssistant.ui.CommandExecution.prototype.setLoading = function ( loading, wasSuccessful, isMainCall ) {
	if ( isMainCall === undefined ) {
		isMainCall = true;
	}
	this.morePrompt.setDisabled( loading );
	this.morePromptSubmit.setDisabled( loading );
	this.finalTextLabel.$element.removeClass( 'ext-AIEditingAssistant-CommandExecution-body-final-error' );
	this.finalTextLabel.setLabel( loading ?
		mw.msg( 'aieditingassistant-ui-commandexecution-loading' ) :
		this.finalText
	);
	if ( loading ) {
		this.pushPending();
	} else {
		this.popPending();
	}
	if ( wasSuccessful ) {
		this.morePrompt.focus();
	}
	this.emit( 'loadingChange', loading, wasSuccessful, isMainCall );
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.getChatPanel = function () {
	this.morePrompt = new OO.ui.TextInputWidget( {
		placeholder: mw.msg( 'aieditingassistant-ui-commandexecution-ask-more-label' ),
		icon: 'robot'
	} );
	this.morePrompt.connect( this, {
		enter: 'onMorePromptSubmitClick'
	} );
	this.morePromptSubmit = new OO.ui.ButtonWidget( {
		label: mw.msg( 'aieditingassistant-ui-commandexecution-ask-more-submit' )
	} );
	this.morePromptSubmit.connect( this, {
		click: 'onMorePromptSubmitClick'
	} );
	this.morePromptLayout = new OO.ui.ActionFieldLayout( this.morePrompt, this.morePromptSubmit );
	this.chatHistoryPanel = new OO.ui.PanelLayout( {
		expanded: false,
		padded: false,
		classes: [ 'ext-AIEditingAssistant-CommandExecution-chat-history' ]
	} );
	this.undoButton = new OO.ui.ButtonWidget( {
		icon: 'undo',
		label: mw.msg( 'aieditingassistant-ui-commandexecution-undo' ),
		framed: false,
		classes: [ 'ext-AIEditingAssistant-CommandExecution-chat-undo' ]
	} );
	this.undoButton.connect( this, {
		click: 'undo'
	} );
	this.undoButton.$element.hide();
	this.chatHistoryPanel.$element.append( this.undoButton.$element );
	const chatLayout = new OO.ui.PanelLayout( {
		padded: false,
		expanded: false,
		classes: [ 'ext-AIEditingAssistant-CommandExecution-chat' ]
	} );
	chatLayout.$element.append( this.chatHistoryPanel.$element, this.morePromptLayout.$element );

	return chatLayout;
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.addChatHistory = function ( item ) {
	this.undoButton.$element.show();
	const itemLabel = new OO.ui.LabelWidget( {
		label: item.prompt,
		classes: [ 'ext-AIEditingAssistant-CommandExecution-chat-history-item' ]
	} );
	this.chatHistoryPanel.$element.prepend( itemLabel.$element );
	item.widget = itemLabel;
	this.chatHistory.push( item );
	this.morePrompt.setValue( '' );

	return item;
};

ext.AIEditingAssistant.ui.CommandExecution.prototype.undo = function () {
	const lastItem = this.chatHistory.pop();
	if ( lastItem ) {
		lastItem.widget.$element.remove();
		this.finalText = lastItem.text;
		this.finalTextLabel.setLabel( this.finalText );
		this.morePrompt.setValue( lastItem.prompt );
	}
	if ( this.chatHistory.length === 0 ) {
		this.undoButton.$element.hide();
		this.morePrompt.setValue( '' );
	}
	this.emit( 'undo' );
};
