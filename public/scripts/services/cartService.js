(function () {
	mainApp.factory('CartDetailsService', CartDetailsService);
	function CartDetailsService(){
		var cartService = {};

		cartService.getCartItems = getCartItems;
		
		cartService.addItemToCart = addItemToCart;  
		

		function getCartItems() {
			return cartService.items;
		}		

		function addItemToCart(item) {
			cartService.items.push(item);
		}
		
		(function init() {
			cartService.items = [];
		})();
	return cartService;		  
	}
})();