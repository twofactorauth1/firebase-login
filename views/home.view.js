var BaseView = require('./base.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData();
        data.location = "home";

        this.resp.render('home', data);
    }
});

$$.v.HomeView = view;

module.exports = view;
