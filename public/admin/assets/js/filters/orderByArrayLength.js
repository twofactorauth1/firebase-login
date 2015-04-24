'use strict';

app.filter('orderByArrayLength', function () {
    return function(input, attribute) {
	    if (!angular.isObject(input)) return input;

	    var array = [];
	    for(var objectKey in input) {
	        array.push(input[objectKey]);
	    }

	    array.sort(function(a, b){
	        if (a[attribute])
	            a = parseInt(a[attribute].length);
	        else
			a = 0;
	        if (b[attribute])
	            b = parseInt(b[attribute].length);
	        else
			b = 0;

            return b - a;
	    });
    return array;
    }
});
