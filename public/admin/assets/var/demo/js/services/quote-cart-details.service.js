(function () {
    app.factory('QuoteCartDetailsService', QuoteCartDetailsService);
    //QuoteCartDetailsService.$inject = [];
    function QuoteCartDetailsService(){
        var quoteCartService = {};


        quoteCartService.getCartItems = getCartItems;
        
        quoteCartService.addItemToCart = addItemToCart;

        quoteCartService.removeItemFromCart = removeItemFromCart;

        function getCartItems() {
            return quoteCartService.items;
        }       

        function addItemToCart(item) {
            quoteCartService.items.push(item);
        }

        function removeItemFromCart(item) {
            
        }

        (function init() {
            quoteCartService.items = [];
        })();
    return quoteCartService;       
    }
})();