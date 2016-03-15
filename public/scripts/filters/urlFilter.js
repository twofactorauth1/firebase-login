mainApp.filter('urlFilter', function() {
    return function(url) {
        if(url) {
            return url.replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
        } else {
            //console.log('url is undefined.');
        }

    }
});
