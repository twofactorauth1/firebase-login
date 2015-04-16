'use strict';

app
  .filter('timeAgoFilter', function () {
    return function(date) {
      return moment(date).fromNow();
  	}
});