app.filter('propsFilter', function () {
    return function (items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function (item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          var i = 0;
          for (i; i < keys.length; i++) {
            if (item[keys[i]] && item[keys[i]].toString().toLowerCase().indexOf(props[keys[i]].toLowerCase()) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  });