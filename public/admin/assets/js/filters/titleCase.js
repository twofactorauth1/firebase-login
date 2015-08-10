'use strict';

app.filter('titleCase', function () {
  return function (input) {
    if (input) {
      var words = input.split(' ');
      _.each(words, function (word) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      });
      return words.join(' ');
    }
  };
});
