define( function( require ) {
	var Postmonger = require( 'postmonger' );
    var connection = new Postmonger.Session();
    var toJbPayload = {};
	var tokens;
	var endpoints;
    var eventDefinitionKey;

    if ( document.readyState === "complete" ||
        ( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
        window.setTimeout(onRender);
    } else {
        document.addEventListener( "DOMContentLoaded", onRender );
    }
    
    // Event handlers
    
    connection.on('initActivity', initialize);
    
    // This listens for Journey Builder to send tokens
    connection.on('requestedTokens', onGetTokens);
    
    // This listens for Journey Builder to send endpoints
    connection.on('requestedEndpoints', onGetEndpoints);
    
    connection.on('requestedInteractionDefaults', onGetInteractionDefaults);
    
    connection.on('clickedNext', onClickedNext);

    // Helper functions
    function onRender() {
        
        //console.log('onRender');
        
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        
        // This event allows to get Interaction (Journey) details
        connection.trigger('requestInteractionDefaults');
    };
    
    function initialize (data) {
        
        //console.log('initialize');
        
        if (data) {
            toJbPayload = data;
            //console.log('Initialize payload: ', toJbPayload);
        }
    }
    
    // Parameter is either the tokens data or an object with an
	// "error" property containing the error message
    function onGetTokens (data) {
        
        //console.log('onGetTokens');
        
		if( data.error ) {
			//console.error( data.error );
		} else {
			tokens = data;
            //console.log('Tokens: ', tokens);
		}
	}
    
    // Parameter is either the endpoints data or an object with an
	// "error" property containing the error message    
    function onGetEndpoints (data) {
        
        //console.log('onGetEndpoints');
        
		if( data.error ) {
			//console.error( data.error );
		} else {
			endpoints = data;
            //console.log('Endpoints: ', endpoints);
		}
	}
    
    function onGetInteractionDefaults(settings) {
        
        //console.log('onGetInteractionDefaults');
        
        if( settings.error ) {
			//console.error( settings.error );
		} else {
			defaults = settings;
            eventDefinitionKey = retrieveKey(defaults.email[0]);
            //console.log('EventKey', eventDefinitionKey);
        }
    }
    
    function onClickedNext() {
        
        //console.log('onClickedNext');
        
        save();
        connection.trigger('ready');
    }
    
    function save() { 
        
        // 'toJbPayload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        
        
        toJbPayload.metaData.isConfigured = true;
        
        // Add in arguments to the payload
        toJbPayload['arguments'].execute.inArguments = [
            { 'Task:Who:Contact:FirstName': '{{Event.' + eventDefinitionKey + '.\"Task:Who:Contact:FirstName\"}}' },
            { 'Task:Who:Contact:LastName': '{{Event.' + eventDefinitionKey + '.\"Task:Who:Contact:LastName\"}}' },
            { 'Task:Account:Country__c': '{{Event.' + eventDefinitionKey + '.\"Task:Account:Country__c\"}}' },
			{ 'Task:Subject': '{{Event.' + eventDefinitionKey + '.\"Task:Subject\"}}' },
			{ 'Task:Description': '{{Event.' + eventDefinitionKey + '.\"Task:Description\"}}' },
			{ 'Task:What:Case:Collections_Phase__c': '{{Event.' + eventDefinitionKey + '.\"Task:What:Case:Collections_Phase__c\"}}' },
			{ 'Task:What:Case:TotalAmountPastDueDate__c': '{{Event.' + eventDefinitionKey + '.\"Task:What:Case:TotalAmountPastDueDate__c\"}}' },
            { 'Task:Who:Contact:MobilePhone': '{{Event.' + eventDefinitionKey + '.\"Task:Who:Contact:MobilePhone\"}}' },
            { 'Task:What:Case:CaseOwnerName__c': '{{Event.' + eventDefinitionKey + '.\"Task:What:Case:CaseOwnerName__c\"}}' },
        ];
        
        //console.log('Updated payload: ', JSON.stringify(toJbPayload));
        
        connection.trigger('updateActivity', toJbPayload);
    }
    
    // Assume that the string of the format '{{Event.ContactEvent-72af1529-1d7d-821e-2a08-34fb5068561d."EmailAddress"}}'
    // It will return 'ContactEvent-72af1529-1d7d-821e-2a08-34fb5068561d', otherwise return null
    function retrieveKey (string) {
        var pos1 = string.indexOf(".");
        var pos2 = string.indexOf(".", (pos1 + 1) );
        var result;
        if ( (pos1 < 0) && (pos2 < 0) ){
            result = null;
        } else {
            result = string.substring( (pos1 + 1) , pos2);
        }
        return result;
    }

});