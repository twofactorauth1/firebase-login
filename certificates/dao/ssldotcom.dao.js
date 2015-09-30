/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao.js');
var sslDotComConfig = require('../../configs/ssldotcom.config');
var request = require('request');


var dao = {

    options: {
        name: "ssldotcom.dao",
        defaultModel: $$.m.User
    },


    createCertificate: function(account_key, secret_key, product, period, csr, server_software, domains, organization,
        organization_unit, post_office_box, street_address_1, street_address_2, street_address_3, locality, state_or_province,
        postal_code, country, duns_number, company_number, joi, ca_certificate_id, external_order_number, hide_certificate_reference,
        contacts, app_rep, payment_method, endpoint, fn){

        var self = this;
        self.log.debug('>> createCertificate');

        //minimal validation
        if(!account_key) {
            return fn('account_key must be specified');
        }
        if(!secret_key) {
            return fn('secret_key must be specified');
        }
        if(!product) {
            return fn('product must be specified');
        }
        if(!period) {
            return fn('period must be specified');
        }
        if(!organization) {
            return fn('organization must be specified');
        }
        if(!street_address_1) {
            return fn('street_address_1 must be specified');
        }
        if(!state_or_province) {
            return fn('state_or_province must be specified');
        }
        if(!postal_code) {
            return fn('postal_code must be specified');
        }
        if(!country) {
            return fn('country must be specified');
        }
        if(!contacts) {
            return fn('contacts must be specified');
        }

        var body = {
            account_key:account_key,
            secret_key:secret_key,
            product:product,
            period:period,
            organization:organization,
            street_address_1:street_address_1,
            state_or_province:state_or_province,
            postal_code:postal_code,
            country:country,
            contacts:contacts,
            app_rep:app_rep,
            payment_method:payment_method
        };

        if(csr) {
            body.csr = csr;
        }
        if(server_software) {
            body.server_software = server_software;
        }
        if(domains) {
            body.domains = domains;
        }
        if(organization_unit) {
            body.organization_unit = organization_unit;
        }
        if(post_office_box) {
            body.post_office_box = post_office_box;
        }
        if(street_address_2) {
            body.street_address_2 = street_address_2;
        }
        if(street_address_3) {
            body.street_address_3 = street_address_3;
        }
        if(locality) {
            body.locality = locality;
        }
        if(duns_number) {
            body.duns_number = duns_number;
        }
        if(company_number) {
            body.company_number = company_number;
        }
        if(joi) {
            body.joi = joi;
        }
        if(ca_certificate_id) {
            body.ca_certificate_id = ca_certificate_id;
        }
        if(external_order_number) {
            body.external_order_number = external_order_number;
        }
        if(hide_certificate_reference) {
            body.hide_certificate_reference = hide_certificate_reference;
        }
        if(app_rep) {
            body.app_rep = app_rep;
        }
        if(payment_method) {
            body.payment_method = payment_method;
        }

        var path = '/certificates';

        var _endpoint = endpoint;
        if(!_endpoint) {
            //figure out endpoint
            if (process.env.NODE_ENV === "testing") {
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            } else {
                //TODO: this needs to be the PROD endpoint
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            }
        }
        var options = {
            url: _endpoint+path,
            json:true,
            body:body
        };
        request.post(options, function(err, response, _body){
            self.log.debug('err: ', err);
            //self.log.debug('response:', response);
            self.log.debug('_body:', _body);
            self.log.debug('<< createCertificate');
            fn(err, _body);
        });



    },

    getCertificate: function(ref, account_key, secret_key, query_type, response_type, response_encoding, endpoint, fn) {
        var self = this;
        self.log.debug('>> getCertificate');

        //minimal validation
        if(!ref) {
            return fn('ref must be specified');
        }
        if(!account_key) {
            return fn('account_key must be specified');
        }
        if(!secret_key) {
            return fn('secret_key must be specified');
        }

        var path = '/certificate/' + ref + '/?account_key=' + account_key + '&secret_key=' + encodeURIComponent(secret_key);
        var _endpoint = endpoint;
        if(!_endpoint) {
            //figure out endpoint
            if (process.env.NODE_ENV === "testing") {
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            } else {
                //TODO: this needs to be the PROD endpoint
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            }
        }
        if(query_type) {
            path += '&query_type=' + query_type;
        } else {
            path += '&query_type=end_certificate';
        }
        if(response_type) {
            path += '&response_type=' + response_type;
        }
        if(response_encoding) {
            path += '&response_encoding=' + response_encoding;
        }
        var options = {
            url: _endpoint+path
        };
        self.log.debug('using url:', options.url);
        request.get(options, function(err, response, _body){
            self.log.debug('err: ', err);
            //self.log.debug('response:', response);
            self.log.debug('_body:', _body);
            self.log.debug('<< getCertificate');
            fn(err, _body);
        });
    },

    listCertificates: function(account_key, secret_key, start, end, filter, endpoint, fn){
        var self = this;
        self.log.debug('>> listCertificates');

        ///certificates{?account_key,secret_key,start,end,filter}
        //minimal validation
        if(!account_key) {
            return fn('account_key must be specified');
        }
        if(!secret_key) {
            return fn('secret_key must be specified');
        }

        var path = '/certificates?account_key=' + account_key + '&secret_key=' + secret_key;
        var _endpoint = endpoint;
        if(!_endpoint) {
            //figure out endpoint
            if (process.env.NODE_ENV === "testing") {
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            } else {
                //TODO: this needs to be the PROD endpoint
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            }
        }
        if(start) {
            path += '&start=' + start;
        }
        if(end) {
            path += '&end=' + end;
        }
        if(filter) {
            filter += '&filter=' + filter;
        }
        var options = {
            url: _endpoint+path
        };

        request.get(options, function(err, response, _body){
            self.log.debug('err: ', err);
            //self.log.debug('response:', response);
            self.log.debug('_body:', _body);
            self.log.debug('<< listCertificates');
            fn(err, _body);
        });

    },

    requestValidation: function(ref, account_key, secret_key, domains, endpoint, fn) {
        var self = this;
        self.log.debug('>> requestValidation');
        //minimal validation
        if(!ref) {
            return fn('ref must be specified');
        }
        if(!account_key) {
            return fn('account_key must be specified');
        }
        if(!secret_key) {
            return fn('secret_key must be specified');
        }
        if(!domains) {
            return fn('domains must be specified');
        }

        var path = '/certificate/' + ref;
        var _endpoint = endpoint;
        if(!_endpoint) {
            //figure out endpoint
            if (process.env.NODE_ENV === "testing") {
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            } else {
                //TODO: this needs to be the PROD endpoint
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            }
        }
        var body = {
            account_key:account_key,
            secret_key:secret_key,
            domains:domains,
            commit:'Validate'
        };

        var options = {
            url: _endpoint+path,
            json:true,
            body:body,
            headers: {
                'Content-Type':'application/json'
            }
        };
        request.put(options, function(err, response, _body){
            if(err) {
                self.log.debug('err: ', err);
            }

            //self.log.debug('response:', response);
            try {
                _body = JSON.parse(_body);
            } catch(exception) {
                self.log.debug('Could not parse body:', exception);
            }
            self.log.debug('_body:', _body);
            var actualErrors = _body.errors;
            self.log.error(actualErrors);
            self.log.debug('<< requestValidation');
            fn(err, _body);
        });

    },

    updateCertificate: function(ref, account_key, secret_key, csr, server_software, domains, organization,
        organization_unit, post_office_box, street_address_1, street_address_2, street_address_3, locality, state_or_province,
        postal_code, country, duns_number, company_number, joi, ca_certificate_id, external_order_number, hide_certificate_reference,
        contacts, app_rep, endpoint, fn) {
        //PUT

        var self = this;
        self.log.debug('>> updateCertificate');

        //minimal validation
        if(!ref) {
            return fn('ref must be specified');
        }
        if(!account_key) {
            return fn('account_key must be specified');
        }
        if(!secret_key) {
            return fn('secret_key must be specified');
        }
        if(!csr) {
            return fn('csr must be specified');
        }
        if(!server_software) {
            return fn('server_software must be specified');
        }
        if(!organization) {
            return fn('organization must be specified');
        }
        if(!street_address_1) {
            return fn('street_address_1 must be specified');
        }
        if(!state_or_province) {
            return fn('state_or_province must be specified');
        }
        if(!postal_code) {
            return fn('postal_code must be specified');
        }
        if(!country) {
            return fn('country must be specified');
        }
        if(!contacts) {
            return fn('contacts must be specified');
        }

        var body = {
            account_key:account_key,
            secret_key:secret_key,
            csr:csr,
            server_software:server_software,
            organization:organization,
            //stupid
            organization_name: organization,
            street_address_1:street_address_1,
            state_or_province:state_or_province,
            postal_code:postal_code,
            country:country,
            contacts:contacts,
            app_rep:app_rep
        };

        if(domains) {
            body.domains = domains;
        }
        if(organization_unit) {
            body.organization_unit = organization_unit;
            body.organization_unit_name = organization_unit;
        }
        if(post_office_box) {
            body.post_office_box = post_office_box;
        } else {
            body.post_office_box = '';
        }
        if(street_address_2) {
            body.street_address_2 = street_address_2;
        } else {
            body.street_address_2 = '';
        }
        if(street_address_3) {
            body.street_address_3 = street_address_3;
        } else {
            body.street_address_3 = '';
        }
        if(locality) {
            body.locality = locality;
        }
        if(duns_number) {
            body.duns_number = duns_number;
        }
        if(company_number) {
            body.company_number = company_number;
        }
        if(joi) {
            body.joi = joi;
        }
        if(ca_certificate_id) {
            body.ca_certificate_id = ca_certificate_id;
        }
        if(external_order_number) {
            body.external_order_number = external_order_number;
        }
        if(hide_certificate_reference) {
            body.hide_certificate_reference = hide_certificate_reference;
        }
        if(app_rep) {
            body.app_rep = app_rep;
        }

        //adding dumb stuff for validation

        body.locality_name = locality;
        body.state_or_province_name = state_or_province;
        body.country_name = country;
        body.contacts.all.po_box = '';
        body.contacts.all.address1 = '';
        body.contacts.all.address2 = '';
        body.contacts.all.address3 = '';
        body.contacts.all.city = '';
        body.contacts.all.state = '';
        body.contacts.all.postal_code = '';
        body.contacts.all.ext = '';
        body.contacts.all.fax = '';

        var path = '/certificate/' + ref;
        var _endpoint = endpoint;
        if(!_endpoint) {
            //figure out endpoint
            if (process.env.NODE_ENV === "testing") {
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            } else {
                //TODO: this needs to be the PROD endpoint
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            }
        }

        var options = {
            url: _endpoint+path,
            json:true,
            body:body,
            headers: {
                'Content-Type':'application/json'
            }
        };
        request.put(options, function(err, response, _body){
            if(err) {
                self.log.debug('err: ', err);
            }

            //self.log.debug('response:', response);
            try {
                _body = JSON.parse(_body);
            } catch(exception) {
                self.log.debug('Could not parse body:', exception);
            }
            self.log.debug('_body:', _body);
            var actualErrors = _body.errors;
            self.log.error(actualErrors);
            self.log.debug('<< updateCertificate');
            fn(err, _body);
        });

    },

    getCertificateValidationMethods: function(ref, account_key, secret_key, endpoint, fn){
        var self = this;
        self.log.debug('>> getCertificateValidationMethods');

        //minimal validation
        if(!ref) {
            return fn('ref must be specified');
        }
        if(!account_key) {
            return fn('account_key must be specified');
        }
        if(!secret_key) {
            return fn('secret_key must be specified');
        }
        ///certificate/{ref}/validations/methods{?account_key,secret_key}
        var path = '/certificate/' + ref + '/validations/methods?account_key=' + account_key + '&secret_key=' + encodeURIComponent(secret_key);
        var _endpoint = endpoint;
        if(!_endpoint) {
            //figure out endpoint
            if (process.env.NODE_ENV === "testing") {
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            } else {
                //TODO: this needs to be the PROD endpoint
                _endpoint = sslDotComConfig.SSLDOTCOM_TEST_ENDPOINT;
            }
        }

        var options = {
            url: _endpoint+path,
            json:true,
            headers: {
                'Content-Type':'application/json'
            }
        };
        request.get(options, function(err, response, _body){
            self.log.debug('err: ', err);
            //self.log.debug('response:', response);
            try {
                _body = JSON.parse(_body);
            }catch(exception) {
                self.log.warn('Error parsing body', exception);
            }
            self.log.debug('_body:', _body);
            self.log.debug('<< getCertificateValidationMethods');
            fn(err, _body);
        });

    }

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSLDotComDao = dao;

module.exports = dao;