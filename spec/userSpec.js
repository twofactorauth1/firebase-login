var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

describe('User API', function () {
    it('Without authentication', function (done) {
        driver.get('http://localhost:1337/user/');
        driver.getTitle().then(function (title) {
            expect(title).toBe('Sails');
            done();
            driver.close();
        });
    }, 10000);
});
