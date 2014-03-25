/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var socialLoginRouter = require('../routers/sociallogin.server.router');
var loginRouter = require('../routers/login.server.router');
var homeRouter = require('../routers/home.server.router');

module.exports = {
    loginRouter: loginRouter,
    homeRouter: homeRouter
};
