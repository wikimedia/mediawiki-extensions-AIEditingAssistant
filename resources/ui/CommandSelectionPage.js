ext.AIEditingAssistant.ui.CommandSelectionPage = function ( config, commands ) {
	config = config || {};
	config.expanded = false;
	ext.AIEditingAssistant.ui.CommandSelectionPage.super.call( this, 'selectCommand', config );

	this.addHeader();
	for ( const key in commands ) {
		/* eslint-disable-next-line */
		if ( !commands.hasOwnProperty( key ) ) {
			continue;
		}
		this.addCommand( key, commands[ key ] );
	}
};

OO.inheritClass( ext.AIEditingAssistant.ui.CommandSelectionPage, OO.ui.PageLayout );

ext.AIEditingAssistant.ui.CommandSelectionPage.prototype.addCommand = function ( key, label ) {
	const button = new OO.ui.ButtonWidget( {
		label: label,
		flags: [ 'progressive' ],
		framed: false,
		data: key,
		classes: [ 'ext-AIEditingAssistant-CommandSelection-button' ]
	} );
	const page = this;
	button.connect( button, {
		click: function () {
			page.onCommandSelect( key );
		}
	} );
	this.$element.append( button.$element );
};

ext.AIEditingAssistant.ui.CommandSelectionPage.prototype.onCommandSelect = function ( key ) {
	this.emit( 'commandSelect', key );
};

ext.AIEditingAssistant.ui.CommandSelectionPage.prototype.addHeader = function () {
	this.$element.append( new OO.ui.LabelWidget( {
		label: mw.msg( 'aieditingassistant-ui-prompt-dialog-command-selection-header' ),
		classes: [ 'ext-AIEditingAssistant-CommandSelection-header' ]
	} ).$element );
};
