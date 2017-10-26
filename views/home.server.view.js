/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var appConfig = require('../configs/app.config');
var _req = null;
var isGroupAdmin = false;
var view = function(req,resp,options) {
    this.init.apply(this, arguments);
    _req = req;
    if(options.isGroupAdmin) {
        isGroupAdmin = options.isGroupAdmin;
    }
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(root) {
        var data = {
            router:"home",
            root:root || "home",
            location:"home",
            includeHeader:true,
            includeFooter:true,
            domainPrefix: ''
        };
        
        if (appConfig.nonProduction === true && appConfig.environment !== appConfig.environments.DEVELOPMENT) {
            data.domainPrefix = ".test";
        }
        var self = this;
        this.getAccountByHost(_req, function(err, value) {
            if (!err && value != null) {
                data.account = value.toJSON();
            }
            if(data.account && data.account.orgId){
                self.getOrganizationByAccountId(data.account._id, function(err, org){
                    if (!err && org != null) {
                        var _orgDomain = org.get("orgTitle");
                        if(_orgDomain){
                            data.title = _orgDomain;
                        }
                    }
                    data.isGroupAdmin = isGroupAdmin;
                    data.includeJs = false;
                    data = self.baseData(data);
                    data.accounts = self.req.session.accounts;
                    //console.dir(data.accounts);
                    self.resp.render('home_new', data);
                    self.cleanUp();
                    data = self = null;
                })
            }
            else{
                data.isGroupAdmin = isGroupAdmin;
                data.includeJs = false;
                data = self.baseData(data);
                data.accounts = self.req.session.accounts;
                //console.dir(data.accounts);
                self.resp.render('home_new', data);
                self.cleanUp();
                data = self = null;
            }
            
        });
    }
});

$$.v.HomeView = view;

module.exports = view;
