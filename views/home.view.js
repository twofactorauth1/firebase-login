var BaseView = require('./base.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(root) {
        var data = this.baseData(
            {
                router:"home",
                root:root || "home",
                location:"home"
            }
        );

        var self = this;
        this.account(function(err, value) {
            if (!err && value != null) {
                data.account = value.toJSON();
            }
            self.resp.render('home', data);
        });
    }
});

$$.v.HomeView = view;

module.exports = view;
