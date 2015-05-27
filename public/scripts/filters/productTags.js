mainApp.filter('selectedTags', function() {
    return function(products, tags) {
        if(products && tags && tags.length)
        {
            return products.filter(function(product) {
                for (var i in product.tags) {
                    if (tags.indexOf(product.tags[i]) != -1) {
                        return true;
                    }
                }
                return false;
            });
        }
        
    };
});