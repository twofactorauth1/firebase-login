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
                            if(_cert.domains) {
                                domains = _cert.domains;
                            } else {
                                domains.push(_cert.common_name);
                                domains.concat(_cert.subject_alternative_names);
                            }
                            if(_.contains(domains, domain)){
                                self.log.warn('The requested domain [' + domain + '] is already attached to this certificate.');
                                cb('Domain already attached to cert');
                            } else {
                                cert = _cert;
                                cb(null);
                            }
                        }
                    });
            },
            function updateCert(cb) {
                self.log.debug('updating certificate');
                cert.domains.push(domain);
                var contacts = {'all': cert.registrant};

                dao.updateCertificate(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, config.SSLDOTCOM_CSR, config.SSLDOTCOM_SERVER_SOFTWARE,
                domains, cert.registrant.organization, cert.registrant.organization_unit, cert.registrant.post_office_box, cert.registrant.street_address_1,
                cert.registrant.street_address_2, cert.registrant.street_address_3, cert.registrant.locality, cert.registrant.state_or_province,
                cert.registrant.postal_code, cert.registrant.country, null, null, null, null,
                null, null, contacts, null, endpoint, function(err, value){

                    });
            },
            function getValidationMethods(cb){

            },
            function updateRoute53(cb) {

            }
        ], function done(err){

        });


    }

};