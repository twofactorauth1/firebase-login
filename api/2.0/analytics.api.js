/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var cookies = require('../../utils/cookieutil');
var analyticsDao = require('../../analytics/dao/analytics.dao.js');
var analyticsManager = require('../../analytics/analytics_manager.js');
var async = require('async');
var contactDao = require('../../dao/contact.dao');
var urlUtils = require('../../utils/urlutils');
var tldtools = require('tldtools').init();

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "analytics",

    version: "2.0",

    dao: analyticsDao,

    initialize: function () {
        //JS analytics 2.0
        app.get(this.url('collect'), this.collectAnalytics.bind(this));


    },
    collectAnalytics: function(req, resp) {
        var self = this;
        self.log.trace('>> collectAnalytics:', req.query);
        /*
         * Expected query params
         * sid - session_id
         * ev - event {s,pg,p} - expand into the future... this is just to map to our existing model
         * pt - permanent_tracker
         * uabn - user_agent.browser.name
         * uabv - user_agent.browser.version
         * uabm - user_agent.browser.major
         * uaen - user_agent.engine.name
         * uaev - user_agent.engine.version
         * uaon - user_agent.os.name
         * uaov - user_agent.os.version
         * uad - user_agent.device
         * f - fingerprint
         * t - timezone
         * nv - new_visitor
         * e - entrance (aka full entrance aka url)
         * fe - full_entrance
         * utms - utm_source -> campaign.utm_source
         * utmm - utm_medium
         * utmc - utm_campaign
         * utmt - utm_term
         * utmct - utm_content
         * r - referrer
         * st - source_type
         * en -page_event.entrance
         *
         *
         * {
         *  "session_id":"06FAC6E0-64F4-4AE2-BE33-EF90C4994365",
         *  "permanent_tracker":"FFE4A5D7-C3E6-4B68-BF3D-AC003E605865",
         *  "user_agent":{
         *      "browser":{
         *          "name":"Chrome",
         *          "version":"60.0.3112.113",
         *          "major":"60"
         *       },
         *      "engine":{
         *          "name":"WebKit",
         *          "version":"537.36"
         *      },
         *      "os":{
         *          "name":"Mac OS",
         *          "version":"10.10.5"
         *      },
         *      "device":"desktop"
         *  },
         *  "ip_address":"${keen.ip}",
         *  "fingerprint":"2205160649",
         *  "session_start":1505939487889,
         *  "session_length":0,
         *  "timezone":"America/Chicago",
         *  "new_visitor":false,
         *  "entrance":"/",
         *  "fullEntrance":"https://indigenous.io/",
         *  "referrer":{
         *      "source":"https://indigenous.io/",
         *      "protocol":"https",
         *      "domain":"indigenous.io",
         *      "port":"",
         *      "path":"/",
         *      "anchor":""
         *  },
         *  "source_type":"referral"
         * }
         *
         * page:{
         *  "url":{
         *      "source":"https://indigenous.io/",
         *      "protocol":"https",
         *      "domain":"indigenous.io",
         *      "port":"",
         *      "path":"/",
         *      "anchor":""
         *  },
         *  "pageActions":[],
         *  "start_time":1505939487920,
         *  "end_time":0,
         *  "session_id":"06FAC6E0-64F4-4AE2-BE33-EF90C4994365",
         *  "entrance":true
         * }
         *
         * ping:{"url":{"source":"https://indigenous.io/","protocol":"https","domain":"indigenous.io","port":"","path":"/","anchor":""},"pageActions":[],"start_time":1505939487920,"end_time":0,"session_id":"06FAC6E0-64F4-4AE2-BE33-EF90C4994365","entrance":true,"ping_time":1505939503277}
         */

        var expectedQuery = {
            sid:'',
            ev:'',
            pt:'',
            uabn:'',
            uabv:'',
            uabm:'',
            uaen:'',
            uaev:'',
            uaon:'',
            uaov:'',
            uad:'',
            f:'',
            t:'',
            nv:'',
            e:'',
            utms:'',
            utmm:'',
            utmc:'',
            utmt:'',
            mtmct:'',
            r:'',
            st:''
        };
        expectedQuery = _.extend(expectedQuery, req.query);


        if(expectedQuery.ev === 's') {
            self._buildSessionEvent(req, expectedQuery);
        } else if(expectedQuery.ev === 'pg') {
            self._buildPageEvent(req, expectedQuery);
        } else if(expectedQuery.ev === 'p') {
            self._buildPingEvent(req, expectedQuery);
        } else {
            self.log.warn('Unknown event [' + expectedQuery.s + ']', expectedQuery);
        }
        resp.set('Access-Control-Allow-Origin', '*');
        self.send200(resp);
        self.log.trace('<< collectAnalytics');
    },

    _buildSessionEvent: function(req, q) {
        var self = this;
        var body = {
            session_id: q.sid,
            permanent_tracker: q.pt,
            user_agent:{
                browser:{
                    name: q.uabn,
                    version: q.uabv,
                    major: q.uabm
                },
                engine:{
                    name: q.uaen,
                    version: q.uaev
                },
                os:{
                    name: q.uaon,
                    version: q.uaov
                },
                device: q.uad
            },
            fingerprint: ''+q.f,
            timezone: q.t,
            fullEntrance: q.fe,
            source_type: q.st
        };
        var sessionEvent = new $$.m.SessionEvent(body);
        var startTime = new Date().getTime();
        sessionEvent.set('server_time', startTime);
        sessionEvent.set('session_start', startTime);
        sessionEvent.set('server_time_dt', new Date());
        sessionEvent.set('ip_address', self.ip(req));
        sessionEvent.set('accountId', self.currentAccountId(req));
        if(q.siteId) {
            if(!isNaN(q.siteId)) {
                sessionEvent.set('accountId', parseInt(q.siteId));
            } else {
                sessionEvent.set('siteId', q.siteId);
            }
        }

        //parse referrer and fullEntrance
        if(q.fe) {
            var obj = tldtools.extract(q.fe);
            sessionEvent.set('entrance', obj.url_tokens.pathname);
        }
        if(q.r) {
            var referrerObj = tldtools.extract(q.r);
            var referrer = {
                source: q.r,
                protocol:'',
                domain: referrerObj.domain + '.' + referrerObj.tld,
                port: referrerObj.url_tokens.port,
                path: referrerObj.url_tokens.pathname,
                anchor:''
            };
            //protocol: referrerObj.url_tokens.protocol.replaceAll(':', ''),
            if(referrerObj && referrerObj.url_tokens && referrerObj.url_tokens.protocol && referrerObj.url_tokens.protocol.indexOf(':') >=0) {
                referrer.protocol = referrerObj.url_tokens.protocol.replace(':', '');
            }
            sessionEvent.set('referrer', referrer);
        }
        /*
         * utms - utm_source -> campaign.utm_source
         * utmm - utm_medium
         * utmc - utm_campaign
         * utmt - utm_term
         * utmct - utm_content
         */
        if(q.utms || q.utmm || q.utmc || q.utmt || q.utmct) {
            var campaign = {
                utm_source: q.utms,
                utm_medium : q.utmm,
                utm_campaign: q.utmc,
                utm_term: q.utmt,
                utm_content: q.utmct
            };
            sessionEvent.set('campaign', campaign);
        }
        analyticsManager.storeSessionEvent(sessionEvent, function(err){
            if(err) {
                self.log.error('Error saving session event: ' + err);
            }
        });

    },

    _buildPageEvent: function(req, q) {
        var self = this;
        var body = {
            session_id: q.sid,
            entrance: q.en
        };
        if(q.fe) {
            var obj = tldtools.extract(q.fe);
            var url = {
                source: q.fe,
                protocol: obj.url_tokens.protocol.replace(':', ''),
                domain: obj.domain + '.' + obj.tld,
                port: obj.url_tokens.port,
                path: obj.url_tokens.pathname,
                anchor:''
            };
        }
        body.url = url;
        var pageEvent = new $$.m.PageEvent(body);
        var dateTime = new Date().getTime();
        pageEvent.set('server_time', dateTime);
        pageEvent.set('server_time_dt', new Date());
        pageEvent.set('start_time', dateTime);
        pageEvent.set('ip_address', self.ip(req));
        pageEvent.set('accountId', self.currentAccountId(req));
        if(q.siteId) {
            if(!isNaN(q.siteId)) {
                pageEvent.set('accountId', parseInt(q.siteId));
            } else {
                pageEvent.set('siteId', q.siteId);
            }
        }
        if(q.name){
            pageEvent.set('name', q.name);
        }


        analyticsManager.storePageEvent(pageEvent, function(err){
            if(err) {
                self.log.error('Error saving page event: ' + err);
            }
            self._buildPingEvent(req, q);
        });
    },

    _buildPingEvent: function(req, q) {
        var self = this;
        var body = {
            session_id: q.sid,
            entrance: q.en
        };
        var url = {};
        if(q.fe) {
            var obj = tldtools.extract(q.fe);
            url = {
                source: q.fe,
                protocol: obj.url_tokens.protocol.replace(':', ''),
                domain: obj.domain + '.' + obj.tld,
                port: obj.url_tokens.port,
                path: obj.url_tokens.pathname,
                anchor:''
            };
        }
        body.url = url;
        var pingEvent = new $$.m.PingEvent(req.body);
        pingEvent.set('session_id', q.sid);
        pingEvent.set('entrance', q.en);
        pingEvent.set('url', url);
        var dateTime = new Date().getTime();
        pingEvent.set('server_time', dateTime);
        pingEvent.set('ping_time', dateTime);
        pingEvent.set('server_time_dt', new Date());
        pingEvent.set('ip_address', self.ip(req));
        pingEvent.set('accountId', self.currentAccountId(req));
        if(q.siteId) {
            if(!isNaN(q.siteId)) {
                pingEvent.set('accountId', parseInt(q.siteId));
            } else {
                pingEvent.set('siteId', q.siteId);
            }
        }
        analyticsManager.storePingEvent(pingEvent, function(err){
            if(err) {
                self.log.error('Error saving ping event: ' + err);
            }
        });
    },


    noop: function(req, resp) {
        var self = this;
        self.log.debug('>> noop');
        var accountId = parseInt(self.accountId(req));
        self.log.debug('<< noop');
        self.sendResult(resp, {msg:'method not implemented'});
    }



});

module.exports = new api({version:'2.0'});

