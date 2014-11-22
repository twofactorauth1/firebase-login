mainApp.filter('getByType', function() {
    return function(input, type) {
        var i = 0, len = input.length;
        for (; i < len; i = i + 1) {
            if (input[i].type === type) {
                return input[i];
            }
        }
        return null;
    }
});