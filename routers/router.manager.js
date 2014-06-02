/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var socialLoginRouter = require('../routers/sociallogin.server.router');
var loginRouter = require('../routers/login.server.router');
var homeRouter = require('../routers/home.server.router');

module.exports = {
    loginRouter: loginRouter,
    homeRouter: homeRouter
};
