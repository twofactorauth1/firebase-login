/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/ssldotcom.dao');
var mainCertRef = process.env.CERTREF || '';
var config = require('../configs/ssldotcom.config');
var endpoint = config.SSLDOTCOM_TEST_ENDPOINT;

var async = require('async');
var csr = '-----BEGIN CERTIFICATE REQUEST-----\nMIIC3jCCAcYCAQAwgZgxCzAJBgNVBAYTAnVzMRMwEQYDVQQIDApDYWxpZm9ybmlh\nMRIwEAYDVQQHDAlTYW4gRGllZ28xIjAgBgNVBAoMGUluZGlnZW5vdXMgU29mdHdh\ncmUsIEluYy4xGDAWBgNVBAMMDyouaW5kaWdlbm91cy5pbzEiMCAGCSqGSIb3DQEJ\nARYTYWRtaW5AaW5kaWdlbm91cy5pbzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBAMiYTvVG3Je7k4nY5IYvwv0FuslrEcARckSiTGZ9vddYox57pgQB5emc\ndxqpk73phfB1+gUM9jK2uAZzbgLhVDRR8TSYgqtFO1pHycEzfzy8eTtTJjY0arZ1\nnZy/FNDnlaAFzkfex0nxP28sQXeZhpVQqqGKOzrTxksrYjMsDfSoEae9Am65jbV+\nxjcotRmBynmfbt3fk+8n4528ZbCnAK1kU/kgeqW34jY1c3Qtld/Q7AX/1Kd0C53Q\nRlkLNFPzthXVDPkcko54+rOjIA430+sLmDYIm06CNCjVEnAyRYTTFpsrqPsW+Prf\nSscO7opGxHqqtqRccUsFHO2ZqnOmyQ0CAwEAAaAAMA0GCSqGSIb3DQEBCwUAA4IB\nAQChMpsT6El+KWOpdWybwsZ/25Q7sZwq1otg/FZRd0UrGWyNlM6dzM/mRmPEF9Jb\n1TW8rI43gRluP4Qn976+Ewsn1ZCZTld/ChmEeq8kABYKA2juSy1wcliyBC1PFAZq\nJIp0Ip+BNZA1SExmB2GkKhMS7u23KpPYSMOE5p2FpWfnN1eCa1JIGjP+av/62DsZ\nJhgbU8B+b8XTOar0NToR0X7Q9OMuZil2rvHSzW1LnfDhJyPxZ0EWr07Ro73Tpe2r\nTX0wjwEwpA0m4WRmju738XAAK8pbVGnCGzulx0L3slmOWhew+EzjVmTB6Exkiu9Z\neayMZ8yObDVtrM8eoTXdxdId\n-----END CERTIFICATE REQUEST-----';

module.exports = {

    log: global.getLogger('certificate_manager'),

    addDomainToCert: function(domain, certRef, fn) {
        var self = this;
        /*
         * Do these steps:
         * 1. Get the current cert
         * 2. Add the domain
         * 3. update the domain
         * 4. Get the validation methods
         * 5. Update the route53 validation
         */

        var ref = certRef || mainCertRef;
        var cert = null;
        var domains = [];

        async.waterfall([
            function getCert(cb){
                self.log.debug('fetching cert');
                dao.getCertificate(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, null, null, null,
                    endpoint, function(err, _cert){
                        if(err) {
                            self.log.error('Error fetching cert', err);
                            cb(err);
                        } else {
                            _cert = JSON.parse(_cert);
                            if(_cert.domains) {
                                domains = _cert.domains;
                            } else {
                                domains.concat(_cert.subject_alternative_names);
                            }
                            if(_.contains(domains, domain)){
                                self.log.warn('The requested domain [' + domain + '] is already attached to this certificate.');
                                cb('Domain already attached to cert');
                            } else {
                                cert = _cert;
                                self.log.debug('cert is now:', cert);
                                cb(null);
                            }
                        }
                    });
            },
            function updateCert(cb) {
                self.log.debug('updating certificate');
                cert.domains = domains;

                var domainsWithValidationMethod = {};
                _.each(domains, function(domain){
                    domainsWithValidationMethod[domain] = {'dcv':'CNAME_CSR_HASH'};
                });
                /*
                 * Build contacts object because fuck having consistent data models
                 */
                var contacts = {
                    'all': {
                        'first_name': 'Mike',
                        'last_name' : 'Trevino',
                        'email' : 'admin@indigenous.io',
                        'phone': '619-507-1602',
                        'country': 'US'
                    }
                };
                cert.registrant = cert.registrant || {};

                dao.updateCertificate(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, csr, config.SSLDOTCOM_SERVER_SOFTWARE,
                    domainsWithValidationMethod,
                    cert.registrant.organization,
                    cert.registrant.organization_unit, cert.registrant.post_office_box, cert.registrant.street_address_1,
                    cert.registrant.street_address_2, cert.registrant.street_address_3, cert.registrant.locality, cert.registrant.state_or_province,
                    cert.registrant.postal_code, cert.registrant.country, null, null, null, null,
                    null, null, contacts, null, endpoint, function(err, value){
                        if(err) {
                            self.log.error('Error updating certificate:' + err);
                            cb(err);
                        } else {
                            cb(null);
                        }
                });
            },
            function getValidationMethods(cb){
                self.log.debug('Getting validation requirements');

                dao.getCertificateValidationMethods(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, endpoint, function(err, value){
                    self.log.debug('error:', err);
                    self.log.debug('value:', value);
                    cb(err);
                });
            },
            function updateRoute53(cb) {
                self.log.debug('skipping route53 for now');
                cb();
            }
        ], function done(err){
            self.log.debug('done');
            fn(err, 'Done');
        });


    }

};