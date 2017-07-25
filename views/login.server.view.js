/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var appConfig = require('../configs/app.config');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            includeJs:true,
            includeHeader:false,
            includeFooter:false
        });

        var self = this;
        this.getAccount(function(err, value) {
            if (!err && value != null) {
                data.account = value.toJSON()
            }
            if(data.account && data.account.orgId){
                self.getOrganizationByAccountId(data.account._id, function(err, org){
                    if (!err && org != null) {
                        var _orgDomain = org.get("orgTitle");
                        if(_orgDomain){
                            data.title = _orgDomain;
                        }
                    }
                    data.message = self.req.session.errorMsg;
                    data.wwwUrl = appConfig.www_url;
                    self.resp.render('login', data);
                    self.cleanUp();
                    data = self = null;
                })
            }
            else{
                data.message = self.req.session.errorMsg;
                data.wwwUrl = appConfig.www_url;
                self.resp.render('login', data);
                self.cleanUp();
                data = self = null;
            }
            
        });

    }

});

$$.v.LoginView = view;

module.exports = view;
