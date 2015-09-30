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
var route53dao = require('../dao/integrations/route53.dao');

var async = require('async');
var pem = require('pem');

module.exports = {

    log: global.getLogger('certificate_manager'),

    addDomainToCert: function(domain, certRef,  fn) {
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
        var domainsWithValidationMethod = {};

        async.waterfall([
            function getCert(cb){
                //return cb();
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
            function generateCSR(cb) {
                //return cb(null, null);
                self.log.debug('generating new csr');
                domains.push(domain);

                var options = {
                    clientKey:self._getClientKey(),
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
                 * Build contacts object because fuck having consistent data models
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
                //9A4040DA79FC43E321070B600219957C.enduragive.org -> 46191A26150AE7B99C8FE983D434CCB746B1FB91.comodoca.com
                //return cb(null, '9A4040DA79FC43E321070B600219957C', '46191A26150AE7B99C8FE983D434CCB746B1FB91', 'dcv');
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
                //return cb();
                route53dao.addCNAMERecord(domain, md5+'.'+domain, sha1+'.comodoca.com', function(err, value){
                    cb();
                });

            },
            function getCertAgain(cb) {
                self.log.debug('requesting validation');
                dao.requestValidation(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY,
                    domainsWithValidationMethod, endpoint, function(err, value){
                    self.log.debug('cert:', value);
                        cb();
                });

            },
            function delayAndThenGetCert(cb) {
                self.log.debug('waiting 20 seconds for validation to complete.')
                setTimeout(function(){
                    self.log.debug('Attempting to get the cert');
                    dao.getCertificate(ref, config.SSLDOTCOM_ACCOUNT_KEY, config.SSLDOTCOM_SECRET_KEY, null, null, null,
                        endpoint,
                        function(err, _cert){
                            self.log.debug('cert:', _cert);
                            cb();
                        }
                    );
                }, 20000);
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

    },

    _getClientKey: function() {
        var key = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDImE71RtyXu5OJ\n2OSGL8L9BbrJaxHAEXJEokxmfb3XWKMee6YEAeXpnHcaqZO96YXwdfoFDPYytrgG\nc24C4VQ0UfE0mIKrRTtaR8nBM388vHk7UyY2NGq2dZ2cvxTQ55WgBc5H3sdJ8T9v\nLEF3mYaVUKqhijs608ZLK2IzLA30qBGnvQJuuY21fsY3KLUZgcp5n27d35PvJ+Od\nvGWwpwCtZFP5IHqlt+I2NXN0LZXf0OwF/9SndAud0EZZCzRT87YV1Qz5HJKOePqz\noyAON9PrC5g2CJtOgjQo1RJwMkWE0xabK6j7Fvj630rHDu6KRsR6qrakXHFLBRzt\nmapzpskNAgMBAAECggEAf1dRKJwnhZtqeePajuTbH8z3Ws5BonBw3ek6HwZL8d0v\nEDbmmTyrO7Y8Vgy44aLRiGkcowAret5LzKySdfmdfulV+lGnAhsdJp7UEXYjm+b5\n/xM1+ssjw1i/Cbaz/DpH3iJRZYajdOlVn7m0hbxMl5Vx/MLH/vxZsXaFDH83DMxU\nFZfboxcTH7CQ7ucewrCKNCE7CeqXn7Vzu25tW5z5WAelBqMQAbjJ+eURY+W+qBjp\nNhKNa6I8Gsu17MqCKkrCflhe/lbg5SaTOnQpF2jBv8r5sjzIEUXC1a0Fk76NgijK\nMt8ivkIJRkgEHZPUaliawTJTJMRPNnDf1DB3i43CAQKBgQD4lzBM07a21gPoPWEV\nqO1qYD2V8rBr5OiKn8nC/pB4v62WrwcxSO6j5Jzdm2gZ6Vv/YlTn4KJCnteZWzvG\n5gSR/G0yQsJXrmFI2pGOuzGqhzhBN6edwF/0qvdTy8yUtShvEqCXZ0pQjDUj0mIt\n2DRabFsEr635BoPBFM/0eJ3MLQKBgQDOkuaKElF9KobmJoaiW4ouGyIa0B/cvBHk\nDNNMXYDacyjWv/hQP8/K17GSa2vNpFmxvyMjVIsZIS9DUx3G8SpBs6/jbun5hxIO\nVlpG/uKpntGIrg0k8rD6blYVFBDRON+FX2HOq6tVtLrf0Hgqw6n5dwIpe3Dv9+i4\nMDYoTtWcYQKBgQDJ5qGIBHvly7SorxFm8ijBuSDL5Kx9NRHZZSYNhYv5RlTKiaWh\n1cZcvpTZOBs40Fuz9D1ZhwzCZxhcqcjHJpKXrxlRNP97D1pcPYjzD/6qreB2t6kf\natuEcEcoe+HQ9cG9VLexwGaPPRD74ydybKM4vcC+8aCvHSdtbmXn/P7MkQKBgDaw\nAURwUQ534bqwXFhDL7PBDyhWDPlc+MeM9atz3Zb3gcpIjC6Cljo3HBWNRr7sUaqS\n1XSW/zQp6t9B89IlKnC2Z0wootyie488IS5GcC9DkmlC2sv7TAsghr2R0FnzWolu\nlPAn1nYcIJT8FbQMlMUsUnA089MzqHKKoOvO4xJBAoGAAhLaZS6qipXnJXOQB12r\nXUr7uKN9JmtrfckJh5yiDNkWe5g32Qk+j2rE6lQzoJKzxKXiiZmhpgZJxXlavwo7\nhnEotapyL+TlBAUPGg+tneZui3Nn9UP9dlEwRwlDQf6h09LyEKJzk2oL3A0sSqJb\nu8HnDlHV3g2zsH2ixITUJKE=\n-----END PRIVATE KEY-----';
        return key;
    }

};