/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var chromeDriver = require('selenium-webdriver/chrome');

var driver = null;

module.exports = {
    setUp: function(cb) {
        cb();
    },

    tearDown: function(cb) {
        cb();
    },

    preGroup: function(test) {
        console.log('initializing');
        driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();
        test.done();
    },

    group: {

        testLinks: function(test) {
            console.log('testing /index');

            driver.get('https://www.indigenous.io');
            driver.wait(until.elementLocated(By.linkText('Get Started')), 20000);
            var signupLink = driver.isElementPresent(By.linkText('Get Started'));
            signupLink.then(function(x){test.ok(x, 'Signup Link not present');});
            signupLink.finally(function(){
                test.ok(true);
                test.done();
            });
            //var startTrialLink = driver.isElementPresent(By.linkText('START YOUR FREE TRIAL'));
            //startTrialLink.then(function(x){test.ok(x, 'Start trial link not present');});

            //driver.findElement(By.linkText('BLOG')).click();
            //var lastPromise = driver.wait(until.titleIs('Blog'), 5000);

            //lastPromise.thenFinally(function(){
            //    test.ok(true);
            //    test.done();
            //});
        },
        /*
        testBlog: function(test) {
            console.log('testing /blog');
            driver.wait(until.elementLocated(By.xpath('//*[@id="blog-sidebar"]/div[3]/div/span')), 20000);
            var currentUrl = driver.getCurrentUrl();
            currentUrl.then(function(x){test.equals(x, 'https://indigenous.io/blog')});
            driver.wait(until.elementLocated(By.linkText('READ MORE')));
            var readMoreLink = driver.isElementPresent(By.linkText('READ MORE'));
            readMoreLink.then(function(x){
                test.ok(x, 'Read more link not present');
            });

            var firstArticle = driver.findElement(By.xpath('//*[@id="main-area"]/article/div[1]/div/h2/a/div'));
            var articleTitle = null;
            firstArticle.then(function(webElement){webElement.getText().then(function(txt){articleTitle = txt;})});
            firstArticle.click();

            //this xpath waits for the publish date to have more than 2 characters in it.
            //hopefully this means that angular is done loading
            driver.wait(until.elementLocated(By.xpath('//*[@id="et_pt_blog"]/div[1]/div[1]/span[string-length(text()) > 2]')), 25000);

            var blogTitle = driver.findElement(By.xpath('//*[@id="et_pt_blog"]/div[1]/h1'));
            blogTitle.then(function(webElement){
                webElement.getText().then(function(txt){
                    test.equals(txt, articleTitle);
                    test.done();
                });
            });
        },
        */
        testSignup: function(test) {
            console.log('testing /signup');
            driver.get('https://indigenous.io/signup');
            driver.wait(until.elementLocated(By.id('email')), 20000);
            driver.wait(until.elementLocated(By.className('signup-btn-v2')), 20000);

            driver.isElementPresent(By.id('email')).then(function(el){test.ok(el, 'Email signup field missing.');});

            driver.isElementPresent(By.id('password')).then(function(el){test.ok(el, 'Password signup field missing.');});

            driver.isElementPresent(By.id('fullName')).then(function(el){test.ok(el, 'Name signup field missing.');});

            driver.isElementPresent(By.id('business-name')).then(function(el){test.ok(el, 'Business signup field missing.');});

            driver.isElementPresent(By.className('signup-btn-v2')).then(
                function(el){
                    test.ok(el, 'Signup Button missing.');
                    test.done();
                }
            );
        }
    },

    postGroup: function(test) {
        console.log('tearing down');
        //shut down the driver
        var lastPromise = driver.quit();
        lastPromise.thenFinally(function() {
            test.ok(true);
            test.done();
        });

    }



};