/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/ssldotcom.dao');
var config = require('../configs/ssldotcom.config');
var endpoint = config.SSLDOTCOM_TEST_ENDPOINT;
var route53dao = require('../dao/integrations/route53.dao');

var async = require('async');
var pem = require('pem');

module.exports = {

    log: global.getLogger('certificate_manager'),

    addDomainToCert: function(domain, certRef, privateKey, fn) {
        var self = this;
        /*
         * Do these steps:
         * 1. Get the current cert
         * 2. Add the domain
         * 3. update the domain
         * 4. Get the validation methods
         * 5. Update the route53 validation
         */

        var ref = certRef;
        var cert = null;
        var domains = [];
        var domainsWithValidationMethod = {};

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
                                self.log.debug('about to concat:', _cert.subject_alternative_names);
                                domains = domains.concat(_cert.subject_alternative_names);
                                self.log.debug('domains:', domains);

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
            function generateCSR(cb) {
                self.log.debug('generating new csr');
                domains.push(domain);

                //TODO: make these configurable
                var options = {
                    clientKey:privateKey,
                    keyBitSize: 2048,
                    hash:'sha256',
                    country:'US',
                    state:'California',
                    locality:'La Jolla',
                    organization:'Indigenous Software, Inc',
                    organizationUnit:'',
                    commonName: '*.indigenous.io',
                    altNames:domains,
                    emailAddress:'admin@indigenous.io'
                };
                self.log.debug('pem options:', options);
                pem.createCSR(options, function(err, csrAndClientKey){
                    if(err) {
                        self.log.error('Error generating CSR', err);
                        cb(err);
                    } else {
                        self.log.debug('Generated the following:', csrAndClientKey);
                        cb(null, csrAndClientKey.csr);
                    }
                });
            },
            function updateCert(csr, cb) {
                //return cb();
                self.log.debug('updating certificate');
                cert.domains = domains;

                _.each(domains, function(domain){
                    domainsWithValidationMethod[domain] = {'dcv':'CNAME_CSR_HASH'};
                });
                /*
                 * Build contacts object
                 */
                var contacts = {
                    'all': {
                        'first_name': config.CONTACT_FNAME,
                        'last_name' : config.CONTACT_LNAME,
                        'email' : config.CONTACT_EMAIL,
                        'phone': config.CONTACT_PHONE,
                        'country': config.CONTACT_COUNTRY
                    }
                };


                dao.updateCertificate(ref,
                    config.SSLDOTCOM_ACCOUNT_KEY,
                    config.SSLDOTCOM_SECRET_KEY,
                    csr,
                    config.SSLDOTCOM_SERVER_SOFTWARE,
                    domainsWithValidationMethod,
                    config.REG_ORGANIZATION,
                    config.REG_ORGANIZATION_UNIT,
                    config.REG_PO_BOX,
                    config.REG_STREET_ADDRESS_1,
                    config.REG_STREET_ADDRESS_2,
                    config.REG_STREET_ADDRESS_3,
                    config.REG_LOCALITY,
                    config.REG_STATE,
                    config.REG_POSTAL_CODE,
                    config.REG_COUNTRY,
                    null, null, null, null,
                    null, null, contacts, null,
                    endpoint,
                    function(err, value){
                        if(err) {
                            self.log.error('Error updating certificate:' + err);
                            cb(err);
                        } else {
                            cb(null);
                        }
                    }
                );
            },
            function getValidationMethods(cb){
                self.log.debug('Getting validation requirements');

                dao.getCertificateValidationMethods(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, endpoint, function(err, value){
                    self.log.debug('error:', err);
                    self.log.debug('value:', value);
                    if(value) {
                        var csr_md5 = value.md5_hash;
                        var csr_sha1 = value.sha1_hash;
                        var dcv_methods = value.dcv_methods;
                        self.log.debug('dcv:', dcv_methods);
                        cb(null, csr_md5, csr_sha1, dcv_methods);
                    } else {
                        cb(err);
                    }

                });
            },
            function updateRoute53(md5, sha1, dcv, cb) {
                self.log.debug('calling route53');
                route53dao.addCNAMERecord(domain, md5+'.'+domain, sha1+'.comodoca.com', function(err, value){
                    cb();
                });

            },
            function requestValidation(cb) {
                self.log.debug('waiting 20 seconds for dns propagation');
                setTimeout(function(){
                    self.log.debug('requesting validation');
                    dao.requestValidation(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY,
                        domainsWithValidationMethod, endpoint, function(err, value){
                            self.log.debug('cert:', value);
                            cb();
                        });
                }, 20000);

            },
            function delayAndThenGetCert(cb) {
                self.log.debug('waiting 120 seconds for validation to complete.')
                setTimeout(function(){
                    self.log.debug('Attempting to get the cert');
                    dao.getCertificate(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, null, null, null,
                        endpoint,
                        function(err, _cert){
                            self.log.debug('cert:', _cert);
                            cb();
                        }
                    );
                }, 120000);
            }
        ], function done(err){
            self.log.debug('done');
            fn(err, 'Done');
        });


    },

    validateDomain: function(domain, certRef,  fn) {
        var self = this;
        self.log.debug('>> validateDomain');
        var domainsWithValidationMethod = {};
        domainsWithValidationMethod[domain] = {'dcv':'CNAME_CSR_HASH'};
        dao.requestValidation(certRef, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, domainsWithValidationMethod,
            endpoint, function(err, value){
                self.log.debug('response:', value);
                self.log.debug('<< validateDomain');
                fn(err, value);
            }
        );
    },

    _waitForValidation: function(certRef, maxTries, fn) {

    }

};