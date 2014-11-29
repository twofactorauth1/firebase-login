mainApp.filter('getByType', function() {
    return function(input, type) {
        var i = 0, len = input.length, arr = [];
        for (; i < len; i = i + 1) {
            if (input[i].type === type) {
                 arr.push(input[i]);
            }
        }
        return arr;
    }
});