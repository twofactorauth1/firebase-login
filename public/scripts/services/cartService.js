(function () {
    mainApp.factory('CartDetailsService', CartDetailsService);
    function CartDetailsService(){
        var cartService = {};


        cartService.getCartItems = getCartItems;
        
        cartService.addItemToCart = addItemToCart;

        cartService.calculateTotalCharges = calculateTotalCharges;

        cartService.checkOnSale = checkOnSale;

        cartService.removeItemFromCart = removeItemFromCart;

        cartService.total = 0;
        cartService.totalTax = 0;
        cartService.subTotal = 0;
        cartService.showTax = false;
        cartService.taxPercent = 0;
        cartService.showNotTaxed = false;
        cartService.hasSubscriptionProduct = false;
        cartService.totalDiscount = 0;

        function getCartItems() {
            return cartService.items;
        }       

        function addItemToCart(item) {
            cartService.items.push(item);

            cartService.items.forEach(function (item, index) {
                if (item.type == "SUBSCRIPTION") {
                    cartService.hasSubscriptionProduct = true;
                }
            });
            calculateTotalCharges();
        }

        function removeItemFromCart(product, _discount, percent_off) {
            var filteredItems = _.filter(cartService.items, function(item) {
                return item._id !== product._id;
            });
            cartService.items = filteredItems;
            cartService.hasSubscriptionProduct = false;
            cartService.items.forEach(function (item, index) {
                if (item.type == "SUBSCRIPTION") {
                    cartService.hasSubscriptionProduct = true;
                }
            });
            calculateTotalCharges(_discount);
        }

        function calculateTotalCharges(_discount, percent_off) {
            if(!angular.isDefined(_discount)){
                _discount = 0;
            }
            if(!angular.isDefined(percent_off)){
                percent_off = false;
            }

            var _subTotal = 0;
            var _totalTax = 0;
            var _subtotalTaxable = 0;
            _.each(cartService.items, function(item){
                var _price = item.regular_price;
                if (checkOnSale(item)) {
                    _price = item.sale_price
                }
                _subTotal = parseFloat(_subTotal) + (parseFloat(_price) * item.quantity);
                if (item.taxable && cartService.showTax) {
                    _subtotalTaxable += _price * item.quantity;
                }

                if (!item.taxable) {
                    cartService.showNotTaxed = true;
                }
            });

            if(_discount && !percent_off){
                _discount = _discount / 100;
            }
            else if(_discount && percent_off){
                _discount = _subTotal * _discount / 100;
            }

            if (_subtotalTaxable > 0) {
                _totalTax = (_subtotalTaxable - _discount) * parseFloat(cartService.taxPercent) / 100;
            }
            if(_totalTax < 0)
                _totalTax = 0;
            cartService.subTotal = _subTotal;
            cartService.totalTax = _totalTax ;
            cartService.total = (_subTotal + _totalTax - _discount > 0 ? _subTotal + _totalTax - _discount : 0);
            cartService.totalDiscount = _discount;
        }



        function checkOnSale(_product) {
            if (_product.on_sale) {
                if (_product.sale_date_from && _product.sale_date_to) {
                    var date = new Date();
                    var startDate = new Date(_product.sale_date_from);
                    var endDate = new Date(_product.sale_date_to);
                    if (startDate <= date && date <= endDate) {
                        return true; //false in this case
                    }
                    return false;
                }
                return true;
            }
        }
        
        (function init() {
            cartService.items = [];
        })();
    return cartService;       
    }
})();