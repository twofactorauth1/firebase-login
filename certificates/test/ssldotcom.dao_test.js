/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var app = require('../../app');
var async = require('async');
var dao = require('../dao/ssldotcom.dao');
var log = global.getLogger('ssldotcom_test');
var config = require('../../configs/ssldotcom.config');
var global_CSR = '-----BEGIN CERTIFICATE REQUEST-----nMIICvTCCAaUCAQAweDELMAkGA1UEBhMCdXMxDjAMBgNVBAgTBVRleGFzMRAwDgYDnVQQHEwdIb3VzdG9uMRUwEwYDVQQKEwxZb3VyIENvbXBhbnkxFTATBgNVBAsTDFlvndXIgSVQgRGVwdDEZMBcGA1UEAxMQd3d3LnlvdXJzaXRlLmNvbTCCASIwDQYJKoZInhvcNAQEBBQADggEPADCCAQoCggEBAKWnrKf35qmU/tBnieUcQmf0xhntGO2YDgAOnW9J44IAhC1IB715312J28WvoLSSZDuBxqMaLgBbcNyrRFkwbZ+sRbLsjJ24v21DtnLE2gMSbr9YSuH0McOBh9sf23tHd2n5rteJn5fVuxc6ak3t9mag2jjD43Blyh3ih7nADPj0XAk0Gfn+obfmKPMpZwYEhXnJNtWKHzflzAjUjaxbMwMIrvgZcvk/BZZ184znYquasNmvJotvptP0RF3J0GhuiYg75BgimMq3YFxFjAnYjRRZ7p8z/DEfTkdZOPHGnypaz4ny+l8lggyvMOgZD7yanGuVxzlBhpB90INXVDX9+yQ23XHECAwEAAaAAMA0GnCSqGSIb3DQEBBQUAA4IBAQAwbFXORWmD9ovp4qsxozzUZAKxUTluiTIsO+bK2pXVnHAhxVkzcVi8nFqzkeAuKRTQ9UZPMjnnjHWOKIghIpiAabSiC0E/0SPR9s3QzJWhVnOfOpoKYoRnDUh+/SH/Otg4Wid7yKOfdPFK4J8GtnPB2i5Eih0ZOYTTIU2xSmkZ9Tn+LoB7PxOVii8Dq5Nrbbzq8x/WpJfKTackp6nWl2ILcfXM3iGBmLqXPRn5/Uvj767nrq5mHXD2IakxBAeTci16WqQEVcow3qn1JwLyGOzXuuW/UA2/HJUE4zG+8CQIb3OLn0Yq26QKt/i5CJv//uZcRZY8VRkPaH090QOr85UfP7Y3Dn-----END CERTIFICATE REQUEST-----';

module.exports.group = {

    setUp: function (cb) {
        cb();
    },

    tearDown: function (cb) {
        cb();
    },


    testCreateCert: function (test) {
        var self = this;

        var account_key = '4980a361';
        var secret_key = 'csr/ceZvPQ==';
        var product = 100;
        var period = 365;
        var csr = null;
        var server_software =39;
        var domains = '*.indigenous.io';
        var organization = 'Indigenous LLC';
        var organization_unit = 'Domain Control Validated';
        var post_office_box = null;
        var street_address_1 = 'Y';
        var street_address_2 = '';
        var street_address_3 = '';
        var locality = 'San Diego';
        var state_or_province = 'CA';
        var postal_code = '98101';
        var country = 'US';
        var duns_number = '';
        var company_number = '';
        var joi = '';
        var ca_certificate_id = null;
        var external_order_number = null;
        var hide_certificate_reference = null;
        var contacts = {};
        var app_rep = null;
        var payment_method =null;
        var endpoint = config.SSLDOTCOM_MOCK_ENDPOINT;

        /*
         domains: {"domains" : {"www.mysite.com" : {"dcv" : "admin@mysite.com"}}, "mail.domain.io" : {"dcv : "HTTP_CSR_HASH"}}}
         */

        dao.createCertificate(account_key, secret_key, product, period, csr, server_software, domains, organization,
            organization_unit, post_office_box, street_address_1, street_address_2, street_address_3, locality, state_or_province,
            postal_code, country, duns_number, company_number, joi, ca_certificate_id, external_order_number, hide_certificate_reference,
            contacts, app_rep, payment_method, endpoint,
            function(err, value){
                log.debug('err:', err);
                log.debug('value:', value);
                dao.getCertificate(value.ref, account_key, secret_key, null, null, null, endpoint, function(err, _value){
                    domains = {
                        'www.test.com': {'dcv':'HTTPS_CSR_HASH'},
                        'main.test.com' : {'dcv':'HTTP_CSR_HASH'}
                    };
                    contacts = {
                        "all" : {
                            "first_name" : 'Joe',
                            "last_name" : 'Bob',
                            "email" : 'jbob@domain.com',
                            "phone" : '+15555555555',
                            "country" : 'US'
                        }
                    };
                    dao.updateCertificate(value.ref, account_key, secret_key, global_CSR, server_software, domains, organization, organization_unit,
                    post_office_box, street_address_1, street_address_2, street_address_3, locality, state_or_province,
                    postal_code, country, duns_number, company_number, joi, ca_certificate_id, external_order_number, hide_certificate_reference,
                    contacts, app_rep, endpoint, function(err, updatedCert){
                            if(err) {
                                log.error(err);
                            }
                        test.done();
                    });

                });

            }
        );

    }
};