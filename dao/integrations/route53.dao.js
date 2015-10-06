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
var tldtools = require('tldtools').init();

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
    },

    addCNAMERecord: function(domain, name, value, fn) {
        var self = this;
        self.log.debug('>> addCNAMERecord');
        var route53 = new AWS.Route53({
            accessKeyId: awsConfigs.accessKeyId,
            secretAccessKey: awsConfigs.secretAccessKey
            //endpoint: awsConfigs.route53ZonesEndpoint,
            //region: awsConfigs.route53Region
        });
        //get the hosted zone

        self.log.debug('Route53:', route53);
        route53.listHostedZones({}, function(err, data) {
            if (err){
                console.log(err, err.stack);
                fn();
            } else {
                var obj = tldtools.extract('http://' + domain);
                var nakedDomain = obj.domain + '.' + obj.tld;
                self.log.debug('Got this from the amazon:', data);
                //data = JSON.parse(data);
                self.log.debug('0', data.HostedZones[0]);
                self.log.debug('0.name', data.HostedZones[0].Name);
                var zone = _.find(data.HostedZones, function(zone){return zone.Name === nakedDomain+'.'});
                self.log.debug('Is this your card?', zone);
                if(zone) {
                    var params = {
                        "HostedZoneId": zone.Id, // our Id from the first call
                        "ChangeBatch": {
                            "Changes": [
                                {
                                    "Action": "CREATE",
                                    "ResourceRecordSet": {
                                        "Name": name,
                                        "Type": "CNAME",
                                        "TTL": 300,
                                        "ResourceRecords": [
                                            {
                                                "Value": value
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    };

                    route53.changeResourceRecordSets(params, function(err,data) {
                        console.log(err,data);
                        fn();
                    });
                } else {
                    self.log.debug('No zone found');
                    fn();
                }

            }

        });
    }

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.Route53Dao = dao;

module.exports = dao;