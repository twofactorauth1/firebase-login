define(['app'], function(app) {
  app.register.filter('iStartsWithFilter', function() {
    return function(items, filterObj) {
      var retItems = [];
      var matchRegex = {};

      for (var field in filterObj) {
        matchRegex[field] = new RegExp(filterObj[field], 'i');
      }
      if (!items) {
        return items;
      }

      items.forEach(function(value, index) {
        var add = true;

        for (var field in matchRegex) {
          if (!value[field]) {
            add = false;
            continue;
          }
          if (!matchRegex[field].test(value[field])) {
            add = false;
          }
        }

        if (add) {
          retItems.push(value);
        }
      });
      return retItems;
    };
  });
});
