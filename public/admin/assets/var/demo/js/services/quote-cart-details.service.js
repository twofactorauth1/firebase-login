(function () {
    app.factory('QuoteCartDetailsService', QuoteCartDetailsService);
    QuoteCartDetailsService.$inject = ['$rootScope', '$http'];
    function QuoteCartDetailsService($rootScope, $http){
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

        quoteCartService.saveLoading = false;

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


        function saveUpdateCartQuoteItems(_add) {

            function success(data) {
                quoteCartService.saveLoading = false;
                if(_add){
                    quoteCartService.cartDetail = data;
                }
            }

            function error(error) {
                console.error('quoteCartService saveUpdateCartQuoteItems error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuotesAPIUrlv2, "cart", "items"].join('/');


            return quoteServiceRequest($http.post(apiUrl, quoteCartService.cartDetail).success(success).error(error));

        }

        function addItemToCart(item) {
            return _addUpdateItemCart(item);
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
            //return saveUpdateCartQuoteItems();
        }

        
        function _addUpdateItemCart(item){
            quoteCartService.saveLoading = true;
            var _item = _.findWhere(quoteCartService.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode });
            if(!_item){
                quoteCartService.cartDetail.items.push(item);
            }
            return saveUpdateCartQuoteItems(true);
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


        $rootScope.$watch(function() { return quoteCartService.cartDetail.items }, _.debounce(function (items, oldItems) {
            if (!quoteCartService.saveLoading && items && oldItems && !angular.equals(items, oldItems)) {
                saveUpdateCartQuoteItems();
            }
        }, 1000), true);

        (function init() {
            quoteCartService.getCartItemDetails();
        })();
    return quoteCartService;       
    }
})();