var BaseRouter = require('./base.router');
var HomeView = require('../')


var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/", this.isAuth, this.index.bind(this));
        app.get("/home", this.isAuth, this.showHome.bind(this));

        return this;
    },


    index: function(req,resp) {
        resp.render('index', { title: 'Indigenous' });
    },


    showHome: function(req,resp) {
        new HomeView(req,resp).show();
    }
});


module.exports = new router();

