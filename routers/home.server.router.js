var BaseRouter = require('./base.server.router.js');
var HomeView = require('../views/home.server.view');
var AdminView = require('../views/admin.server.view');

var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/", this.setup, this.index.bind(this));

        app.get("/home", this.isAuth.bind(this), this.showHome.bind(this));
        app.get("/home/*", this.isAuth.bind(this), this.showHome.bind(this));

        app.get("/admin", this.isAuth, this.showAdmin.bind(this));
        app.get("/admin/*", this.isAuth, this.showAdmin.bind(this));
        return this;
    },


    index: function(req,resp) {
        var self = this
            , accountId = this.accountId(req)
            , promise = $.Deferred();

        if (req.isAuthenticated() == false) {
            this.checkAuthToken(req, function(err, value) {
                if (!err) {
                    promise.resolve(true);
                } else {
                    promise.resolve(false);
                }
            })
        } else {
            promise.resolve(true);
        }

        promise
            .done(function(isAuthenticated) {
                if (accountId > 0) {
                    var user = req.user;
                    if (isAuthenticated && self.sm.canManageAccount(req, accountId)) {
                        //TODO -- do not redirect to /admin, this should go to public website when such functionality is availble
                        resp.redirect("/admin");
                    } else {
                        //TODO -- do not redirect to login, this should go to public website when such functionality is availble
                        resp.redirect("/login");
                    }
                } else {
                    if (isAuthenticated) {
                        self._showHome(req,resp);
                    } else {
                        resp.redirect("/login");
                    }
                }
            });
    },


    showHome: function(req,resp) {
        var accountId = this.accountId(req);
        if (accountId > 0) {
            //This is an account based url, there is no /home
            resp.redirect("/admin");
        } else {
            this._showHome(req,resp);
        }
    },


    showAdmin: function(req,resp) {
        var accountId = this.accountId(req);
        if (accountId > 0) {
            new AdminView(req,resp).show();
        } else {
            //send them back to the main home
            resp.redirect("/home");
        }
    },


    _showHome: function(req,resp) {
        new HomeView(req,resp).show("home");
    }
});


module.exports = new router();

