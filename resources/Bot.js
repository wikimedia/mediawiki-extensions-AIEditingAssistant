ext.AIEditingAssistant.Bot = function () {
	this.currentRequests = {};
};

OO.initClass( ext.AIEditingAssistant.Bot );

ext.AIEditingAssistant.Bot.prototype.initialize = function ( command, text ) {
	return this.prompt( command, text, false );
};

ext.AIEditingAssistant.Bot.prototype.continue = function ( prompt ) {
	return this.prompt( prompt, '', true );
};

ext.AIEditingAssistant.Bot.prototype.prompt = function ( command, text, isContinuation ) {
	return this.post( 'prompt', { command: command, text: text, isContinuation: isContinuation } );
};

ext.AIEditingAssistant.Bot.prototype.post = function ( path, params ) {
	params = params || {};
	return this.ajax( path, JSON.stringify( params ), 'POST' );
};

ext.AIEditingAssistant.Bot.prototype.ajax = function ( path, data, method ) {
	data = data || {};
	const dfd = $.Deferred();

	this.currentRequests[ path ] = $.ajax( {
		method: method,
		url: this.makeUrl( path ),
		data: data,
		contentType: 'application/json',
		dataType: 'json',
		beforeSend: function () {
			/* eslint-disable-next-line */
			if ( this.currentRequests.hasOwnProperty( path ) ) {
				this.currentRequests[ path ].abort();
			}
		}.bind( this )
	} ).done( ( response ) => {
		delete ( this.currentRequests[ path ] );
		if ( response.success === false ) {
			dfd.reject();
			return;
		}
		dfd.resolve( response.result );
	} ).fail( ( jgXHR, type, status ) => {
		delete ( this.currentRequests[ path ] );
		if ( type === 'error' ) {
			dfd.reject( {
				error: jgXHR.responseJSON || jgXHR.responseText
			} );
		}
		dfd.reject( { type: type, status: status } );
	} );

	return dfd.promise();
};

ext.AIEditingAssistant.Bot.prototype.makeUrl = function ( path ) {
	if ( path.charAt( 0 ) === '/' ) {
		path = path.slice( 1 );
	}
	return mw.util.wikiScript( 'rest' ) + '/aieditingassistant/v1/' + path;
};
