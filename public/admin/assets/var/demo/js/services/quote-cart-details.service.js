(function () {
    app.factory('QuoteCartDetailsService', QuoteCartDetailsService);
    QuoteCartDetailsService.$inject = ['$http'];
    function QuoteCartDetailsService($http){
        var quoteCartService = {};


        quoteCartService.getCartItemDetails = getCartItemDetails;
        
        quoteCartService.addItemToCart = addItemToCart;

        quoteCartService.removeItemFromCart = removeItemFromCart;;

        quoteCartService.getCartItem = getCartItem;

        quoteCartService.calculateTotalPrice = calculateTotalPrice;

        quoteCartService.newItem = true;

        quoteCartService.loading = {value: 0};

        var baseQuotesAPIUrlv2 = '/api/2.0/quotes';
        quoteCartService.loading = {value: 0};

        quoteCartService.cartDetail = {
            items: []
        }

        function quoteServiceRequest(fn) {
            quoteCartService.loading.value = quoteCartService.loading.value + 1;
            console.info('service | loading +1 : ' + quoteCartService.loading.value);
            fn.finally(function () {
                quoteCartService.loading.value = quoteCartService.loading.value - 1;
                console.info('service | loading -1 : ' + quoteCartService.loading.value);
            });
            return fn;
        }

        function getCartItemDetails() {

            function success(data) {
                if(data.length){
                    quoteCartService.cartDetail = data[0];
                }
            }

            function error(error) {
                console.error('quoteCartService getCartItems error: ', JSON.stringify(error));
            }

            return quoteServiceRequest($http.get([baseQuotesAPIUrlv2, "cart", "items"].join('/')).success(success).error(error));
        }


        function saveUpdateCartQuoteItems() {

            function success(data) {
                quoteCartService.cartDetail.items = data.items;
            }

            function error(error) {
                console.error('quoteCartService saveUpdateCartQuoteItems error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuotesAPIUrlv2, "cart", "items"].join('/');


            return quoteServiceRequest($http.post(apiUrl, quoteCartService.cartDetail).success(success).error(error));

        }

        function addItemToCart(item) {
            _addUpdateItemCart(item)
        }

        function getCartItem(item){
            var _item = _.findWhere(quoteCartService.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode })
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
            quoteCartService.cartDetail.items.splice(index, 1);
        }



        function _addUpdateItemCart(item){
            var _item = _.findWhere(quoteCartService.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode });
            if(!_item){
                quoteCartService.cartDetail.items.push(item);
            }
            saveUpdateCartQuoteItems(quoteCartService.cartDetail.items);
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
            quoteCartService.getCartItemDetails();
        })();
    return quoteCartService;       
    }
})();
