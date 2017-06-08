/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var promotionDao = require('../../promotions/dao/promotion.dao');
var promotionManager = require('../../promotions/promotion_manager');
var formidable = require('formidable');

require('../../promotions/model/promotion');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "promotions",

    version: "2.0",

    dao: promotionDao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listPromotions.bind(this));       
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createPromotion.bind(this));
        
               
    },

    listPromotions: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listPromotions');
        promotionManager.listPromotions(accountId, userId, function(err, list){
            self.log.debug(accountId, userId, '<< listPromotions');
            return self.sendResultOrError(resp, err, list, "Error listing orders");
        });
    },

    createPromotion: function(req, res) {
        var self = this;
        self.log.debug('>> createPromotion');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed){
            // if(isAllowed !== true) {
            //     return self.send403(res);
            // } else {
                var userId = self.userId(req);

                form.parse(req, function(err, fields, files) {
                    if(err) {
                        self.wrapError(res, 500, 'fail', 'The upload failed', err);
                        self = null;
                        return;
                    } else {

                        var file = files['file'];
                        
                        var body = JSON.parse(fields['promotion']);

                        var promotion = new $$.m.Promotion(body);
                        var adminUrl = fields['adminUrl'];

                        
                        var fileToUpload = {};
                        fileToUpload.mimeType = file.type;
                        fileToUpload.size = file.size;
                        fileToUpload.name = file.name;
                        fileToUpload.path = file.path;
                        fileToUpload.type = file.type;


                        promotion.set("accountId", accountId);
                        promotion.set("userId", userId);

                        if(body.startDate){
                            console.log("startDate");
                            promotion.set("startDate", moment(body.startDate).toDate());
                        }
                        if(body.expirationDate){
                            console.log("expirationDate")
                            promotion.set("expirationDate", moment(body.expirationDate).toDate());
                        }
                        promotionManager.createPromotion(fileToUpload, adminUrl, promotion, accountId, userId, function(err, value, file){                                                       
                            self.sendResultOrError(res, err, value, 'Could not create promotion');
                            self.createUserActivity(req, 'CREATE_PROMOTION', null, null, function(){});
                        });
                    }


                });
            // }
        // });

    }

});

module.exports = new api({version:'2.0'});
