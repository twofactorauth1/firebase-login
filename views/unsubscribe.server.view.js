/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            router:"unsubscribe",
            root:"unsubscribe",
            includeJs: false
        });

        this.resp.render('unsubscribe', data);
        this.cleanUp();
        data = null;
    }
});

$$.v.UnsubscribedView = view;

module.exports = view;
