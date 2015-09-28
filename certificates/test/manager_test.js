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
var manager = require('../certificate_manager');

module.exports.group = {

    setUp: function (cb) {
        cb();
    },

    tearDown: function (cb) {
        cb();
    },

    testAddDomain: function(test) {
        var self = this;
        self.log = log;

        var domain = 'enduragive.org';
        var certRef = 'co-e81b0b5cu';


        manager.addDomainToCert(domain, certRef, function(err, value){
            self.log.debug('err:', err);
            self.log.debug('value:', value);
            test.ok(value);
            test.done();
        });
    }
};