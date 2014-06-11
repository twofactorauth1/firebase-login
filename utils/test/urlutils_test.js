process.env.NODE_ENV = "testing";
var app = require('../../app');

var urlutils = require('../urlutils.js');

exports.urlutils_test = {
    setUp: function(cb) {
        var self = this;
        self.testUrls = [];
        self.testUrls[0] = {
            host:'app.indigenous.io:3000/',
            isMainApp: true,
            subDomain:'app'
        };
        self.testUrls[1] = {
            host: 'www.indigenous.io:3000/',
            isMainApp: false,
            subDomain: 'main'
        };
        self.testUrls[2] = {
            host: 'yogaone.indigenous.io',
            isMainApp: false,
            subDomain: 'yogaone'
        };
        self.testUrls[3] = {
            host: 'indigenous.io',
            isMainApp: false,
            subDomain: 'main'
        };
        cb();
    },

    tearDown: function(cb) {
        var self = null;
        cb();
    },

    testGetSubdomainFromHost : function(test) {
        var self = this;

        for(var i=0; i<self.testUrls.length; i++) {
            var testObj = self.testUrls[i];
            var result = urlutils.getSubdomainFromHost(testObj.host);
            test.equals(testObj.isMainApp, result.isMainApp, "Host [" + testObj.host + "] is not properly identified as a mainapp.");
            test.strictEqual(result.subdomain, testObj.subDomain, "Host [" + testObj.host + "] does not have a properly identified subdomain.")
        }

        test.done();
    }




};
