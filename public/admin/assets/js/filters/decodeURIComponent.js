'use strict';

app.filter('decodeURIComponent', function() {
    return window.decodeURIComponent;
});
