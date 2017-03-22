/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var zedEndpoint = process.env.ZED_ENDPOINT || 'ec2.securematics.com:4036/';
var zedProtocol = process.env.ZED_PROTOCOL || 'http://';
var zedUsername = process.env.ZED_USERNAME || 'inter@securematics.com';
var zedPassword = process.env.ZED_PASSWORD || '5674Gfds';

/*
 * TESTING
 */
zedEndpoint = 'ec2.securematics.com:4033/';
zedUsername = 'test';
zedPassword = 'test';


module.exports = {
    ZED_PROTOCOL: zedProtocol,
    ZED_ENDPOINT: zedEndpoint,
    ZED_USERNAME: zedUsername,
    ZED_PASSWORD: zedPassword
};
