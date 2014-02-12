var JSCache = require('../utils/jscache').JSCache;
var appConfig = require('./app.config');


var cacheClusterOptions = {
    enabled: true,
    nullOnSet: false
};

var ttl = 10, refresh = 60;
if (process.NODE_ENV == appConfig.environments.DEVELOPMENT) {
    ttl = 10;
    refresh = 60;
} else if(process.NODE_ENV == appConfig.environments.STAGING) {
    ttl = 60;
    refresh = 60;
} else if(process.NODE_ENV == appConfig.environments.PRODUCTION) {
    ttl = 60;
    refresh = 60;
}


module.exports = {
    configure: function() {
        return new JSCache({
            ttl: ttl,
            refresh: refresh,
            cluster:cacheClusterOptions
        });
    }
}
