(function () {
	mainApp.factory('CartDetailsService', CartDetailsService);
	function CartDetailsService(){
		var cartService = {};

		cartService.getCartItems = getCartItems;
		cartService.getStoredCartItems = getStoredCartItems;
		cartService.addItemToCart = addItemToCart;  
		cartService.storeItemToCart = storeItemToCart;

		function getCartItems() {
			return cartService.items;
		}	

		function getStoredCartItems() {
			return cartService.storedItems;
		}		

		function addItemToCart(item) {
			cartService.items.push(item);
		}
		function storeItemToCart(item) {
			if(cartService.storedItems.indexOf(item) === -1)
				cartService.storedItems.push(item);
		}	

		(function init() {
			cartService.items = [];
			cartService.storedItems = [];
		})();
	return cartService;		  
	}
})();