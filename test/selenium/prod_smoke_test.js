/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = null;

module.exports = {
    setUp: function(cb) {
        cb();
    },

    tearDown: function(cb) {
        cb();
    },

    preGroup: function(test) {
        console.log('preGroup');
        driver = new webdriver.Builder()
            .forBrowser('firefox')
            .build();
        test.done();
    },

    group: {

        testLinks: function(test) {
            console.log('testProd');

            driver.get('http://www.test.indigenous.io');
            driver.wait(until.elementLocated(By.linkText('BLOG')), 20000);
            var signupLink = driver.isElementPresent(By.linkText('SIGN UP'));
            signupLink.then(function(x){test.ok(x, 'Signup Link not present');});

            var startTrialLink = driver.isElementPresent(By.linkText('START YOUR FREE TRIAL'));
            startTrialLink.then(function(x){test.ok(x, 'Start trial link not present');});

            driver.findElement(By.linkText('BLOG')).click();
            driver.wait(until.titleIs('Blog'), 5000);
            var lastPromise = driver.quit();
            lastPromise.thenFinally(function(){
                test.ok(true);
                test.done();
            });
        }
    },

    postGroup: function(test) {
        console.log('postGroup');
        test.done();
    }



};