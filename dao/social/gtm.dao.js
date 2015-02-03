/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var userDao = require('../user.dao');
var async = require('async');
var querystring = require('querystring');

var moment   = require('moment');

var dao = {

    options: {
        name: "social.gtm.dao",
        defaultModel: null
    },


    GOTO_WEBINAR_URL: "https://api.citrixonline.com/G2W/rest/",

    addRegistrant: function(organizerId, webinarId, resendConfirmation, accessToken, registrantInfo, fn) {
        /*
         * POST: https://api.citrixonline.com/G2W/rest/organizers/3769601213311530245/webinars/64208544799841548/registrants?resendConfirmation=true
         * with header: Authorization OAuth oauth_token=rGbgknavGoHhvFt6rU9KseXQTXK8
         * and body: {
         "firstName": "Kyle",
         "lastName": "Miller",
         "email": "millkyl@gmail.com"
         }
         *
         */
        var self = this;
        self.log.debug('>> addRegistrant');

        var url = self.GOTO_WEBINAR_URL + 'organizers/' + organizerId + '/webinars/' + webinarId + '/registrants?resendConfirmation=' + resendConfirmation;
        var options = {
            headers: {Authorization: 'OAuth oauth_token=' + accessToken},
            json: true,
            body: registrantInfo
        };
        request.post(url, options, function(err, resp, body){
            if(err) {
                self.log.error('Error sending request to GTM: ', err);
                return fn(err, null);
            } else {
                self.log.debug('<< addRegistrant', body);
                return fn(null, body);
            }
        });

    }

    //endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.GTMDao = dao;

module.exports = dao;

