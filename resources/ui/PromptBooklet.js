ext.AIEditingAssistant.ui.PromptBooklet = function ( config ) {
	config = config || {};
	this.operationalText = config.text;
	ext.AIEditingAssistant.ui.PromptBooklet.super.call( this, {
		outlined: false,
		$overlay: config.$overlay,
		expanded: false
	} );
	this.initialize();

	this.connect( this, {
		set: function ( page ) {
			if ( page instanceof ext.AIEditingAssistant.ui.CommandExecution ) {
				page.init();
				this.activePage = page;
				this.emit( 'pageSet', page );
			} else {
				this.emit( 'reset' );
			}
		}
	} );
};

OO.inheritClass( ext.AIEditingAssistant.ui.PromptBooklet, OO.ui.BookletLayout );

ext.AIEditingAssistant.ui.PromptBooklet.prototype.getActivePage = function () {
	return this.activePage || null;
};

ext.AIEditingAssistant.ui.PromptBooklet.prototype.initialize = function () {
	let pages = [];
	const commands = {};

	for ( const key in ext.AIEditingAssistant.commandRegistry.registry ) {
		/* eslint-disable-next-line */
		if ( !ext.AIEditingAssistant.commandRegistry.registry.hasOwnProperty( key ) ) {
			continue;
		}

		const data = ext.AIEditingAssistant.commandRegistry.registry[ key ];
		const page = new ext.AIEditingAssistant.ui.CommandExecution( {
			/* eslint-disable-next-line */
			label: mw.msg( data.labelMsg ),
			/* eslint-disable-next-line */
			data: $.extend( data, { key: key } )
		}, this.operationalText );
		page.connect( this, {
			loadingChange: function ( isLoading, wasSuccessful, isMainCall ) {
				this.emit( 'loadingChange', this.activePage, isLoading, wasSuccessful, isMainCall );
			},
			undo: function () {
				this.emit( 'undo' );
			}
		} );
		/* eslint-disable-next-line */
		commands[ key ] = mw.msg( data.labelMsg );
		pages.push( page );
	}
	const selectionPage = new ext.AIEditingAssistant.ui.CommandSelectionPage( {}, commands );
	pages = [ selectionPage ].concat( pages );
	this.addPages( pages );

	selectionPage.connect( this, {
		commandSelect: function ( key ) {
			this.setPage( 'commandPage_' + key );
		}
	} );
};
