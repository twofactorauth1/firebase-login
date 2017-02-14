app.filter('generateURLforProducts', function () {
    return function (product, location) {
        var _url = "";
        if(product)
        {
            _url = location.search('productId', product._id).$$absUrl;            
        }
        return _url;
    }
});