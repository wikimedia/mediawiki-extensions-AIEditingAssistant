ext.AIEditingAssistant.ui.PromptDialog = function ( config ) {
	config = config || {};
	config.size = 'small';
	this.operationalText = config.operationalText;
	ext.AIEditingAssistant.ui.PromptDialog.super.call( this, config );
	this.activePage = null;
};

OO.inheritClass( ext.AIEditingAssistant.ui.PromptDialog, OO.ui.ProcessDialog );

ext.AIEditingAssistant.ui.PromptDialog.static.name = 'AIEditingAssistantPromptDialog';
ext.AIEditingAssistant.ui.PromptDialog.static.title = mw.msg( 'aieditingassistant-ui-prompt-dialog-title' );
ext.AIEditingAssistant.ui.PromptDialog.static.actions = [
	{
		action: 'cancel',
		label: mw.msg( 'aieditingassistant-ui-prompt-dialog-cancel' ),
		flags: [ 'safe', 'close' ],
		modes: [ 'selection' ]
	},
	{
		action: 'back',
		icon: 'arrowPrevious',
		title: mw.msg( 'aieditingassistant-ui-commandexecution-back' ),
		flags: [ 'safe' ],
		modes: [ 'execution' ]
	},
	{
		action: 'submit',
		label: mw.msg( 'aieditingassistant-ui-prompt-dialog-submit' ),
		flags: [ 'primary', 'progressive' ],
		disabled: true,
		modes: [ 'execution' ]
	}
];

ext.AIEditingAssistant.ui.PromptDialog.prototype.getSetupProcess = function ( data ) {
	/* eslint-disable-next-line */
	return ext.AIEditingAssistant.ui.PromptDialog.parent.prototype.getSetupProcess.call( this, data )
		.next( function () {
			this.actions.setMode( 'selection' );
		}, this );
};

ext.AIEditingAssistant.ui.PromptDialog.prototype.initialize = function () {
	ext.AIEditingAssistant.ui.PromptDialog.super.prototype.initialize.call( this );
	this.booklet = new ext.AIEditingAssistant.ui.PromptBooklet( {
		text: this.operationalText,
		$overlay: this.$overlay
	} );
	this.booklet.connect( this, {
		loadingChange: function ( page, isLoading, wasSuccessful, isMainCall ) {
			/* eslint-disable-next-line */
			this.actions.setAbilities( { submit: !( isLoading || ( isMainCall && !wasSuccessful ) ) } );
			if ( !isLoading ) {
				this.updateSize();
			}
		},
		pageSet: 'onPageSet',
		reset: 'onReset',
		undo: function () {
			this.updateSize();
		}
	} );
	this.$body.append( this.booklet.$element );
	this.onReset();
};

ext.AIEditingAssistant.ui.PromptDialog.prototype.getBodyHeight = function () {
	return this.$body.outerHeight( true ) + 20;
};

ext.AIEditingAssistant.ui.PromptDialog.prototype.getActionProcess = function ( action ) {
	if ( action === 'submit' ) {
		return new OO.ui.Process( function () {
			if ( !this.activePage ) {
				return;
			}
			this.close( { action: action, text: this.activePage.getFinalText() } );
		}, this );
	}
	if ( action === 'back' ) {
		return new OO.ui.Process( function () {
			this.booklet.setPage( 'selectCommand' );
		}, this );
	}
	if ( action === 'cancel' ) {
		this.close();
	}
	/* eslint-disable-next-line */
	return ext.AIEditingAssistant.ui.PromptDialog.super.prototype.getActionProcess.call( this, action );
};

ext.AIEditingAssistant.ui.PromptDialog.prototype.onReset = function () {
	this.activePage = null;
	this.setSize( 'small' );
	this.updateSize();
	this.actions.setAbilities( { submit: false } );
	this.actions.setMode( 'selection' );
};

ext.AIEditingAssistant.ui.PromptDialog.prototype.onPageSet = function ( page ) {
	this.activePage = page;
	this.setSize( 'larger' );
	this.updateSize();
	this.actions.setMode( 'execution' );
};
