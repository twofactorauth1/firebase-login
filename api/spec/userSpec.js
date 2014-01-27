var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

describe('User API', function () {
    it('authenticate admin user', function () {
        driver.get('http://localhost:1337/auth/login/');
        driver.findElement(webdriver.By.name('username')).sendKeys('admin');
        driver.findElement(webdriver.By.name('password')).sendKeys('admin');
        driver.findElement(webdriver.By.xpath('//input[@type="submit"]')).click();
    }, 20000);
    
    it('GET request without parameters', function () {
        driver.get('http://localhost:1337/user');
        console.log(webdriver.By.tagName('body').text);
        driver.quit();
    }, 20000);
    
});
