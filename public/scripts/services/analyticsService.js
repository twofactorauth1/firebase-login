/*
 *
 *
 * */

/*global mainApp ,window ,$ ,UAParser ,navigator ,Fingerprint,console,document,jstz*/
/* eslint-disable no-console */
mainApp.service('analyticsService', ['$http', '$location', 'ipCookie', function ($http, $location, ipCookie) {

	'use strict';
	var baseUrl = '/api/1.0/',
		sessionProperties,
		pageProperties,
		fullUrl = window.location.href,
		parsedEntranceUrl = $.url(fullUrl),
		parser = new UAParser(),
		entrance = false,
        baseUrl2 = '/api/2.0/analytics/';

	//api/1.0/analytics/session/{sessionId}/sessionStart
	this.sessionStart = function (fn) {
        var self = this;
		var start = new Date().getTime(),
			//Set the amount of time a session should last.
			sessionExpireTime = new Date(),
			session_cookie = ipCookie("session_cookie"), //Check if we have a session cookie:
			device,
			isMobile,
			permanent_cookie = ipCookie("permanent_cookie"),
			new_visitor = true,
			fingerprint,
			timezone,
			campaign = {},
			hasUtm = false,
			referrer = document.referrer, //Add information about the referrer of the same format as the current page
			parsedReferrer,
			referrerObject = null,
			apiUrl;

		sessionExpireTime.setMinutes(sessionExpireTime.getMinutes() + 30);

		//If it is undefined, set a new one.
		if (!session_cookie || !session_cookie.id) {
			entrance = true;
			ipCookie("session_cookie", {
				id: Math.uuid()
			}, {
				expires: sessionExpireTime,
				path: "/" //Makes this cookie readable from all pages
			});
		} else {
			//If it does exist, delete it and set a new one with new expiration time
			ipCookie.remove("session_cookie", {
				path: "/"
			});
			ipCookie("session_cookie", session_cookie, {
				expires: sessionExpireTime,
				path: "/"
			});
		}
		//If it is undefined, set a new one.
		if (permanent_cookie === undefined) {
			ipCookie("permanent_cookie", {
				id: Math.uuid()
			}, {
				expires: 3650, //10 year expiration date
				path: "/" //Makes this cookie readable from all pages
			});
		} else {
			new_visitor = false;
		}

		//determine if the device is mobile or not
		isMobile = {
			Android: function () {
				return navigator.userAgent.match(/Android/i);
			},
			BlackBerry: function () {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			iOS: function () {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			Opera: function () {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: function () {
				return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
			},
			any: function () {
				return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
			}
		};

		if (isMobile.any()) {
			device = 'mobile';
		} else {
			device = 'desktop';
		}

		//get browser fingerprint
        fingerprint = new Fingerprint2();
		var self = this;
        fingerprint.get(function(result, components) {
            timezone = jstz.determine();

            //all the properties of the session
            sessionProperties = {
                session_id: ipCookie("session_cookie").id,
                permanent_tracker: ipCookie("permanent_cookie").id,
                user_agent: {
                    browser: parser.getBrowser(),
                    engine: parser.getEngine(),
                    os: parser.getOS(),
                    device: device
                },
                ip_address: "${keen.ip}",
                fingerprint: result,
                session_start: start,
                session_length: 0,
                timezone: timezone.name(),
                new_visitor: new_visitor,
                entrance: parsedEntranceUrl.attr("path"),
                fullEntrance: $location.absUrl()
            };

            console.log('sessionProperties ', sessionProperties);

            if ($location.search().utm_source) {
                hasUtm = true;
                campaign.utm_source = $location.search().utm_source;
            }

            if ($location.search().utm_medium) {
                hasUtm = true;
                campaign.utm_medium = $location.search().utm_medium;
            }

            if ($location.search().utm_campaign) {
                hasUtm = true;
                campaign.utm_campaign = $location.search().utm_campaign;
            }

            if ($location.search().utm_term) {
                hasUtm = true;
                campaign.utm_term = $location.search().utm_term;
            }

            if ($location.search().utm_content) {
                hasUtm = true;
                campaign.utm_content = $location.search().utm_content;
            }

            if (hasUtm) {
                sessionProperties.campaign = campaign;
            }

            /*
            //If you know that the user is currently logged in, add information about the user.
            sessionProperties["user"] = {
                id: "",
                signupDate: ""
                etc: ".."
            };
            */

            //TODO: determine if the user is logged into any social sites


            if (referrer !== undefined) {
                parsedReferrer = $.url(referrer);

                referrerObject = {
                    source: parsedReferrer.attr("source"),
                    protocol: parsedReferrer.attr("protocol"),
                    domain: parsedReferrer.attr("host"),
                    port: parsedReferrer.attr("port"),
                    path: parsedReferrer.attr("path"),
                    anchor: parsedReferrer.attr("anchor")
                };
            }

            sessionProperties.referrer = referrerObject;
            sessionProperties.source_type = self.getSourceType(parsedReferrer.attr("host"));

            //api/1.0/analytics/session/{sessionId}/sessionStart
            apiUrl = baseUrl + ['analytics', 'session', ipCookie("session_cookie").id, 'sessionStart'].join('/');
            console.log('session start campaign >>> ', sessionProperties.campaign);
            console.log('session start fullEntrance >>> ', sessionProperties.fullEntrance);
            $http.post(apiUrl, sessionProperties)
                .success(function (data) {
                    fn(data);
                });
        });

	};

    this.getAccountData = function(fn){
            $http.get(baseUrl+'account/')
            .success(function (data) {
              fn(null,data);
            })
            .error(function (err) {
              console.warn('END:Account Service with ERROR');
              fn(err, null);
            });

    };
	this.getSourceType = function (host) {
		var type = 'direct',
			organicSources = ['google.com', 'daum.net', 'eniro.se', 'naver.com', 'yahoo.com', 'msn.com', 'bing.com', 'aol.com', 'lycos.com', 'ask.com', 'altavista.com', 'search.netscape.com', 'cnn.com/SEARCH', 'about.com', 'mamma.com', 'alltheweb.com', 'voila.fr', 'search.virgilio.it', 'baidu.com', 'alice.com', 'yandex.com', 'najdi.org.mk', 'aol.com', 'mamma.com', 'seznam.cz', 'search.com', 'wp.pl', 'online.onetcenter.org', 'szukacz.pl', 'yam.com', 'pchome.com', 'kvasir.no', 'sesam.no', 'ozu.es', 'terra.com', 'mynet.com', 'ekolay.net', 'rambler.ru'];
		//TODO: Add Email
		if (host) {
			type = 'referral';
		}
		if (organicSources.indexOf(host) !== -1) {
			type = 'organic';
		}
		return type;
	};

	///api/1.0/analytics/session/{sessionId}/pageStart
	this.pageStart = function (fn) {
        var self = this;
		var startPageTimer = new Date().getTime(),
			parsedUrl,
			sessionId,
			apiUrl,
			session_cookie = ipCookie("session_cookie"); //Check if we have a session cookie: ;
		parsedEntranceUrl = $.url(window.location.href);
		parsedUrl = parsedEntranceUrl;


		//If it is undefined, set a new one.
		if (!session_cookie || !session_cookie.id) {
			console.log('restarting session');
			this.sessionStart(undefined);
		} else {
            sessionId = ipCookie("session_cookie").id || Math.uuid();

            pageProperties = {
                url: {
                    source: parsedUrl.attr("source"),
                    protocol: parsedUrl.attr("protocol"),
                    domain: parsedUrl.attr("host"),
                    port: parsedUrl.attr("port"),
                    path: parsedUrl.attr("path"),
                    anchor: parsedUrl.attr("anchor")
                },
                pageActions: [],
                start_time: startPageTimer,
                end_time: 0,
                session_id: sessionId,
                entrance: entrance
            };

            entrance = false;
            var queryParams = {ev:'pg', fe:parsedUrl.attr('source'), sid:sessionId +'-collect'};
            apiUrl = baseUrl + ['analytics', 'session', sessionId, 'pageStart'].join('/');
            $http.post(apiUrl, pageProperties)
                .success(function (data) {
                    //self.collect(queryParams, fn);
                    fn(data);
                });
        }

	};

	///api/1.0/analytics/session/{sessionId}/ping
	this.pagePing = function () {
		var thisPageProperties = pageProperties,
			apiUrl;
		thisPageProperties.ping_time = new Date().getTime();
		if (ipCookie("session_cookie")) {
			apiUrl = baseUrl + ['analytics', 'session', ipCookie("session_cookie").id, 'ping'].join('/');
			$http.post(apiUrl, thisPageProperties);
		}
	};

	this.getGeoSearchAddress = function (addressStr, fn) {
		var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};

    this.collectPage = function(firstTime, fn) {
        var self = this;
        var session_cookie = ipCookie("session_cookie"); //Check if we have a session cookie: ;
        var parsedUrl = $.url(window.location.href);
        if (!session_cookie || !session_cookie.id) {
            console.log('restarting session');
            self.collect(null, function(){
                var sessionId = ipCookie("session_cookie").id || Math.uuid();
                var queryParams = {ev:'pg', fe:parsedUrl.attr('source'), sid:sessionId};
                if(!firstTime) {
                    queryParams.ev = 'p';
                }
                self.collect(queryParams, fn);
            });
        } else {
            var sessionId = ipCookie("session_cookie").id || Math.uuid();
            var queryParams = {ev:'pg', fe:parsedUrl.attr('source'), sid:sessionId};
            if(!firstTime) {
                queryParams.ev = 'p';
            }
            self.collect(queryParams, fn);
        }

    };

    this.collect = function(queryParams, fn) {
        var self = this;
        var start = new Date().getTime(),
        //Set the amount of time a session should last.
            sessionExpireTime = new Date(),
            session_cookie = ipCookie("session_cookie"), //Check if we have a session cookie:
            device,
            isMobile,
            permanent_cookie = ipCookie("permanent_cookie"),
            new_visitor = true,
            timezone,
            campaign = {},
            hasUtm = false,
            referrer = document.referrer, //Add information about the referrer of the same format as the current page
            parsedReferrer,
            referrerObject = null,
            apiUrl;

            new Fingerprint2().get(function(fingerprint, components){
                if(!queryParams) {


                    sessionExpireTime.setMinutes(sessionExpireTime.getMinutes() + 30);

                    //If it is undefined, set a new one.
                    if (!session_cookie || !session_cookie.id) {
                        entrance = true;
                        ipCookie("session_cookie", {
                            id: Math.uuid()
                        }, {
                            expires: sessionExpireTime,
                            path: "/" //Makes this cookie readable from all pages
                        });
                    } else {
                        //If it does exist, delete it and set a new one with new expiration time
                        ipCookie.remove("session_cookie", {
                            path: "/"
                        });
                        ipCookie("session_cookie", session_cookie, {
                            expires: sessionExpireTime,
                            path: "/"
                        });
                    }
                    //If it is undefined, set a new one.
                    if (permanent_cookie === undefined) {
                        ipCookie("permanent_cookie", {
                            id: Math.uuid()
                        }, {
                            expires: 3650, //10 year expiration date
                            path: "/" //Makes this cookie readable from all pages
                        });
                    } else {
                        new_visitor = false;
                    }

                    //determine if the device is mobile or not
                    isMobile = {
                        Android: function () {
                            return navigator.userAgent.match(/Android/i);
                        },
                        BlackBerry: function () {
                            return navigator.userAgent.match(/BlackBerry/i);
                        },
                        iOS: function () {
                            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                        },
                        Opera: function () {
                            return navigator.userAgent.match(/Opera Mini/i);
                        },
                        Windows: function () {
                            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
                        },
                        any: function () {
                            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
                        }
                    };

                    if (isMobile.any()) {
                        device = 'mobile';
                    } else {
                        device = 'desktop';
                    }

                    //get browser fingerprint
                    fingerprint = new Fingerprint().get();
                    timezone = jstz.determine();

                    queryParams = {};
                    queryParams.sid= ipCookie('session_cookie').id;
                    queryParams.pt=ipCookie('permanent_cookie').id;
                    queryParams.ev='s';
                    if(parser.getBrowser()) {
                        queryParams.uabn=parser.getBrowser().name;
                        queryParams.uabv=parser.getBrowser().version;
                        queryParams.uabm=parser.getBrowser().major;
                    }
                    if(parser.getEngine()) {
                        queryParams.uaen=parser.getEngine().name;
                        queryParams.uaev=parser.getEngine().version;
                    }
                    if(parser.getOS()) {
                        queryParams.uaon=parser.getOS().name;
                        queryParams.uaov=parser.getOS().version;
                    }
                    queryParams.uad=device;
                    queryParams.f=fingerprint.toString();
                    queryParams.t=timezone.name();
                    queryParams.nv=new_visitor;
                    queryParams.fe=$location.absUrl();


                    if ($location.search().utm_source) {
                        hasUtm = true;
                        campaign.utm_source = $location.search().utm_source;
                    }

                    if ($location.search().utm_medium) {
                        hasUtm = true;
                        campaign.utm_medium = $location.search().utm_medium;
                    }

                    if ($location.search().utm_campaign) {
                        hasUtm = true;
                        campaign.utm_campaign = $location.search().utm_campaign;
                    }

                    if ($location.search().utm_term) {
                        hasUtm = true;
                        campaign.utm_term = $location.search().utm_term;
                    }

                    if ($location.search().utm_content) {
                        hasUtm = true;
                        campaign.utm_content = $location.search().utm_content;
                    }

                    if (hasUtm) {
                        queryParams.utms=campaign.utm_source;
                        queryParams.utmm=campaign.utm_medium;
                        queryParams.utmc=campaign.utm_campaign;
                        queryParams.utmt=campaign.utm_term;
                        queryParams.utmct=campaign.utm_content;
                    }

                    if (referrer !== undefined) {
                        parsedReferrer = $.url(referrer);
                        queryParams.r=parsedReferrer.attr('source');
                        queryParams.st=self.getSourceType(parsedReferrer.attr("host"));
                    }
                    console.log('queryParams:', queryParams);
                }

                //api/2.0/analytics/collect
                apiUrl = baseUrl2 + 'collect';
                $http.get(apiUrl, {params:queryParams})
                    .success(function (data) {
                        fn(data);
                    });
        });
    };
}]);
