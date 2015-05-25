mainApp.filter('offset', function() {
    return function(input, start) {
        start = parseInt(start, 10);
        if(input)
    		return input.slice(start);
    }
});