(function () {
    app.factory('QuoteCartDetailsService', QuoteCartDetailsService);
    //QuoteCartDetailsService.$inject = [];
    function QuoteCartDetailsService(){
        var quoteCartService = {};


        quoteCartService.getCartItems = getCartItems;
        
        quoteCartService.addItemToCart = addItemToCart;

        quoteCartService.removeItemFromCart = removeItemFromCart;;

        quoteCartService.getCartItem = getCartItem;

        quoteCartService.getCartDetail = getCartDetail;

        quoteCartService.newItem = true;

        function getCartItems() {
            return quoteCartService.items;
        }       

        function addItemToCart(item) {
            _addUpdateItemCart(item)
        }

        function getCartItem(item){
            var _item = _.findWhere(quoteCartService.items, { OITM_ItemCode: item.OITM_ItemCode })
            if(_item){
                quoteCartService.newItem = false;
                return _item
            }
            else{
                quoteCartService.newItem = true;
                item.quantity = 1;
                return item;
            }
        }

        function removeItemFromCart(item) {
            
        }

        function getCartDetail(){
            var cartDetail = {
                items: getCartItems()
            }
            return cartDetail;
        }

        function _addUpdateItemCart(item){
            var _item = _.findWhere(quoteCartService.items, { OITM_ItemCode: item.OITM_ItemCode });
            if(!_item){
                quoteCartService.items.push(item);
            }
        }

        (function init() {
            quoteCartService.items = [];
        })();
    return quoteCartService;       
    }
})();