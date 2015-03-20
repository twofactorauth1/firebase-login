mainApp.filter('urlFilter', function() {
    return function(url) {
        if(url) {
            return url.replace(/\W+/g, "").toLowerCase();
        } else {
            //console.log('url is undefined.');
        }

    }
});