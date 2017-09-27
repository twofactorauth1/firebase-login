indigenous = window.indigenous || {};
indigenous.analyticsV2 = true;
indigenous.runningInterval = null;
indigenous.siteId = null;
indigenous.collector = function(siteId, isTest){
    var queryParams = {};
    if(!indigenous.sid) {
        indigenous.sid = Math.uuid();
    }
    if(isTest) {
        indigenous.isTest = true;
    }
    indigenous.siteId = siteId;
    queryParams.siteid = indigenous.siteId;
    queryParams.sid = indigenous.sid;
    queryParams.pt = readCookie('permanent_cookie').id;
    var new_visitor = true;
    var device;
    var fingerprint = new Fingerprint2();
    fingerprint.get(function(result, components) {
        if(!queryParams.pt) {
            //If it is undefined, set a new one.
            setCookie("permanent_cookie", {
                id: Math.uuid()
            }, {
                expires: 3650, //10 year expiration date
                path: "/" //Makes this cookie readable from all pages
            });
            queryParams.pt =  Math.uuid();
        } else {
            new_visitor = false;
        }
        queryParams.ev='s';
        var parser = new UAParser();//should be loaded by collector-deps.js
        var isMobile = {
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
        var timezone = jstz.determine();
        queryParams.f=result;
        queryParams.t=timezone.name();
        queryParams.nv=new_visitor;
        queryParams.fe=window.location;
        var hasUtm = false;
        var campaign = {};
        var searchParams = new URLSearchParams(window.location.search); //TODO: add shim for IE

        if (searchParams.get('utm_source')) {
            hasUtm = true;
            campaign.utm_source = searchParams.get('utm_source');
        }

        if (searchParams.get('utm_medium')) {
            hasUtm = true;
            campaign.utm_medium =searchParams.get('utm_medium');
        }

        if (searchParams.get('utm_campaign')) {
            hasUtm = true;
            campaign.utm_campaign = searchParams.get('utm_campaign');
        }

        if (searchParams.get('utm_term')) {
            hasUtm = true;
            campaign.utm_term = searchParams.get('utm_term');
        }

        if (searchParams.get('utm_content')) {
            hasUtm = true;
            campaign.utm_content = searchParams.get('utm_content');
        }

        if (hasUtm) {
            queryParams.utms=campaign.utm_source;
            queryParams.utmm=campaign.utm_medium;
            queryParams.utmc=campaign.utm_campaign;
            queryParams.utmt=campaign.utm_term;
            queryParams.utmct=campaign.utm_content;
        }
        var referrer = document.referrer;
        if (referrer) {

            queryParams.r = referrer;
            queryParams.st=getSourceType(extractRootDomain(referrer));
        }
        var client = new HttpClient();
        var url = 'https://indigenous.io/api/2.0/analytics/collect?';
        if(isTest) {
            url = 'http://test.indigenous.io/api/2.0/analytics/collect?';
        }
        Object.keys(queryParams).forEach(function(key,index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object
            url+=key + '='+queryParams[key] + '&';
        });
        client.get(url, function(response) {
            //console.log('response:', response);
            indigenous.page();
        });

    });

};

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return {};
}

function setCookie(cname, obj, expires, path) {
    var cValue = encodeURIComponent(obj);
    var d = new Date();
    d.setTime(d.getTime() + (expires * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cValue + ";" + expires + ";path=" + path;
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    }
    return domain;
}

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        };

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
};

getSourceType = function (host) {
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

indigenous.page = function(name) {
    /*
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
     */


    clearTimeout(indigenous.runningInterval);
    if(!indigenous.sid) {
        indigenous.sid = Math.uuid();
    }
    var queryParams = {ev:'pg', fe:window.location.href, sid:indigenous.sid};
    if(name) {
        queryParams.n = name;
    }
    queryParams.siteid = indigenous.siteId;
    indigenous._collectPage(queryParams);
};
indigenous._collectPage = function(queryParams) {
    var client = new HttpClient();
    var url = 'https://indigenous.io/api/2.0/analytics/collect?';
    if(this.isTest) {
        url = 'http://test.indigenous.io/api/2.0/analytics/collect?';
    }
    Object.keys(queryParams).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object
        url+=key + '='+queryParams[key] + '&';
    });
    client.get(url, function(response) {
        var counter = 0;
        queryParams.ev = 'p';
        //every 15 seconds send page tracking data
        indigenous.runningInterval = setTimeout(function () {
            indigenous._collectPage(queryParams);
            counter++;
            if (counter >= (1000 * 60 * 60)) {
                clearTimeout(indigenous.runningInterval);
            }
        }, 30000);
    });
};
//indigenous.collector(1702, true);
