'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('PromotionsService', PromotionsService);

	PromotionsService.$inject = ['$http', '$location'];
	/* @ngInject */
	function PromotionsService($http, $location) {
        var promotionsService = {};
        promotionsService.loading = {value: 0};
        
        var basePromotionAPIUrlv2 = '/api/2.0/promotions';

        promotionsService.getPromotions = getPromotions;
        promotionsService.createPromotion = createPromotion;

        function promotionsRequest(fn) {
            promotionsService.loading.value = promotionsService.loading.value + 1;
            console.info('service | loading +1 : ' + promotionsService.loading.value);
            fn.finally(function () {
                promotionsService.loading.value = promotionsService.loading.value - 1;
                console.info('service | loading -1 : ' + promotionsService.loading.value);
            });
            return fn;
        }


        /**
            * Get list of all po's for the account
        */
        function getPromotions() {

            function success(data) {
                promotionsService.promotions = data;
            }

            function error(error) {
                console.error('PurchaseOrderService getPromotions error: ', JSON.stringify(error));
            }

            return promotionsRequest($http.get([basePromotionAPIUrlv2].join('/')).success(success).error(error));
        }

        /**
            * Create new Promotion
        */
        function createPromotion(promotion) {

            function success(data) {                
                promotionsService.promotions.splice(0, 0, data);
            }

            function error(error) {
                console.error('PromotionService getPromotions error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', promotion.attachment);
            _formData.append('promotion', angular.toJson(promotion));
            _formData.append('adminUrl', $location.$$absUrl.split("#")[0]);
            return promotionsRequest($http.post(basePromotionAPIUrlv2, _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }
        
		(function init() {
            promotionsService.getPromotions();
		})();


		return promotionsService;
	}

})();