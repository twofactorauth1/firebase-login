/* Borrowed from: https://github.com/yani-/paypal-nvp
 * paypal-npm.js: Top-level include defining Paypal-nvp.
 *
 * (C) 2012 Yani Iliev
 * MIT LICENCE
 *
 */

// needed to make https GET requests
var https        = require( 'https' );
// needed to convert objects to urlencoded params
var query_string = require( 'querystring' );

// Paypal Sandbox API host
var SANDBOX_API_HOST    = process.env.SANDBOX_API_HOST || 'api-3t.sandbox.paypal.com';
// Paypal Production API host
var PRODUCTION_API_HOST = process.env.PRODUCTION_API_HOST || 'api-3t.paypal.com';
// Paypal API version
var API_VERSION         = process.env.API_VERSION || '97.0';

// constructor
var paypal_nvp = exports.Paypal_Nvp = function( username, password, signature, isSandbox ) {
    // api username is required
    if ( typeof username === 'undefined' ) {
        throw new Error( 'API Username is required' );
    }
    // api password is required
    if ( typeof password === 'undefined' ) {
        throw new Error( 'API Password is required' );
    }
    // api signature is required
    if ( typeof signature === 'undefined' ) {
        throw new Error( 'API Signature is required' );
    }
    // set local vars
    this.api_username = username;
    this.api_password = password;
    this.api_signature = signature;
    if(isSandbox !== false) {
        this.sandbox = true;
    } else {
        this.sandbox = false;
    }
};

// enable_sandbox
// sets local sandbox var to true
paypal_nvp.prototype.enable_sandbox = function() {
    this.sandbox = true;
}

// request
//
// data - Object - holds GET data
// cb - function - callback
//
// determine the right host, sandbox or production
// and sends a GET request to it with the passed data
// on success calls cb( null, response_value );
// on error calls cb( error, null )
paypal_nvp.prototype.request = function( data, cb ) {
    // validate that passed data is valid
    if ( typeof data !== 'object' ) {
        throw new Error( 'request function requires a data parameter' );
    }
    if ( typeof cb !== 'function' ) {
        throw new Error( 'request function requires a callback parameter')
    }
    if ( data.hasOwnProperty( 'METHOD' ) === false ) {
        throw new Error( 'data object doesn\'t have the required method property' );
    }

    // initialize Paypal request default values
    data.USER      = this.api_username;
    data.PWD       = this.api_password;
    data.SIGNATURE = this.api_signature;
    data.VERSION   = API_VERSION;

    // sets request destination
    var options = {
        hostname: this.sandbox ? SANDBOX_API_HOST : PRODUCTION_API_HOST,
        port:     443,
        path:     '/nvp?' + query_string.stringify( data ),
        method:   'GET'
    };

    // make the request
    var req = https.get(
        options,
        function( res ) {
            // holds return data
            var ret = '';
            // pipe data into ret var
            res.on( 'data', function( d ) {
                ret += d;
            });
            // when request is complete
            // return ret using the callback
            res.on( 'end', function() {
                cb( null, ret );
            });
        }
    );
    // on error, return the error
    // by passing it as first parameter
    req.on( 'error', function( e ) {
        cb( e, null );
    });
};
