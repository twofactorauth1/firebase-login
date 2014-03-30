/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

//Ensure we load underscore
_ = require('underscore');

if (typeof(_) == 'undefined') {
    throw new Error("js-cache: Underscore is undefined");
}

var JSCache = (function(options) {

    this.initialize(options);
});

_.extend(JSCache.prototype, {

    ttl: 60000,
    refresh: 61000,
    cache: {},
    regions: {},

    initialize: function(options) {
        if (options.ttl) {
            options.ttl = options.ttl * 1000;
        }
        if (options.refresh) {
            options.refresh = options.refresh * 1000;
        }

        this.ttl = options.ttl || this.ttl;
        this.refresh = options.refresh || this.refresh;

        this.setUpCheckTimer();
    },


    setUpCheckTimer: function(region) {
        var intervalId = setInterval(this.checkTTL.bind(this), this.refresh, region);
        this.getRegion(region).__intervalId = intervalId;
    },


    checkTTL: function(region) {
        var cache = this.getRegion(region);
        _.each(cache, function(obj, key, _cache) {
            if (obj.exp < new Date().getTime()) {
                delete _cache[key];
            }
        }, this);

        if (region && Object.keys(cache).length == 1) {
            var intervalId = cache.__intervalId;
            clearInterval(intervalId);
            delete this.regions[region];
        }
    },


    set: function(key, value, region, ttl) {
        console.log("SETTING TO CACHE: " + key);
        if (ttl) {
            ttl = ttl * 1000;
        }
        ttl = ttl || this.ttl;
        var cache = this.getRegion(region);

        var d = new Date();
        cache[key] = {value:value, exp:d.setTime(d.getTime() + ttl) };
    },


    get: function(key, region, touch, ttl, fn) {
        console.log("RETRIEVING FROM CACHE: " + key);
        if (_.isFunction(touch)) {
            fn = touch;
            touch = ttl = null;
        }
        else if (_.isFunction(ttl)) {
            fn = ttl;
            ttl = null;
        }

        var cache = this.getRegion(region);
        if (cache.hasOwnProperty(key)) {
            var obj = cache[key];
            if (obj.exp < new Date().getTime()) {
                delete cache[key];

                if (fn) {
                    fn(null, null);
                }
                return null;
            }

            if (touch === true) {
                this.touch(key, ttl, region);
            }

            var val = cache[key].value;
            if (fn) {
                fn(null, val);
            }
            return val;
        }
        if (fn) {
            fn(null, null);
        }
        return null;
    },


    touch: function(key, ttl, region) {
        if (_.isString(ttl)){
            region = ttl;
            ttl = null;
        }

        var cache = this.getRegion(region);
        if (ttl) {
            ttl = ttl * 1000;
        }
        ttl = ttl || this.ttl;

        if (cache.hasOwnProperty(key)) {
            var obj = cache[key];
            if (obj.exp < new Date().getTime()) {
                delete cache[key];
                return;
            }
            var d = new Date();
            obj.exp = d.setTime(d.getTime() + ttl);
            cache[key] = obj;
        }
    },


    remove: function(key, region) {
        console.log("REMOVING FROM CACHE: " + key);
        var cache = this.getRegion(region);
        delete cache[key];
    },


    clearAll: function(region) {
        if (region != null) {
            this.regions[region] = {};
        } else {
            this.regions = {};
            this.cache = {};
        }
    },


    getRegion: function(region) {
        if (region) {
            if (!this.regions.hasOwnProperty(region)) {
                this.regions[region] = {};

                this.setUpCheckTimer(region);
            }
            return this.regions[region];
        }
        return this.cache;
    }

});

module.exports.JSCache = JSCache;
