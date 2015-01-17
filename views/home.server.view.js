/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var _req = null;
var view = function(req,resp,options) {
    this.init.apply(this, arguments);
    _req = req;
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

            data.includeJs = false;
            data = self.baseData(data);
            data.accounts = self.req.session.accounts;
            //console.dir(data.accounts);
            self.resp.render('home_new', data);
            self.cleanUp();
            data = self = null;
        });
    }
});

$$.v.HomeView = view;

module.exports = view;
