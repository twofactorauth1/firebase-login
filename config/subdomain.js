/**
 * Subdomain middleware
 *
 * For more information on subdomain middleware, check out:
 * https://github.com/edwardhotchkiss/subdomain
 */
var subdomain = require('subdomain');

var hostname = '';

if (process.env.NODE_ENV === 'production') {
    hostname = 'indigenous-10744.onmodulus.net';
}
else {
    hostname = 'localhost:1337';
}

module.exports = {
    express: {
        customMiddleware: function (app) {
            app.use(subdomain({ base : hostname, removeWWW : true })); //TODO: add domain name for production.
        }
    }
};
