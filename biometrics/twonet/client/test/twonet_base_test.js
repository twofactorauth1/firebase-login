process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var TwonetBase = require('../twonet_base'),
    twoNetBase = new TwonetBase();


exports.twonet_base_tests = {
    convertToArray: function(test) {

        test.expect(11);

        var arr = twoNetBase.convertToArray({});
        test.ok(arr instanceof Array);
        test.equals(arr.length, 1);
        test.equals(JSON.stringify(arr[0]), JSON.stringify({}));

        arr = twoNetBase.convertToArray();
        test.ok(arr instanceof Array);
        test.equals(arr.length, 0);

        arr = twoNetBase.convertToArray(null);
        test.ok(arr instanceof Array);
        test.equals(arr.length, 0);

        arr = twoNetBase.convertToArray([{a:1},{a:2}]);
        test.ok(arr instanceof Array);
        test.equals(arr.length, 2);
        test.equals(JSON.stringify(arr[0]), JSON.stringify({a:1}));
        test.equals(JSON.stringify(arr[1]), JSON.stringify({a:2}));

        test.done();
    }
};