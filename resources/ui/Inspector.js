ext.AIEditingAssistant.ui.Inspector = function ( inspector, config ) {
	config = config || {};
	config.padded = false;
	ext.AIEditingAssistant.ui.Inspector.super.call( this, inspector, config );
	this.range = null;
	this.inspector = inspector;
	this.$element.addClass( 'ext-AIEditingAssistant-inspector' );
};
/* eslint-disable-next-line */
OO.inheritClass( ext.AIEditingAssistant.ui.Inspector, ext.visualEditorPlus.ui.InlineTextInspectorElement );

ext.AIEditingAssistant.ui.Inspector.prototype.inspect = function ( range, selectedText ) {
	this.text = selectedText;
	this.range = range;
};

ext.AIEditingAssistant.ui.Inspector.prototype.onClose = function () {
	this.text = null;
};

ext.AIEditingAssistant.ui.Inspector.prototype.init = function () {
	this.openBtn = new OO.ui.ButtonWidget( {
		title: mw.msg( 'aieditingassistant-ui-inspector-label' ),
		framed: false,
		icon: 'robot',
		classes: [ 'ext-AIEditingAssistant-inspector-open' ]
	} );
	this.openBtn.connect( this, {
		click: function () {
			this.openPromptDialog();
		}
	} );
	this.$element.append( this.openBtn.$element );
};

ext.AIEditingAssistant.ui.Inspector.prototype.onExecutionReplace = function ( newText ) {
	if ( !this.range ) {
		return;
	}

	const surfaceModel = ve.init.target.getSurface().getModel();
	const fragment = surfaceModel.getLinearFragment( this.range );
	fragment.insertContent( newText );
	this.inspector.toggle( false );
};

ext.AIEditingAssistant.ui.Inspector.prototype.getPriority = function () {
	return 99;
};

ext.AIEditingAssistant.ui.Inspector.prototype.openPromptDialog = function () {
	const dialog = new ext.AIEditingAssistant.ui.PromptDialog( {
			operationalText: this.text
		} ),
		windowManager = new OO.ui.WindowManager( {
			modal: true
		} );

	this.inspector.toggle( false );
	$( document.body ).append( windowManager.$element );
	windowManager.addWindows( [ dialog ] );
	windowManager.openWindow( dialog ).closed.then( ( data ) => {
		/* eslint-disable-next-line */
		if ( data && data.action === 'submit' && data.hasOwnProperty( 'text' ) ) {
			this.onExecutionReplace( data.text );
		}
	} );
};

if ( mw && mw.config.get( 'AIEditingAssistantActiveProvider' ) ) {
	ext.visualEditorPlus.registry.inlineTextInspectors.register( 'AIEditingAssistant', ext.AIEditingAssistant.ui.Inspector );
}
