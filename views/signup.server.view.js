/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var BaseView = require('./base.server.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            router:"signup",
            root:"signup"
        });

        this.resp.render('home', data);
        this.cleanUp();
        data = null;
    }
});

$$.v.SignupView = view;

module.exports = view;
