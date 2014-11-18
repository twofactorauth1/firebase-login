define(['app', 'moment'], function(app, moment) {
  app.register.filter('timeAgoFilter', function() {
    return function(date) {
      return moment(date).fromNow();
    }
  });
});
