var BaseView = require('./base.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            includeJs:true,
            includeHeader:false
        });

        this.resp.render('login', data);
    }
});

$$.v.LoginView = view;

module.exports = view;
