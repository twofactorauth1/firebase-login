/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var promotionDao = require('./dao/promotion.dao.js');
var log = $$.g.getLogger("promotion_manager");
var async = require('async');
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var appConfig = require('../configs/app.config');

var accountDao = require('../dao/account.dao');
var shipmentDao = require('./dao/shipment.dao.js');

var scheduledJobsManager = require('../scheduledjobs/scheduledjobs_manager');
var emailMessageManager = require('../emailmessages/emailMessageManager');
require('./model/promotionReport');

//var pdfGenerator = require('html-pdf');
var conversion = require("phantom-html-to-pdf")();
var manager = {

    createPromotion: function(file, adminUrl, promotion, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> createPromotion');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };


        if(file.path) {
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
            var subdir = 'account_' + promotion.get('accountId');
            if(appConfig.nonProduction === true) {
                subdir = 'test_' + subdir;
            }

            s3dao.uploadToS3(bucket, subdir, file, true, function(err, value){
                if(err) {
                    self.log.error('Error from S3: ' + err);
                    uploadPromise.reject();
                    fn(err, null);
                } else {
                    self.log.debug('S3 upload complete');
                    console.dir(value);

                    if(value && value.url) {
                        value.url = value.url.replace("s3.amazonaws.com", "s3-us-west-1.amazonaws.com");
                    }

                    if (value.url.substring(0, 5) == 'http:') {
                      attachment.url = value.url.substring(5, value.url.length);
                    } else {
                      attachment.url = value.url;
                    }

                    promotion.set("attachment", attachment);
                    console.log(promotion);
                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //create record
        $.when(uploadPromise).done(function(file){

            promotionDao.saveOrUpdate(promotion, function(err, savedPromotion){
                if(err) {
                    self.log.error('Exception during promotion creation: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug(accountId, userId, '<< createPromotion');
                    fn(null, savedPromotion, file);
                }
            });

        });

    },

    listPromotions: function(accountId, userId, cardCodeAry, vendorFilter, fn) {
        var self = this;
        self.log = log;
        log.debug(accountId, userId, '>> listPromotions');
        var query = {
            'accountId':accountId
        };
        if(cardCodeAry && cardCodeAry.length > 0) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'accountId':accountId,
                'participants.cardCode': {$in:optRegexp}
            };
        }
        if(vendorFilter){
            query.vendor = new RegExp(vendorFilter, "i");
        }
        console.log(query);
        promotionDao.findMany(query, $$.m.Promotion, function(err, list){
            if(err) {
                log.error('Exception listing promotions: ' + err);
                fn(err, null);
            } else {

                //fn(null, list);
                async.eachSeries(list, function(promotion, cb){
                    shipmentDao.findCount({promotionId: promotion.id(), accountId: accountId}, $$.m.Shipment, function(err, value){
                        if(err) {
                            cb(err);
                        } else {
                            promotion.set("shipmentCount", value);
                            cb();
                        }
                    })
                }, function(err){
                    if(err) {
                        self.log.error('Error getting shipments:', err);
                        return fn(err);
                    } else {
                        log.debug(accountId, userId, '<< listPromotions');
                        fn(null, list);
                    }
                });
            }
        });
    },


    getPromotionDetails: function(accountId, userId, promotionId, cardCodeAry, vendorFilter, fn) {
        var self = this;
        log.debug(accountId, userId, '>> getPromotionDetails');
        var query = {_id: promotionId};
        if(cardCodeAry && cardCodeAry.length > 0 ) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'accountId':accountId,
                'participants.cardCode': {$in:optRegexp}
            };
        }

        if(vendorFilter){
            query.vendor = new RegExp(vendorFilter, "i");
        }
        console.log(query);
        promotionDao.findOne(query, $$.m.Promotion, function(err, value){
            if(err) {
                log.error(accountId, userId, 'Exception getting promotion: ' + err);
                fn(err, null);
            } else {
                log.debug(accountId, userId, '<< getPromotionDetails');
                fn(null, value);
            }
        });
    },

    deletePromotion: function(accountId, userId, promotionId, fn){
        var self = this;
        log.debug(accountId, userId, '>> deletePromotion');
        var query = {_id: promotionId};

        promotionDao.removeByQuery(query, $$.m.Promotion, function(err, value){
            if(err) {
                self.log.error('Error deleting promotion: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< deletePromotion');
                shipmentDao.removeByQuery(query, $$.m.Shipment, function(err, value){
                    if(err) {
                        self.log.error('Error deleting shipments: ' + err);
                        return fn(err, null);
                    } else {
                        log.debug(accountId, userId, '<< deletePromotion');
                        fn(null, value);
                    }
                });
            }
        });
    },

    saveOrUpdatePromotion: function(accountId, userId, promotion, promotionId, fn) {
        var self = this;
        log.debug(accountId, userId, '>> saveOrUpdatePromotion');
        promotionDao.saveOrUpdate(promotion, function(err, value){
            if(err) {
                self.log.error('Error saving promotion: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< saveOrUpdatePromotion');
                fn(null, value);
            }
        });
    },

    updatePromotionAttachment: function(file, promotionId, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> updatePromotionAttachment');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };

        if(file.path) {
            // to do-  need to change bucket
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
            var subdir = 'account_' + accountId;
            if(appConfig.nonProduction === true) {
                subdir = 'test_' + subdir;
            }

            s3dao.uploadToS3(bucket, subdir, file, true, function(err, value){
                if(err) {
                    self.log.error('Error from S3: ' + err);
                    uploadPromise.reject();
                    fn(err, null);
                } else {
                    self.log.debug('S3 upload complete');
                    console.dir(value);

                    if(value && value.url) {
                        value.url = value.url.replace("s3.amazonaws.com", "s3-us-west-1.amazonaws.com");
                    }

                    if (value.url.substring(0, 5) == 'http:') {
                      attachment.url = value.url.substring(5, value.url.length);
                    } else {
                      attachment.url = value.url;
                    }

                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //update attachment
        $.when(uploadPromise).done(function(file){
            console.log(promotionId);
            promotionDao.getById(promotionId, $$.m.Promotion, function(err, promotion){
                if(err) {
                    log.error(accountId, userId, 'Exception getting promotion: ' + err);
                    fn(err, null);
                } else {
                    promotion.set("attachment", attachment);
                    console.log(promotion);
                    promotionDao.saveOrUpdate(promotion, function(err, savedPromotion){
                        if(err) {
                            self.log.error('Exception during promotion creation: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug(accountId, userId, '<< updatePromotionAttachment');
                            fn(null, savedPromotion, file);
                        }
                    });
                }
            });


        });

    },

    saveOrUpdateShipment: function(accountId, userId, shipment, shipmentId, fn) {
        var self = this;
        log.debug(accountId, userId, '>> saveOrUpdateShipment');
        shipmentDao.saveOrUpdate(shipment, function(err, value){
            if(err) {
                self.log.error('Error saving shipment: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< saveOrUpdateShipment');
                fn(null, value);
            }
        });
    },

    updateShipmentAttachment: function(file, shipmentId, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> updateShipmentAttachment');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };

        if(file.path) {
            // to do-  need to change bucket
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
            var subdir = 'account_' + accountId;
            if(appConfig.nonProduction === true) {
                subdir = 'test_' + subdir;
            }

            s3dao.uploadToS3(bucket, subdir, file, true, function(err, value){
                if(err) {
                    self.log.error('Error from S3: ' + err);
                    uploadPromise.reject();
                    fn(err, null);
                } else {
                    self.log.debug('S3 upload complete');
                    console.dir(value);

                    if(value && value.url) {
                        value.url = value.url.replace("s3.amazonaws.com", "s3-us-west-1.amazonaws.com");
                    }

                    if (value.url.substring(0, 5) == 'http:') {
                      attachment.url = value.url.substring(5, value.url.length);
                    } else {
                      attachment.url = value.url;
                    }

                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //update attachment
        $.when(uploadPromise).done(function(file){
            console.log(shipmentId);
            shipmentDao.getById(shipmentId, $$.m.Shipment, function(err, shipment){
                if(err) {
                    log.error('Exception getting shipment: ' + err);
                    fn(err, null);
                } else {
                    shipment.set("attachment", attachment);
                    console.log(shipment);
                    promotionDao.saveOrUpdate(shipment, function(err, savedShipment){
                        if(err) {
                            self.log.error('Exception during shipment creation: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug(accountId, userId, '<< updateShipmentAttachment');
                            fn(null, savedShipment, file);
                        }
                    });
                }
            });

        });

    },

    listShipments: function(accountId, userId, promotionId, cardCodeAry, fn) {
        var self = this;
        log.debug(accountId, userId, '>> listShipments', promotionId);
        var query = {
            'promotionId':promotionId
        };
        if(cardCodeAry && cardCodeAry.length > 0) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'promotionId':promotionId,
                'cardCode': {$in:optRegexp}
            };
        }
        shipmentDao.findMany(query, $$.m.Shipment, function(err, list){
            if(err) {
                log.error(accountId, userId, 'Exception listing shipments: ', err);
                fn(err, null);
            } else {
                log.debug(accountId, userId, '<< listShipments');
                fn(null, list);
            }
        });
    },

    generateReportForShipments: function(accountId, userId, promotionId, view, cardCodeAry, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> generateReportForShipments(' + view +')');


        var self = this;
        var query = {
            promotionId:promotionId
        };
        if(cardCodeAry && cardCodeAry.length > 0) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'promotionId':promotionId,
                'cardCode': {$in:optRegexp}
            };
        }
        promotionDao.findOne({_id: promotionId}, $$.m.Promotion, function(err, value){
            if(err) {
                log.error(accountId, userId, 'Exception getting promotion: ' + err);
                fn(err, null);
            } else {
                var component = {};
                component.reportName = value.get("title") || "Shipments Report";
                component.reportDate = value.getReportDate();

                shipmentDao.findMany(query, $$.m.Shipment, function(err, list){
                    if(err) {
                        fn(err, null);
                    } else {

                        component.totalShipments = list.length;
                        component.reports = 0;
                        component.tryState = 0;
                        component.buyState = 0;
                        component.rmaState = 0;
                        component.configured = 0;
                        component.deployed = 0;
                        component.wonCost = 0;
                        component.openCost = 0;
                        component.lostCost = 0;
                        component.uniqueVars = 0;
                        component.uniqueCustomers = 0;
                        var vars = [];
                        var customers = [];
                        _.each(list, function (shipment) {
                            if(shipment.get("attachment") && shipment.get("attachment").name){
                                component.reports += 1;
                            }
                            if(shipment.get("status") === "TRY"){
                                component.tryState += 1;
                                component.openCost += shipment.getShipmentPrice();
                            }
                            if(shipment.get("status") === "BUY"){
                                component.buyState += 1;
                                component.wonCost += shipment.getShipmentPrice();
                            }
                            if(shipment.get("status") === "RMA"){
                                component.rmaState += 1;
                                component.lostCost += shipment.getShipmentPrice();
                            }
                            if(shipment.get("configDate")){
                                component.configured += 1;
                            }
                            if(shipment.get("deployDate")){
                                component.deployed += 1;
                            }

                            if(shipment.getShipmentVar()){
                                vars.push(shipment.getShipmentVar())
                            }
                            if(shipment.getCustomerName()){
                                customers.push(shipment.getCustomerName());
                            }

                            shipment.configDate = shipment.getFormattedDate("configDate");
                            shipment.deployDate = shipment.getFormattedDate("deployDate");
                            shipment.shipDate = shipment.getFormattedDate("shipDate");
                            shipment.endDate = shipment.getFormattedDate("endDate");
                            shipment.status = shipment.getStatus();
                            shipment.VAR = shipment.get("companyName");
                            shipment.customerDetails = shipment.getCustomerDetails("<br>");
                            shipment.customerProject = shipment.getCustomerProject();
                            shipment.customerPartner = shipment.getCustomerPartner();
                            shipment.customerJuniperRep = shipment.getCustomerJuniperRep();
                            shipment.products = shipment.getProductsWithSerialNumber();
                        });

                        component.wonCost = self._parseCurrency("$", component.wonCost);
                        component.openCost = self._parseCurrency("$", component.openCost);
                        component.lostCost = self._parseCurrency("$", component.lostCost);
                        component.uniqueVars = _.uniq(vars).length;
                        component.uniqueCustomers = _.uniq(customers).length;
                        component.shipments = list;

                        app.render('promotions/shipment-html-view', component, function(err, html){
                            if(err) {
                                console.log(err);
                            } else {
                                if(view == 'html'){
                                    fn(null, html);
                                } else{
                                    conversion({ html: html }, function(err, pdf) {
                                      console.log(pdf.logs);
                                      console.log(pdf.numberOfPages);
                                      fn(null, pdf.stream);
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });

    },

    deleteShipment: function(accountId, userId, shipmentId, fn){
        var self = this;
        log.debug(accountId, userId, '>> deleteShipment');
        var query = {_id: shipmentId};

        shipmentDao.removeByQuery(query, $$.m.Shipment, function(err, value){
            if(err) {
                self.log.error('Error deleting shipment: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< deleteShipment');
                fn(null, value);
            }
        });
    },

    exportShipments: function(accountId, userId, promotionId, cardCodeAry, fn) {
        var self = this;
        log.debug(accountId, userId, '>> exportShipments', promotionId);
        var query = {
            'promotionId':promotionId
        };
        if(cardCodeAry && cardCodeAry.length > 0) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'promotionId':promotionId,
                'cardCode': {$in:optRegexp}
            };
        }
        shipmentDao.findMany(query, $$.m.Shipment, function(err, list){
            if(err) {
                log.error(accountId, userId, 'Exception listing shipments: ', err);
                fn(err, null);
            } else {
                var headers = ['VAR', 'Products', 'Ship Date', 'Config Date', 'Deploy Date', 'End Date', 'Status', 'Total', 'Customer', 'Project', 'Partner Sales Rep', 'Juniper Rep'];
                var csv = headers + '\n';
                _.each(list, function(shipment){
                    csv += self._parseString(shipment.get('companyName'));
                    csv += self._parseString(shipment.getProductsWithSerialNumber());
                    csv += self._parseString(shipment.getFormattedDate("shipDate"));
                    csv += self._parseString(shipment.getFormattedDate("configDate"));
                    csv += self._parseString(shipment.getFormattedDate("deployDate"));
                    csv += self._parseString(shipment.getFormattedDate("endDate"));
                    csv += self._parseString(shipment.getStatus());
                    csv += self._parseString(self._parseCurrency("$", shipment.getShipmentPrice()));
                    csv += self._parseString(shipment.getCustomerDetails());
                    csv += self._parseString(shipment.getCustomerProject());
                    csv += self._parseString(shipment.getCustomerPartner());
                    csv += self._parseString(shipment.getCustomerJuniperRep());
                    csv += '\n';
                });
                log.debug(accountId, userId, '<< exportShipments');
                fn(null, csv);
            }
        });
    },

    createPromotionReport: function(accountId, userId, promotionId, cardCodeRestrictions, recipientAry, startOnDate, repeatInterval, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> createPromotionReport');
        /*
         * validate repeatInterval: (weekly|monthly)
         */
        if(repeatInterval !== 'weekly') {
            repeatInterval = 'monthly';
        }
        var promotionReport = new $$.m.PromotionReport({
            accountId:accountId,
            promotionId:promotionId,
            cardCodeRestrictions:cardCodeRestrictions,
            recipients:recipientAry,
            startOn:startOnDate,
            repeat:repeatInterval,
            created:{
                date:new Date(),
                by:userId
            }
        });
        promotionDao.findOne({_id:promotionId}, $$.m.Promotion, function(err, promotion){
            if(err) {
                self.log.error(accountId, userId, 'Error finding promotion:', err);
                fn(err);
            } else {
                promotionReport.set('subject', 'Securematics Portal Promotion Report: ' + promotion.get('title'));
                promotionDao.saveOrUpdate(promotionReport, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving promotionReport:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, 'Saved the report.  Scheduling.');
                        var jobString = '$$.u.promotionManager.runReport(\'' + value.id() + '\');';
                        var job = new $$.m.ScheduledJob({
                            accountId: accountId,
                            scheduledAt: startOnDate,
                            runAt: null,
                            job:jobString,
                            executing:false,
                            completedAt: null,
                            created: {
                                date: new Date(),
                                by: userId
                            }
                        });
                        scheduledJobsManager.scheduleJob(job, function(err, scheduledJob){
                            if(err) {
                                self.log.error(accountId, userId, 'Error scheduling job:', err);
                                fn(err);
                            } else {
                                self.log.debug(accountId, userId, '<< createPromotionReport');
                                fn(null, value);
                            }
                        });
                    }
                });
            }
        });

    },

    listReports: function(accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> listReports');
        var query = {accountId:accountId};//TODO: might need more security.  promotionId?
        promotionDao.findMany(query, $$.m.PromotionReport, function(err, list){
            if(err) {
                self.log.error(accountId, userId, 'Error listing reports:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< listReports');
                fn(null, list);
            }
        });
    },

    updateReport: function(accountId, userId, reportId, patchObject, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> updateReport');
        promotionDao.findOne({_id:reportId}, $$.m.PromotionReport, function(err, report){
            if(err) {
                self.log.error(accountId, userId, 'Error finding report:', err);
                fn(err);
            } else if (!report) {
                self.log.error(accountId, userId, 'Could not find report with ID [' + reportId + ']');
                fn('Could not find report with ID [' + reportId + ']');
            } else {
                _.each(patchObject, function(value, key){
                    report.set(key, value);
                });
                report.set('modified', {date:new Date(), by:userId});
                promotionDao.saveOrUpdate(report, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving report:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< updateReport');
                        fn(null, value);
                    }
                });
            }
        });
    },

    removeReport: function(accountId, userId, reportId, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> removeReport', reportId);
        promotionDao.removeById(reportId, $$.m.PromotionReport, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error removing report:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< removeReport');
                fn(null, value);
            }
        });
    },

    runReport: function(reportId) {
        /*
         * get the report object
         * generate the csv
         * send the email
         * reschedule the job
         */
        var self = this;
        self.log = log;
        try {
            promotionDao.findOne({_id:reportId}, $$.m.PromotionReport, function(err, report){
                if(err) {
                    self.log.error('Error finding report:', err);
                    emailMessageManager.notifyAdmin(null, null, null, 'Error running promotion report', 'Failed to run report with id [' + reportId + ']', err, function(){});
                    return;
                } else if(!report) {
                    self.log.warn('Tried to run report that does not exist.  Deleted?', reportId);
                    return;
                } else {
                    self.log.debug('Running report ', report);
                    var promotionId = report.get('promotionId');
                    var cardCodeAry = report.get('cardCodeRestrictions');
                    self.exportShipments(null, null, promotionId, cardCodeAry, function(err, csv){
                        if(err) {
                            self.log.error('Error generating CSV', err);
                            emailMessageManager.notifyAdmin(null, null, null, 'Error running promotion report', 'Failed to run report with id [' + reportId + ']', err, function(){});
                            return;
                        } else {
                            var accountId = report.get('accountId');
                            var fromName = report.get('fromName');
                            var fromAddress = report.get('fromAdddress');
                            var toAddressAry = report.get('recipients');
                            var subject = report.get('subject');
                            var content = 'Please find attached promotion report';
                            self.generateReportForShipments(accountId, null, promotionId, 'pdf', cardCodeAry, function(err, pdf){
                                if(err) {
                                    self.log.error('Error generating pdf for report:', err);
                                    emailMessageManager.notifyAdmin(null, null, null, 'Error running promotion report', 'Failed to run report with id [' + reportId + ']', err, function(){});
                                    return;
                                } else {
                                    emailMessageManager.sendPromotionReport(accountId, fromAddress, fromName, toAddressAry, subject, csv, pdf, content, function(err, value){
                                        if(err) {
                                            self.log.error('Error sending report:', err);
                                            emailMessageManager.notifyAdmin(null, null, null, 'Error running promotion report', 'Failed to run report with id [' + reportId + ']', err, function(){});
                                            return;
                                        } else {
                                            self.log.debug('Sent report.  Rescheduling');
                                            var jobString = '$$.u.promotionManager.runReport(\'' + reportId + '\');';
                                            var nextRunDate = null;
                                            if(report.get('repeat') === 'monthly') {
                                                nextRunDate = moment().add(1, 'month').toDate();
                                            } else {
                                                nextRunDate = moment().add(1, 'week').toDate();
                                            }
                                            var userId = report.get('created').by;
                                            var job = new $$.m.ScheduledJob({
                                                accountId: accountId,
                                                scheduledAt: nextRunDate,
                                                runAt: null,
                                                job:jobString,
                                                executing:false,
                                                completedAt: null,
                                                created: {
                                                    date: new Date(),
                                                    by: userId
                                                }
                                            });
                                            scheduledJobsManager.scheduleJob(job, function(err){
                                                if(err) {
                                                    self.log.error(accountId, userId, 'Error scheduling job:', err);
                                                    emailMessageManager.notifyAdmin(null, null, null, 'Error scheduling promotion report', 'Failed to reschedule report with id [' + reportId + ']', err, function(){});
                                                } else {
                                                    self.log.debug(accountId, userId, 'Next run date:', nextRunDate);
                                                }
                                            });
                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            });
        } catch(exception) {
            emailMessageManager.notifyAdmin(null, null, null, 'Error running promotion report', 'Failed to run report with id [' + reportId + ']', exception, function(){});
        }

    },

    _parseString: function(text){
        if(text==undefined)
            return ',';
        // "" added for number value
        text= "" + text;
        if(text.indexOf(',')>-1)
            return "\"" + text + "\",";
        else
            return text+",";
    },
    _parseCurrency: function(symbol, value){
        return symbol + " " + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    }
} ;

$$.u = $$.u || {};
$$.u.promotionManager = manager;
module.exports = manager;
