/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var socialLoginRouter = require('../routers/sociallogin.server.router');
var loginRouter = require('../routers/login.server.router');
var courseRouter = require('../routers/course.server.router');
var homeRouter = require('../routers/home.server.router');
var stripeRouter = require('../routers/stripeconnect.server.router');

module.exports = {
    loginRouter: loginRouter,
    courseRouter: courseRouter,
    homeRouter: homeRouter,
    stripeRouter: stripeRouter
};
