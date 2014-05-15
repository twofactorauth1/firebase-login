/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseRouter = require('./base.server.router.js');
var HomeView = require('../views/home.server.view');
var AdminView = require('../views/admin.server.view');
var WebsiteView = require('../views/website.server.view');

var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/", this.setup, this.index.bind(this));
        app.get("/index", this.setup, this.index.bind(this));
        app.get("/page/:page", this.setup, this.showWebsitePage.bind(this));

        app.get("/home", this.isAuth.bind(this), this.showHome.bind(this));
        app.get("/home/*", this.isAuth.bind(this), this.showHome.bind(this));

        app.get("/admin", this.isAuth, this.showAdmin.bind(this));
        app.get("/admin/*", this.isAuth, this.showAdmin.bind(this));

        return this;
    },


    index: function(req,resp) {
        var self = this
            , accountId = this.accountId(req);

        if (accountId > 0)  {
            new WebsiteView(req, resp).show(accountId);
        } else {
            resp.redirect("/home");
        }
    },

    showWebsitePage: function(req, resp) {
        console.log('show');
        var self = this
            , accountId = this.accountId(req);

        var page = req.params.page;
        if (accountId > 0)  {
            new WebsiteView(req, resp).showPage(accountId, page);
        } else {
            resp.redirect("/home");
        }
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

