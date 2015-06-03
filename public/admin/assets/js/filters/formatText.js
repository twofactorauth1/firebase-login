'use strict';

app.filter('formatText', function () {
  return function (string) {
    var res = string.replace("_", " ");
    var newVal = '';
    res = res.split(' ');
    for (var c = 0; c < res.length; c++) {
      newVal += res[c].substring(0, 1).toUpperCase() + res[c].substring(1, res[c].length) + ' ';
    }
    return newVal;
  };
});
