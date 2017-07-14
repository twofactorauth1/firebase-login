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

        quoteCartService.calculateTotalPrice = calculateTotalPrice;

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

        function removeItemFromCart(index) {
            quoteCartService.items.splice(index, 1);
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

        function calculateTotalPrice(items){
            var totalPrice = 0;
            if(items){
                totalPrice = _.reduce(items, function(m, item) { 
                    return m + (item.ITM1_Price || 0) *  item.quantity; },
                0);
            }
            return totalPrice || 0;
        }

        (function init() {
            quoteCartService.items = [];
        })();
    return quoteCartService;       
    }
})();