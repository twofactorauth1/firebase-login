/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var view = function(options) {
    this.init(options);
}

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var user = this.req.user;

        var data = {
            user: user.toJSON(),
            location: "home",
            includeJs: false
        };

        this.resp.render('home', data);
    }
});

$$.v.HomeView = view;

module.exports = view;
