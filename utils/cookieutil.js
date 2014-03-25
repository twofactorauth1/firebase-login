var cookieUtil =  {

    setCookie: function(resp, key, value, signed, secondsToExpiration) {
        var obj = {};
        if (signed) {
            obj.signed = true;
        }
        if (secondsToExpiration) {
            obj.maxAge = secondsToExpiration * 1000;
        }
        resp.cookie(key, value, obj);
    },


    getCookie: function(req, key, signed) {
        if (signed) {
            return req.signedCookies[key];
        } else {
            return req.cookies[key];
        }
    },


    removeCookie: function(resp, key, signed) {
        resp.clearCookie(key);
    },


    //region SESSION COOKIES
    setSessionId: function(resp, sessionId) {
        this.setCookie(resp, "ind-sess", sessionId, true);
    },

    getSessionId: function(req) {
        return this.getCookie(req, "ind-sess", true);
    },

    clearSessionId: function(resp) {
        this.removeCookie(resp, "ind-sess", true);
    },
    //endregion


    //region COMPANY COOKIES
    setAccountToken: function(resp, token) {
        this.setCookie(resp, "ind-acc", token, true);
    },

    getAccountToken: function(req) {
        return this.getCookie(req, "ind-acc", true);
    },

    clearAccountToken: function(resp) {
        this.removeCookie(resp, "ind-acc", true);
    },
    //endreion


    //region REDIRECT ULR
    setRedirectUrl: function(req, resp) {
        var url = this.getCookie(req, "ind-redirect", false);
        if (url != null) {
            return;
        }

        var url = req.protocol + '://' + req.get('host') + req.url;

        this.setCookie(resp, "ind-redirect", url, false, 600);
    },

    getRedirectUrl: function(req, resp, defaultValue, remove) {
        var url = this.getCookie(req, "ind-redirect", false);

        if (remove) {
            this.clearRedirectUrl(resp);
        }
        if (url == null) {
            return defaultValue;
        }
        return url;
    },

    clearRedirectUrl: function(resp) {
        this.removeCookie(resp, "ind-redirect", false);
    }
    //endregion
}

$$.u = $$.u || {};
$$.u.cookies = cookieUtil;

module.exports = cookieUtil;
