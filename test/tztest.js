/*
 var now = new Date();
 now.setHours(hoursValue);
 now.setMinutes(minutesValue);
 now.setSeconds(0);
 var offsetToUse = timezoneOffset - now.getTimezoneOffset();
 console.log('Pieces: ' + now.getHours() + ", " + now.getMinutes() + "," + timezoneOffset + "," + offsetToUse);
 var shiftedUtcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysShift,
 now.getUTCHours(), now.getUTCMinutes() - offsetToUse, now.getUTCSeconds());
 console.log('shiftedUTCDate: ' + shiftedUtcDate);
 return shiftedUtcDate.toISOString();
 */

process.env.NODE_ENV = "testing";
require('moment');
require('moment-timezone');

var blogPostDao = require('../cms/dao/blogpost.dao');

exports.campaign_manager_test = {

    testTimezoneConverter: function (test) {
        var self = this;

        var hoursValue = 21
        var minutesValue = 35;
        var timezoneOffset = 480;
        var now = new Date();
        now.setHours(hoursValue);
        now.setMinutes(minutesValue);
        now.setSeconds(0);
        var offsetToUse = timezoneOffset - now.getTimezoneOffset();
        console.log('Pieces: ' + now.getHours() + ", " + now.getMinutes() + "," + timezoneOffset + "," + offsetToUse);
        var shiftedUtcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 0,
            now.getUTCHours(), now.getUTCMinutes() - offsetToUse, now.getUTCSeconds());
        console.log('shiftedUTCDate: ' + shiftedUtcDate);
        console.log('isoString: ' + shiftedUtcDate.toISOString());

        var targetDate = moment().utc().hours(hoursValue).minutes(minutesValue).add('minutes', timezoneOffset).add('days', 0);
        console.log(targetDate.date());
        console.log(now.getDate());
        console.log('targetDate: ' + targetDate + ' - isoString: ' + targetDate.toISOString());
        test.ok(true);
        test.done();
    },

    testDistinct: function(test) {
        console.log('starting testDistinct');
        blogPostDao.distinct('post_author', {accountId:6}, $$.m.cms.BlogPost, function(err, value){
            console.log('error: ', err);
            console.log('value: ', value);
            test.ok(true);
            test.done();
        });
    }
}