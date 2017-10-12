/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');

var appConfig = require('../../configs/app.config');
var urlUtils = require('../../utils/urlutils');
var dao = require('../../organizations/dao/organization.dao');
var manager = require('../../organizations/organization_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "organization",

    version: "2.0",

    dao: dao,

    initialize: function () {
        
        app.get(this.url('all'), this.isAuthAndSubscribedApi.bind(this), this.listAllOrganizations.bind(this));
        
    },


    listAllOrganizations: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listAllOrganizations');

        if(accountId === appConfig.mainAccountID) {
            manager.getOrganizations(accountId, userId, null, function(err, organizations){
                self.log.debug(accountId, userId, '<< listAllOrganizations');
                self.sendResultOrError(resp, err, organizations, 'Error listing organization');
            });
        }else {
            manager.getOrgByAccountId(accountId, userId, function(err, organization){
                self.log.debug(accountId, userId, '<< getOrgByAccountId');
                self.sendResultOrError(resp, err, _(organization).toArray(), 'Error listing organization');
            });
        }
        
        

    }
});

module.exports = new api({version:'2.0'});

