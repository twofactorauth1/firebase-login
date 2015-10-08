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
//var global_CSR = '-----BEGIN CERTIFICATE REQUEST-----nMIICvTCCAaUCAQAweDELMAkGA1UEBhMCdXMxDjAMBgNVBAgTBVRleGFzMRAwDgYDnVQQHEwdIb3VzdG9uMRUwEwYDVQQKEwxZb3VyIENvbXBhbnkxFTATBgNVBAsTDFlvndXIgSVQgRGVwdDEZMBcGA1UEAxMQd3d3LnlvdXJzaXRlLmNvbTCCASIwDQYJKoZInhvcNAQEBBQADggEPADCCAQoCggEBAKWnrKf35qmU/tBnieUcQmf0xhntGO2YDgAOnW9J44IAhC1IB715312J28WvoLSSZDuBxqMaLgBbcNyrRFkwbZ+sRbLsjJ24v21DtnLE2gMSbr9YSuH0McOBh9sf23tHd2n5rteJn5fVuxc6ak3t9mag2jjD43Blyh3ih7nADPj0XAk0Gfn+obfmKPMpZwYEhXnJNtWKHzflzAjUjaxbMwMIrvgZcvk/BZZ184znYquasNmvJotvptP0RF3J0GhuiYg75BgimMq3YFxFjAnYjRRZ7p8z/DEfTkdZOPHGnypaz4ny+l8lggyvMOgZD7yanGuVxzlBhpB90INXVDX9+yQ23XHECAwEAAaAAMA0GnCSqGSIb3DQEBBQUAA4IBAQAwbFXORWmD9ovp4qsxozzUZAKxUTluiTIsO+bK2pXVnHAhxVkzcVi8nFqzkeAuKRTQ9UZPMjnnjHWOKIghIpiAabSiC0E/0SPR9s3QzJWhVnOfOpoKYoRnDUh+/SH/Otg4Wid7yKOfdPFK4J8GtnPB2i5Eih0ZOYTTIU2xSmkZ9Tn+LoB7PxOVii8Dq5Nrbbzq8x/WpJfKTackp6nWl2ILcfXM3iGBmLqXPRn5/Uvj767nrq5mHXD2IakxBAeTci16WqQEVcow3qn1JwLyGOzXuuW/UA2/HJUE4zG+8CQIb3OLn0Yq26QKt/i5CJv//uZcRZY8VRkPaH090QOr85UfP7Y3Dn-----END CERTIFICATE REQUEST-----';
var global_CSR = '-----BEGIN CERTIFICATE REQUEST-----\nMIIDRTCCAi0CAQAwgZYxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlh\nMREwDwYDVQQHDAhMYSBKb2xsYTEhMB8GA1UECgwYSW5kaWdlbm91cyBTb2Z0d2Fy\nZSwgSU5DMRgwFgYDVQQDDA8qLmluZGlnZW5vdXMuaW8xIjAgBgkqhkiG9w0BCQEW\nE2FkbWluQGluZGlnZW5vdXMuaW8wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\nAoIBAQDImE71RtyXu5OJ2OSGL8L9BbrJaxHAEXJEokxmfb3XWKMee6YEAeXpnHca\nqZO96YXwdfoFDPYytrgGc24C4VQ0UfE0mIKrRTtaR8nBM388vHk7UyY2NGq2dZ2c\nvxTQ55WgBc5H3sdJ8T9vLEF3mYaVUKqhijs608ZLK2IzLA30qBGnvQJuuY21fsY3\nKLUZgcp5n27d35PvJ+OdvGWwpwCtZFP5IHqlt+I2NXN0LZXf0OwF/9SndAud0EZZ\nCzRT87YV1Qz5HJKOePqzoyAON9PrC5g2CJtOgjQo1RJwMkWE0xabK6j7Fvj630rH\nDu6KRsR6qrakXHFLBRztmapzpskNAgMBAAGgaTBnBgkqhkiG9w0BCQ4xWjBYMAkG\nA1UdEwQCMAAwCwYDVR0PBAQDAgXgMD4GA1UdEQQ3MDWCDyouaW5kaWduZW91cy5p\nb4ISd3d3LmVuZHVyYWdpdmUub3Jngg5lbmR1cmFnaXZlLm9yZzANBgkqhkiG9w0B\nAQsFAAOCAQEAQZdI5YKb0GGMngJr3eWQow+ZZBEeRuNjgcbMR2e01HDMG23nqsPD\nrjjF58XdFZhNHk2ruDehHM9O20i91Y89pnFEzngCoY1I2grKRSoqdXaRP4WlYsEK\nKqzOCV2/gol6KIuVOJXFJ39GfWx15wXOeHPE8jF5tPvFt1jKmuoFFC0NyT9Jzrt6\nqhk+ZMiZ5x9RAMU5JCFYbnKTkGqDM0PjGzA3iNXrt+8uou2kvMgs9i5j0YkHUtz3\nLXPZm8+g+Ilb3HYR2nQglvEFknHEgEwQ9JREfctiTFqsfdU0TGw1S4u33coMw/kR\nBpOZ6wPMPfC/pryrN1P/IyyxNFk0BL4g/g==\n-----END CERTIFICATE REQUEST-----';
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

        var domain = 'kyletesting.test.indigenous.io';
        var certRef = 'co-191b0lj3d';

        //TODO: this is the *test* private key.  Do not check in the prod key.
        var key = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDImE71RtyXu5OJ\n2OSGL8L9BbrJaxHAEXJEokxmfb3XWKMee6YEAeXpnHcaqZO96YXwdfoFDPYytrgG\nc24C4VQ0UfE0mIKrRTtaR8nBM388vHk7UyY2NGq2dZ2cvxTQ55WgBc5H3sdJ8T9v\nLEF3mYaVUKqhijs608ZLK2IzLA30qBGnvQJuuY21fsY3KLUZgcp5n27d35PvJ+Od\nvGWwpwCtZFP5IHqlt+I2NXN0LZXf0OwF/9SndAud0EZZCzRT87YV1Qz5HJKOePqz\noyAON9PrC5g2CJtOgjQo1RJwMkWE0xabK6j7Fvj630rHDu6KRsR6qrakXHFLBRzt\nmapzpskNAgMBAAECggEAf1dRKJwnhZtqeePajuTbH8z3Ws5BonBw3ek6HwZL8d0v\nEDbmmTyrO7Y8Vgy44aLRiGkcowAret5LzKySdfmdfulV+lGnAhsdJp7UEXYjm+b5\n/xM1+ssjw1i/Cbaz/DpH3iJRZYajdOlVn7m0hbxMl5Vx/MLH/vxZsXaFDH83DMxU\nFZfboxcTH7CQ7ucewrCKNCE7CeqXn7Vzu25tW5z5WAelBqMQAbjJ+eURY+W+qBjp\nNhKNa6I8Gsu17MqCKkrCflhe/lbg5SaTOnQpF2jBv8r5sjzIEUXC1a0Fk76NgijK\nMt8ivkIJRkgEHZPUaliawTJTJMRPNnDf1DB3i43CAQKBgQD4lzBM07a21gPoPWEV\nqO1qYD2V8rBr5OiKn8nC/pB4v62WrwcxSO6j5Jzdm2gZ6Vv/YlTn4KJCnteZWzvG\n5gSR/G0yQsJXrmFI2pGOuzGqhzhBN6edwF/0qvdTy8yUtShvEqCXZ0pQjDUj0mIt\n2DRabFsEr635BoPBFM/0eJ3MLQKBgQDOkuaKElF9KobmJoaiW4ouGyIa0B/cvBHk\nDNNMXYDacyjWv/hQP8/K17GSa2vNpFmxvyMjVIsZIS9DUx3G8SpBs6/jbun5hxIO\nVlpG/uKpntGIrg0k8rD6blYVFBDRON+FX2HOq6tVtLrf0Hgqw6n5dwIpe3Dv9+i4\nMDYoTtWcYQKBgQDJ5qGIBHvly7SorxFm8ijBuSDL5Kx9NRHZZSYNhYv5RlTKiaWh\n1cZcvpTZOBs40Fuz9D1ZhwzCZxhcqcjHJpKXrxlRNP97D1pcPYjzD/6qreB2t6kf\natuEcEcoe+HQ9cG9VLexwGaPPRD74ydybKM4vcC+8aCvHSdtbmXn/P7MkQKBgDaw\nAURwUQ534bqwXFhDL7PBDyhWDPlc+MeM9atz3Zb3gcpIjC6Cljo3HBWNRr7sUaqS\n1XSW/zQp6t9B89IlKnC2Z0wootyie488IS5GcC9DkmlC2sv7TAsghr2R0FnzWolu\nlPAn1nYcIJT8FbQMlMUsUnA089MzqHKKoOvO4xJBAoGAAhLaZS6qipXnJXOQB12r\nXUr7uKN9JmtrfckJh5yiDNkWe5g32Qk+j2rE6lQzoJKzxKXiiZmhpgZJxXlavwo7\nhnEotapyL+TlBAUPGg+tneZui3Nn9UP9dlEwRwlDQf6h09LyEKJzk2oL3A0sSqJb\nu8HnDlHV3g2zsH2ixITUJKE=\n-----END PRIVATE KEY-----';

        manager.addDomainToCert(domain, certRef,key, function(err, value){

            self.log.debug('err:', err);
            self.log.debug('value:', value);
            test.ok(value);
            test.done();
        });
    }
};