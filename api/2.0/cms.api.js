/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');


var cmsManager = require('../../cms/cms_manager');
var cmsDao = require('../../cms/dao/cms.dao');
var preRenderConfig = require('../../configs/prerender.config');
var request = require('request');

var ssbManager = require('../../ssb/ssb_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    version: "2.0",

    dao: cmsDao,

    initialize: function () {

        // THEME - work with theme objects
        /*
         * We may not need theme objects after all.
        app.get(this.url('themes'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//list
        app.get(this.url('theme/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get
        app.post(this.url('themes'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create
        app.post(this.url('theme/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update
        app.delete(this.url('theme/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete
        *
        */

        // TEMPLATE - work with template objects
        app.get(this.url('template'), this.isAuthAndSubscribedApi.bind(this), this.listTemplates.bind(this));//list
        app.get(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.getTemplate.bind(this));//get
        app.post(this.url('template'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create
        app.post(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update
        app.delete(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete

        // WEBSITE - work with website objects
        app.get(this.url('website'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get default (0th) website for current account
        app.get(this.url('website/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get
        app.get(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//list
        app.post(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create
        app.post(this.url('website/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update
        app.delete(this.url('website/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete

        app.get(this.url('website/:id/theme'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get theme

        //PAGE
        app.get(this.url('website/:id/pages'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get pages
        app.post(this.url('website/:id/pages'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create page
        app.get(this.url('page/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page
        app.post(this.url('page/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update page
        app.delete(this.url('page/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete page

        app.get(this.url('page/:id/template'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page template
        app.post(this.url('page/:id/template/:templateId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//set page template

        app.get(this.url('page/:id/versions'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page versions
        app.post(this.url('page/:id/version/:versionId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//revert page to version


        // COMPONENTS
        app.get(this.url('component'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this)); //get components


    },

    noop: function(req, resp) {
        var self = this;
        self.log.debug('>> noop');
        var accountId = parseInt(self.accountId(req));
        self.log.debug('<< noop');
        self.sendResult(resp, {msg:'method not implemented'});
    },

    listTemplates: function(req, resp) {
        var self = this;
        self.log.debug('>> listTemplates');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listTemplates(accountId, function(err, list){
                    self.log.debug('<< listTemplates');
                    return self.sendResultOrError(resp, err, list, "Error listing templates");
                });
            }
        });

    },

    getTemplate: function(req, resp) {
        var self = this;
        self.log.debug('>> getTemplate');
        var accountId = parseInt(self.accountId(req));
        var templateId = req.params.id;
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getTemplate(templateId, function(err, template){
                    self.log.debug('<< getTemplate');
                    return self.sendResultOrError(resp, err, template, "Error getting template");
                });
            }
        });
    }



});

module.exports = new api({version:'2.0'});

