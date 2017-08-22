requirejs.config({
    paths: {
        vendor: './vendor',
		postmonger: 'vendor/postmonger'
    },
    shim: {
		'sendToZapier': {
			deps: ['vendor/postmonger']
		}
    }
});

requirejs( ['sendToZapier'], function( sendToZapier ) {
	//console.log( 'REQUIRE LOADED' );
});

requirejs.onError = function( err ) {
	//console.log( "REQUIRE ERROR: ", err );
	if( err.requireType === 'timeout' ) {
		console.log( 'modules: ' + err.requireModules );
	}

	throw err;
};