'use strict';

app.filter('filterSsbSections', function () {
    return function (sections, sectionFilter) {
        return _.filter(sections, function(x) {
            if(angular.isDefined(x.filterArray)){
              return _.contains(x.filterArray, sectionFilter.lowercase) && x.enabled;
            }
            else{
              return x.filter === sectionFilter.lowercase && x.enabled;
            }
            
        });
    };
});
