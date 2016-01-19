'use strict';

app.filter('cleanType', function () {
    return function(type) {
          return String(type).replace('ssb', '').replace('-', ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
});
