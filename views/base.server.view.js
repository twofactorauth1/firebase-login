/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../utils/jadehelpers');
var url = require('url');
var accountDao = require('../dao/account.dao');
var constants = requirejs("constants/constants");


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
        serverProps[$$.constants.server_props.ROUTER] = options.router;
        serverProps[$$.constants.server_props.ROOT] = options.root;

        if (options.serverProps != null) {
            for(var key in options.serverProps) {
                serverProps[key] = options.serverProps[key];
            }
        }

        delete options.router;
        delete options.root;

        var data = {
            title: "Indigenous.io",
            serverProps: serverProps,
            includeJs:true,
            includeHeader:false,
            includeFooter:false
        };

        if (this.req.user != null) {
            data.serverProps[$$.constants.server_props.USER_ID] = this.req.user.id();
            data.serverProps[$$.constants.server_props.IS_LOGGED_IN] = true;
            data.user = this.req.user.toJSON();
            data.isLoggedIn = true;
            data.photo = this.req.user.getDefaultPhoto();
        } else {
            data.isLoggedIn = false;
        }

        if (options.account != null) {
            data.serverProps[$$.constants.server_props.ACCOUNT_ID] = options.account._id;
            data.serverProps[$$.constants.server_props.WEBSITE_ID] = options.account.website.websiteId;
            data.serverProps['trialDaysRemaining'] = options.account.trialDaysRemaining;
        } else if(options.accountId != null) {
            data.serverProps[$$.constants.server_props.ACCOUNT_ID] = options.accountId;
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
            data.user = this.req.user.toJSON();
        } else {
            data.authenticated = false;
        }

        //Override default options here
        for(var key in options) {
            data[key] = options[key];
        }

        return data;
    },


    userId: function() {
        try {
            return this.req.user.id();
        }catch(exception) {
            return null;
        }
    },


    accountId: function() {
        try {
            //console.log("base.server.view: " + this.req.session.unAuthAccountId);
            return this.req.session.unAuthAccountId || 0;
        }catch(exception) {
            return null;
        }
    },


    getAccount: function(fn) {
        var accountId = this.accountId();
        if (accountId > 0) {
            return accountDao.getById(accountId, fn);
        }
        fn();
    },

    getAccountByHost: function(req, fn) {
        accountDao.getAccountByHost(req.get("host"), fn);
    },

    ip: function(req) {
        try {
            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            if(Array.isArray(ip)) {
                return ip[0];
            } else if(ip.indexOf(',') !== -1){
                return ip.split(',')[0].trim();
            } else{
                return ip;
            }
        } catch(exception) {
            return null;
        }

    },


    cleanUp: function() {
        this.req = this.resp = null;
    }
});

$$.v = $$.v || {};
$$.v.BaseView = baseView;

module.exports = baseView;
