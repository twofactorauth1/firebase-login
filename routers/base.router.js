var cookies = require('../utils/cookieutil');

var baseRouter = function(options) {
    this.init.apply(this, arguments);
};

_.extend(baseRouter.prototype, {

    log: null,

    init: function(options) {
        options = options || {};

        if (options.base) {
            this.base = options.base;
        }

        if (this.base == null) {
            this.base = "base";
        }

        this.log = global.getLogger(this.base + ".router");

        if (this.initialize != 'undefined') {
            this.initialize();
        }
    },


    isAuth: function(req, resp, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        cookies.setRedirectUrl(req, resp);

        return resp.redirect("/login");
    }
});

$$.r.BaseRouter = baseRouter;

module.exports = baseRouter;