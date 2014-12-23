/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../base.dao.js');
var awsConfigs = require('../../configs/aws.config.js');
var crypto = require('crypto');
var appConfig = require('../../configs/app.config');
var AWS = require('aws-sdk');

var dao = {

    options: {
        name: "route53.dao",
        defaultModel: $$.m.User
    },

    checkDomainAvailability: function(name, fn) {
        var self = this;
        self.log.debug('>> checkDomainAvailability');
        var options = {
            accessKeyId: awsConfigs.accessKeyId,
            secretAccessKey: awsConfigs.secretAccessKey,
            endpoint: awsConfigs.route53Endpoint,
            region: awsConfigs.route53Region
        }
        var route53domains = new AWS.Route53Domains(options);
        var params = {
            DomainName: name
        };
        //self.log.debug('Making a call.');
        route53domains.checkDomainAvailability(params, function(err, data) {
            //self.log.debug('got a response');
            if(err) {
                self.log.error('Error checking domain availability: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< checkDomainAvailability');
                fn(null, data);
            }
        });
    }

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.Route53Dao = dao;

module.exports = dao;