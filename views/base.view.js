require('../utils/jadehelpers');

var baseView = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(baseView.prototype, {

    req: null,
    resp: null,

    init: function(req,resp,options) {
        if (!options) {
            options = {};
        }

        this.req = req;
        this.resp = resp;

        if (this.initialize != null) {
            this.initialize.apply(this, options);
        }
    },

    baseData: function() {
        var data = {
            title: "indigenous"
        };

        try {
            data.errorMsg = this.req.flash('error')[0];
        }catch(exception) {
            console.log(exception);
        }

        if (this.req.isAuthenticated()) {
            data.authenticated = true;
            data.user = this.req.user.props();
        } else {
            data.authenticated = false;
        }
        return data;
    }
});

$$.v = $$.v || {};
$$.v.BaseView = baseView;

module.exports = baseView;
