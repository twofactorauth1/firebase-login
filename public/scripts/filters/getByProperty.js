mainApp.filter('getByProperty', function() {
  return function(propertyName, propertyValue, collection) {
        var i=0, len=collection.length;
        for (; i<len; i++) {
            if (collection[i][propertyName] === propertyValue) {
                return collection[i];
            }
        }
        return null;
    }
});