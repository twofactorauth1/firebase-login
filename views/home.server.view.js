var BaseView = require('./base.server.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(root) {
        var data = {
            router:"home",
            root:root || "home",
            location:"home",
            includeHeader:true,
            includeFooter:true
        };

        var self = this;
        this.getAccount(function(err, value) {
            if (!err && value != null) {
                data.account = value.toJSON();
            }

            data = self.baseData(data);

            self.resp.render('home', data);
            self.cleanUp();
            data = self = null;
        });
    }
});

$$.v.HomeView = view;

module.exports = view;
