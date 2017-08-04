(function () {
    app.factory('QuoteCartDetailsService', QuoteCartDetailsService);
    QuoteCartDetailsService.$inject = ['$rootScope', '$http', '$filter'];
    function QuoteCartDetailsService($rootScope, $http, $filter){
        var quoteCartService = {};


        quoteCartService.getCartItemDetails = getCartItemDetails;
        
        quoteCartService.addItemToCart = addItemToCart;

        quoteCartService.removeItemFromCart = removeItemFromCart;;

        quoteCartService.getCartItem = getCartItem;

        quoteCartService.calculateTotalPrice = calculateTotalPrice;        

        quoteCartService.loading = {value: 0};

        var baseQuotesAPIUrlv2 = '/api/2.0/quotes';
        var baseCustomerAPIUrl = '/api/1.0/integrations/zi';

        quoteCartService.createQuote = createQuote;
        quoteCartService.updateQuoteAttachment = updateQuoteAttachment;
        quoteCartService.deleteCartDetails = deleteCartDetails;
        quoteCartService.saveLoading = false;
        quoteCartService.submitQuote = submitQuote;
        quoteCartService.getCustomers = getCustomers;
        quoteCartService.getCartItemTitle = getCartItemTitle;
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

        function setVendorSpecialPricing(){
            
            var items =  _.groupBy(quoteCartService.cartDetail.items, function(item){ 
                return item._shortVendorName; 
            });
            var keyArr = _.map(items, function(g, key){return {vendor: key}});

            _.each(keyArr, function(item){
                if(quoteCartService.cartDetail.vendorSpecialPricing && quoteCartService.cartDetail.vendorSpecialPricing.length){
                    if(!_.contains(_.pluck(quoteCartService.cartDetail.vendorSpecialPricing, "vendor"), item.vendor)){
                        quoteCartService.cartDetail.vendorSpecialPricing.push({
                            "vendor": item.vendor
                        })
                    }
                }
                else{
                    quoteCartService.cartDetail.vendorSpecialPricing = [];
                    quoteCartService.cartDetail.vendorSpecialPricing.push({
                        "vendor": item.vendor
                    })
                }
            })

            quoteCartService.cartDetail.vendorSpecialPricing = _.filter(quoteCartService.cartDetail.vendorSpecialPricing, function(item){
                return _.contains(_.pluck(keyArr, 'vendor'), item.vendor) 
            })

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


        function deleteCartDetails(cart) {

            function success(data) {
                quoteCartService.cartDetail = {
                    items: []
                }
            }

            function error(error) {
                console.error('quoteCartService deleteCartDetails error: ', JSON.stringify(error));
            }
            var apiUrl = [baseQuotesAPIUrlv2, "cart", "items", cart._id].join('/');
            return quoteServiceRequest(
                $http({
                    url: apiUrl,
                    method: "DELETE"
                }).success(success).error(error)
            )
        }

        function createQuote(quote){
            function success(data) {
                
            }

            function error(error) {
                console.error('quoteCartService createQuote error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuotesAPIUrlv2].join('/');


            return quoteServiceRequest($http.post(apiUrl, quote).success(success).error(error));
        }

        function updateQuoteAttachment(attachment, _id, fn){
            function success(data) {                
                console.log(data);
            }

            function error(error) {
                console.error('quoteCartService updateQuoteAttachment error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', attachment);
            
            return quoteServiceRequest($http.post([baseQuotesAPIUrlv2, 'attachment', _id].join('/'), _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }


        function submitQuote(quote){
            function success(data) {
                
            }

            function error(error) {
                console.error('quoteCartService submitQuote error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuotesAPIUrlv2, quote._id, "submit"].join('/');


            return quoteServiceRequest($http.post(apiUrl, quote).success(success).error(error));
        }

        function addItemToCart(item) {
            return _addUpdateItemCart(item);
        }

        function getCartItem(item, state){
            var _item = _.findWhere(quoteCartService.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode })
            if(_item){
                state.newItem = false;
                return _item
            }
            else{
                state.newItem = true;
                item.quantity = 1;
                return item;
            }
        }

        function removeItemFromCart(index, callback) {
            quoteCartService.cartDetail.items.splice(index, 1);
            setVendorSpecialPricing();
            callback();
        }


        function _addUpdateItemCart(item){
            quoteCartService.saveLoading = true;
            var _item = _.findWhere(quoteCartService.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode });
            if(!_item){
                quoteCartService.cartDetail.items.push(item);
            }
            setVendorSpecialPricing();
            return saveUpdateCartQuoteItems(true);
        }

        function calculateTotalPrice(items){
            var totalPrice = 0;
            if(items){
                totalPrice = _.reduce(items, function(m, item) {
                    return m + (item.ITM1_Price || 0) *  item.quantity; },
                0);
            }
            quoteCartService.cartDetail.total = totalPrice;
            return totalPrice || 0;
        }

        /**
            * Get list of all VARs
        */
        function getCustomers() {

            function success(data) {
                var _list = data.results;
                _list = $filter('orderBy')(_list, ["OCRD_CardName", "OCRD_CardCode"]);
                quoteCartService.customers = _list;
            }

            function error(error) {
                quoteCartService.customers = [];
                console.error('quoteCartService getCustomers error: ', JSON.stringify(error));
            }

            return quoteServiceRequest($http.get([baseCustomerAPIUrl, 'customers'].join('/')).success(success).error(error));
        }

        function getCartItemTitle(title) {

            function success(data) {
                
            }

            function error(error) {
                console.error('quoteCartService getCartItemTitle error: ', JSON.stringify(error));
            }

            return quoteServiceRequest($http.get([baseQuotesAPIUrlv2, "cart", 'items', title].join('/')).success(success).error(error));
        }


        $rootScope.$watch(function() { return quoteCartService.cartDetail.items }, _.debounce(function (items, oldItems) {
            if (!quoteCartService.saveLoading && quoteCartService.cartDetail._id && items && oldItems && !angular.equals(items, oldItems)) {
                saveUpdateCartQuoteItems();
            }
        }, 1000), true);

        (function init() {
            quoteCartService.getCartItemDetails();
            quoteCartService.getCustomers();
        })();
    return quoteCartService;
    }
})();