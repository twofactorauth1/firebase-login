/**
 * Subdomain middleware
 *
 * For more information on subdomain middleware, check out:
 * https://github.com/edwardhotchkiss/subdomain
 */
var subdomain = require('subdomain');

module.exports = {
    express: {
        customMiddleware: function (app) {
            app.use(subdomain({ base : 'localhost:1337', removeWWW : true })); //TODO: add domain name for production.
        }
    }
};
