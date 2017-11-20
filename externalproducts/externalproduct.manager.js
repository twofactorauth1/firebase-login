
var dao = require('./dao/externalproduct.dao');

var log = $$.g.getLogger("externalproduct_manager");
var async = require('async');
var externalProductAccountId = process.env.EXTERNAL_PRODUCT_ACCOUNTID || 0;
var scheduledJobsManager = require('../scheduledjobs/scheduledjobs_manager');
var emailMessageManager = require('../emailmessages/emailMessageManager');

var manager = {
    log:log,

    listExternalProducts: function(fn) {
        dao.listNativeExternalProducts(fn);
    },

    loadExternalProducts: function(fn) {
        var self = this;
        self.log.debug('>> loadExternalProducts');
        async.waterfall([
            function(cb) {
                self.listExternalProducts(cb);
            },
            function(externalProductAry, cb) {
                self.log.debug(0,0, 'Bulk inserting [' + externalProductAry.length + '] records');
                dao.dropCollection('new_externalproducts', function(){

                    _.each(externalProductAry, function(externalProduct){
                        externalProduct._id = $$.u.idutils.generateUUID();
                        externalProduct.accountId = parseInt(externalProductAccountId);
                    });
                    dao.bulkInsert(externalProductAry, 'new_externalproducts', function(err, value){
                        if(!err) {
                            dao.renameCollection('new_externalproducts', 'externalproducts', function(err, value){
                                self.log.debug(0, 0, '<< loadExternalProducts');
                                cb(err, externalProductAry.length);
                            });
                        } else {
                            self.log.error('Error during bulk insert:', err);
                            cb(err);
                        }

                    });
                });
            }
        ], function(err, numLoaded){
            self.log.debug('<< loadExternalProducts');
            fn(err, numLoaded);
        });
    },

    runExternalProductsJob: function() {
        var self = this;
        self.log.debug(0, 0, '>> runExternalProductsJob');
        try {
            self.loadExternalProducts(function(){
                self.log.debug(0, 0, '<< runExternalProductsJob');
            });


            self.log.debug(0,0, 'Scheduling next run');
            //schedule next run

            var code = '$$.u.epManager.runExternalProductsJob();';
            var send_at = moment().minute(0);

            send_at = moment(send_at).add(1, 'hours');
            self.log.debug('Scheduling ahead an hour');

            var scheduledJob = new $$.m.ScheduledJob({
                accountId: 0,
                scheduledAt: moment(send_at).toDate(),
                runAt: null,
                job: code
            });
            scheduledJobsManager.scheduleJob(scheduledJob, function (err, value) {
                if (err || !value) {
                    self.log.error(0, 0, 'Error scheduling job with manager:', err);
                } else {
                    self.log.debug(0, 0, 'scheduled next job:', value.get('scheduledAt'));
                }
            });
        } catch(exception) {
            self.log.error('Error scheduling external products job:', exception);
            emailMessageManager.notifyAdmin('devops@indigenous.io', 'devops@indigenous.io', null,
                'Error loading External Products:', '', exception, function(_err, value){

                });
        }
    },

    externalProductSearch: function(accountId, userId, term, fieldSearch, skip, limit, sortBy, sortDir, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> externalProductSearch');
        var regex = new RegExp('\.*'+term+'\.*', 'i');
        var intTerm = parseInt(term);
        var query = {};
        var orQuery = [
            {clientid:intTerm},
            {productid:intTerm},
            {productnumber:regex},
            {categoryid:intTerm},
            {subcategoryid:intTerm},
            {vendor:regex},
            {productitle:regex},
            {productshortdescription:regex},
            {productdescription:regex},
            {produtvideo:regex},
            {inactive:regex},
            {categorytitle:regex},
            {imageid:intTerm},
            {imagepath:regex},
            {imagemega:regex},
            {imageorder:intTerm},
            {industryid:regex},
            {tagid:regex}
        ];
        if(fieldSearch){
            var fieldSearchArr = [];
            var intFields = ['clientid', 'productid', 'categoryid', 'subcategoryid', 'imageid'];
            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];
                self.log.debug('value:', value);
                if(value){
                    if (_.contains(intFields, key)) {
                        var obj = {};
                        obj[key] = parseInt(value);
                        fieldSearchArr.push(obj);
                    } else {
                        var obj = {};
                        obj[key] = new RegExp(value, 'i');
                        fieldSearchArr.push(obj);
                    }

                }
            }
            if(fieldSearchArr.length){
                query["$and"] = fieldSearchArr;
            }
            if(term){
                query["$or"] = orQuery;
            }
        } else {
            query = {
                $or: orQuery
            };
        }
        dao.findWithFieldsLimitOrderAndTotal(query, skip, limit, sortBy, null, $$.m.ExternalProduct, sortDir, function(err, list){
            if(err) {
                self.log.error(accountId, userId, 'Error searching external products:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< externalProductSearch');
                fn(null, list);
            }
        });
    },

    getExternalProduct: function(accountId, userId, productId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getExternalProduct', productId);
        dao.getById(productId, $$.m.ExternalProduct, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error getting product:', err);
                fn(err);
            } else {
                self.log.debug('<< getExternalProduct');
                fn(null, value);
            }
        });
    }
};
$$.u = $$.u || {};
$$.u.epManager = manager;
module.exports = manager;