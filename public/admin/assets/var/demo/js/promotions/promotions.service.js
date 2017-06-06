'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('PromotionsService', PromotionsService);

	PromotionsService.$inject = ['$http'];
	/* @ngInject */
	function PromotionsService($http) {
        var promotionsService = {};
        promotionsService.loading = {value: 0};
        var baseOrgConfigAPIUrl = '/api/1.0/user/orgConfig';
        promotionsService.getUserOrgConfig = getUserOrgConfig;
        promotionsService.getPromotions = getPromotions;

        function promotionsRequest(fn) {
            promotionsService.loading.value = promotionsService.loading.value + 1;
            console.info('service | loading +1 : ' + promotionsService.loading.value);
            fn.finally(function () {
                promotionsService.loading.value = promotionsService.loading.value - 1;
                console.info('service | loading -1 : ' + promotionsService.loading.value);
            });
            return fn;
        }


        function getPromotions(){
            var promotions = [];
            
            for(var i = 1; i<=4; i++){
                promotions.push({
                    name: "Promo #" + i,
                    vendor: "Juniper",
                    promoCode: "1234567890",
                    products: "Product #1, Product #2, Product #3, Product #4",
                    startDate: "05/31/2017",
                    exprirationDate: "09/31/2017",
                    shipments: 4
                })
            }

            promotionsService.promotions = promotions;
            
        }
        
		(function init() {
            promotionsService.getUserOrgConfig();
            promotionsService.getPromotions();
		})();


		return promotionsService;
	}

})();
