var BaseView = require('./base.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            includeJs:true,
            includeHeader:true
        });

        var self = this;
        this.account(function(err, value) {
            if (!err && value != null) {
                data.account = value.props()
            }
            self.resp.render('login', data);
        });

    }
});

$$.v.LoginView = view;

module.exports = view;
