define(['app', 'moment'], function(app) {
  app.register.filter('timeAgoFilter', function() {
    return function(date) {
      return moment(date).fromNow();
    }
  });
});
