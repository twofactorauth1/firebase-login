mainApp.filter('selectedTags', function() {
    return function(products, tags) {
        if(products)
        {
            return products.filter(function(product) {
                if(!tags || tags.length === 0)
                {
                    if(product.status === 'active')
                        return true;
                    else
                        return false;
                }
                else{
                    for (var i in product.tags) {
                    if (product.status === 'active' && tags.indexOf(product.tags[i]) != -1) {
                        return true;
                    }
                }
                return false;
            }                
            });
        }
    };
});