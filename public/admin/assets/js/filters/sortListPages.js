'use strict';

app.filter('sortListPages', function () {
  return function (pages, id, account) {

        if (pages) {
            var pageArr = _(pages).chain()
                        .where({_id: id})
                        .pluck("_id")
                        .value()

            var _sortOrder = _.invert(_.object(_.pairs(pageArr)));

            var _filteredPages = pages;

            if (account && !account.showhide.blog) {
                _filteredPages = _(pages).chain()
                        .filter(function(page) {
                            return page.handle !== 'blog-list' && page.handle !== 'blog-post';
                        })
                        .value();
            }

            var _list =  _.sortBy(_filteredPages, function(x) {
                return _sortOrder[x._id]
            });

            return _list;
        }
  };
});
