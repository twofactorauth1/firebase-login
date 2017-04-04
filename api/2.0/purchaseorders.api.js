/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var poDao = require('../../purchaseorders/dao/purchase_order.dao');
var poManager = require('../../purchaseorders/purchase_order_manager');
var formidable = require('formidable');
require('../../purchaseorders/model/purchase_order');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "purchaseorders",

    version: "2.0",

    dao: poDao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listPurchaseOrders.bind(this));       
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createPurchaseOrder.bind(this));

    },

    listPurchaseOrders: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '<< listPurchaseOrders');

        poManager.listPurchaseOrders(accountId, userId, function(err, list){
            self.log.debug(accountId, userId, '<< listPurchaseOrders');
            return self.sendResultOrError(resp, err, list, "Error listing orders");
        });
    },

    
    createPurchaseOrder: function(req, res) {
        var self = this;
        self.log.debug('>> createPurchaseOrder');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var _data = req.body;
        console.log(_data);
        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var userId = self.userId(req);

                form.parse(req, function(err, fields, files) {
                    if(err) {
                        self.wrapError(res, 500, 'fail', 'The upload failed', err);
                        self = null;
                        return;
                    } else {

                        var file = files['file'];
                        var source = fields['source'] || 'S3';
                        

                        var body = JSON.parse(fields['po']);

                        var po = new $$.m.PurchaseOrder(body);

                        var fileToUpload = {};
                        fileToUpload.mimeType = file.type;
                        fileToUpload.size = file.size;
                        fileToUpload.name = file.name;
                        fileToUpload.path = file.path;

                        po.set("accountId", accountId);
                        po.set("userId", userId);

                        console.log(file);

                        poManager.createPO(fileToUpload, po, accountId, userId, function(err, value, file){                                                       
                            self.sendResultOrError(res, err, value, 'Could not save PO');
                            self.createUserActivity(req, 'CREATE_PO', null, null, function(){});
                        });
                    }


                });
            }
        });

    },

});

module.exports = new api({version:'2.0'});

