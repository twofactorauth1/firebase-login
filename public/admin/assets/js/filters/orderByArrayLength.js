'use strict';

app.filter('orderByArrayLength', function () {
    return function(input, attribute) {
	    if (!angular.isObject(input)) return input;

        var retList = _.sortBy(input, function(item) {
            if (item[attribute]) {
                if (_.isArray(item[attribute])) {
                    return item[attribute].length;
                } else {
                    return item[attribute];
                }
            } else {
                return null;
            }
        });
        return retList.reverse();
    }
});
