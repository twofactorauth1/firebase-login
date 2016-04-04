'use strict';

app.filter('sortListPages', function () {
  return function (pages, id) {

        if (pages) {
            var pageArr = _(pages).chain()
                        .where({_id: id})
                        .pluck("_id")
                        .value()
            var _sortOrder = _.invert(_.object(_.pairs(pageArr)));
            var _list =  _.sortBy(pages, function(x) {
                return _sortOrder[x._id]
            });

            return _list;
        }
  };
});
