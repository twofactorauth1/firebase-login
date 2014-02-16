var BaseRouter = require('./base.router');
var HomeView = require('../views/home.view');


var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/", this.index.bind(this));
        app.get("/home", this.isAuth, this.showHome.bind(this));
        return this;
    },


    index: function(req,resp) {
        resp.redirect("/home");
        //new HomeView(req,resp).show("");
    },


    showHome: function(req,resp) {
        new HomeView(req,resp).show("home");
    }
});


module.exports = new router();

