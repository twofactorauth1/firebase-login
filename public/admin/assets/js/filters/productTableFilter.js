'use strict';

app
  .filter('productTableFilter', function ($filter) {
    return function(input, predicate){
        var customPredicate = angular.copy(predicate);

        if (predicate.name) {
            input = _.filter(input, function(x) {
              return x.name.toLowerCase().startsWith(predicate.name.toLowerCase());
            });
            delete customPredicate['name'];
        }

        if (predicate.is_image) {
          customPredicate.is_image = predicate.is_image == 'true' ? true : false;
        }

        return $filter('filter')(input, customPredicate, true);
    }
});
