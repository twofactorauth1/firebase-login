app.directive('uiSelectChoices', ['$timeout', '$parse', '$compile', '$document', '$filter', function($timeout, $parse, $compile, $document, $filter) {
  
  return function(scope, elm, attr) {
    var raw = elm[0];
    var scrollCompleted = true;
    if (!angular.isDefined(attr.allChoices)) {
      return;
    }
    
    scope.pagingOptions = {
      allOptions: scope.$eval(attr.allChoices)
    };

    attr.refresh = 'addMoreItems()';
    var refreshCallBack = $parse(attr.refresh);
    elm.bind('scroll', function(event) {
      var remainingHeight = raw.offsetHeight - raw.scrollHeight;
      var scrollTop = raw.scrollTop;
      var percent = Math.abs((scrollTop / remainingHeight) * 100);

      if (percent >= 80) {
        if (scrollCompleted) {
          scrollCompleted = false;
          event.preventDefault();
          event.stopPropagation();
          var callback = function() {
            scope.addingMore = true;
            refreshCallBack(scope, {
              $event: event
            });
            scrollCompleted = true;

          };
          $timeout(callback, 100);
        }
      }
    });

    var closeDestroyer = scope.$on('uis:close', function() {
      var pagingOptions = scope.$select.pagingOptions || {};
      pagingOptions.filteredItems = undefined;
      pagingOptions.page = 0;
    });

    scope.addMoreItems = function(doneCalBack) {
      console.log('new addMoreItems');
      var $select = scope.$select;
      var allItems = scope.pagingOptions.allOptions;
      var moreItems = [];
      var itemsThreshold = 100;
      var search = $select.search;

      var pagingOptions = $select.pagingOptions = $select.pagingOptions || {
        page: 0,
        pageSize: 20,
        items: $select.items
      };

      if (pagingOptions.page === 0) {
        pagingOptions.items.length = 0;
      }
      if (!pagingOptions.originalAllItems) {
        pagingOptions.originalAllItems = scope.pagingOptions.allOptions;
      }
      console.log('search term=' + search);
      console.log('prev search term=' + pagingOptions.prevSearch);
      var searchDidNotChange = search && pagingOptions.prevSearch && search == pagingOptions.prevSearch;
      console.log('isSearchChanged=' + searchDidNotChange);
      if (pagingOptions.filteredItems && searchDidNotChange) {
        allItems = pagingOptions.filteredItems;
      }
      pagingOptions.prevSearch = search;
      if (search && search.length > 0 && pagingOptions.items.length < allItems.length && !searchDidNotChange) {
        //search


        if (!pagingOptions.filteredItems) {
          //console.log('previous ' + pagingOptions.filteredItems);
        }

        pagingOptions.filteredItems = undefined;
        moreItems = $filter('filter')(pagingOptions.originalAllItems, search);
        //if filtered items are too many scrolling should occur for filtered items
        if (moreItems.length > itemsThreshold) {
          if (!pagingOptions.filteredItems) {
            pagingOptions.page = 0;
            pagingOptions.items.length = 0;
          } else {

          }
          pagingOptions.page = 0;
          pagingOptions.items.length = 0;
          allItems = pagingOptions.filteredItems = moreItems;

        } else {
          allItems = moreItems;
          pagingOptions.items.length = 0;
          pagingOptions.filteredItems = undefined;
        }


      } else {
        console.log('plain paging');
      }
      pagingOptions.page++;
      if (pagingOptions.page * pagingOptions.pageSize < allItems.length) {
        moreItems = allItems.slice(pagingOptions.items.length, pagingOptions.page * pagingOptions.pageSize);
      }

      for (var k = 0; k < moreItems.length; k++) {
        pagingOptions.items.push(moreItems[k]);
      }

      //scope.calculateDropdownPos();
      scope.$broadcast('uis:refresh');
      if (doneCalBack) doneCalBack();
    };
    scope.$on('$destroy', function() {
      elm.off('scroll');
      closeDestroyer();
    });
  };
}]);