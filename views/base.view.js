require('../utils/jadehelpers');
var url = require('url');

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

    baseData: function(options) {
        options = options || {};
        var serverProps = options.serverProps || {};
        serverProps.router = options.router;
        serverProps.root = options.root;

        delete options.router;
        delete options.root;

        var data = {
            title: "indigenous",
            serverProps: serverProps,
            includeHeader:true
        };

        if (this.req.user != null) {
            data.serverProps.userId = this.req.user.id();
            data.isLoggedIn = true;
            data.user = this.req.user.props();
        } else {
            data.isLoggedIn = false;
        }


        try {
            data.errorMsg = this.req.flash('error')[0];
        }catch(exception) {
            console.log(exception);
        }


        try {
            data.infoMsg = this.req.flash('info')[0];
        }catch(exception) {
            console.log(exception);
        }

        if (this.req.isAuthenticated()) {
            data.authenticated = true;
            data.user = this.req.user.props();
        } else {
            data.authenticated = false;
        }

        for(var key in options) {
            data[key] = options[key];
        }

        return data;
    }
});

$$.v = $$.v || {};
$$.v.BaseView = baseView;

module.exports = baseView;
