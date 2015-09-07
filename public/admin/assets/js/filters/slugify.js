'use strict';

app.filter('slugify', function () {
  return function (input, sub) {
    var replace = (angular.isUndefined(sub)) ? '-' : sub;
    return angular.isString(input)
      ? input.toLowerCase().replace(/\s+/g, replace).replace(/\/+/g,"")
      : input;
  };
});