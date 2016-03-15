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

        function removeItemFromCart(product) {
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
            calculateTotalCharges();
        }

        function calculateTotalCharges() {
            var _subTotal = 0;
            var _totalTax = 0;
            _.each(cartService.items, function(item){
                var _price = item.regular_price;
                if (checkOnSale(item)) {
                    _price = item.sale_price
                }
                _subTotal = parseFloat(_subTotal) + (parseFloat(_price) * item.quantity);
                if (item.taxable && cartService.showTax) {
                    _totalTax += (_price * parseFloat(cartService.taxPercent) / 100) * item.quantity;
                }

                if (!item.taxable) {
                    cartService.showNotTaxed = true;
                }
            });
            cartService.subTotal = _subTotal;
            cartService.totalTax = _totalTax;
            cartService.total = _subTotal + _totalTax;
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