'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('PromotionsService', PromotionsService);

	PromotionsService.$inject = ['$http', '$location', '$timeout'];
	/* @ngInject */
	function PromotionsService($http, $location, $timeout) {
        var promotionsService = {};
        promotionsService.loading = {value: 0};
        
        var basePromotionAPIUrlv2 = '/api/2.0/promotions';
        var baseVendorAPIUrlv2 = '/api/1.0/integrations/zi/vendors';
        var baseCustomerAPIUrl = '/api/1.0/integrations/zi';

        promotionsService.getPromotions = getPromotions;
        promotionsService.createPromotion = createPromotion;
        promotionsService.viewPromotionDetails = viewPromotionDetails;
        promotionsService.deletePromotion = deletePromotion;
        promotionsService.getVendors = getVendors;
        promotionsService.updatePromotion = updatePromotion;
        promotionsService.updatePromotionAttachment = updatePromotionAttachment;
        promotionsService.saveShipment = saveShipment;
        promotionsService.updateShipmentAttachment = updateShipmentAttachment;
        promotionsService.getShipments = getShipments;
        promotionsService.deleteShipment = deleteShipment;
        promotionsService.refreshPromotionShipment = refreshPromotionShipment;
        promotionsService.truncateVendorList = truncateVendorList;
        promotionsService.promoTypeOptions = {
            TRY_AND_BUY: "Try and Buy",
            MILESTONE: "Milestone",
            EVENT: "Event",
            options: [
                {
                    label: "Try and Buy",
                    value: "TRY_AND_BUY",
                    disabled: false
                },
                {
                    label: "Milestone",
                    value: "MILESTONE",
                    disabled: true
                },
                {
                    label: "Event",
                    value: "EVENT",
                    disabled: true
                }
            ]    
        }

        promotionsService.reportSheduleOptions = {
            WEEKLY: 'Weekly',
            MONTHLY: 'Monthly',
            options: [
                {
                    label: "Weekly",
                    value: "WEEKLY"
                },
                {
                    label: "Monthly",
                    value: "MONTHLY"
                }
            ]
        }


        promotionsService.shipmentStatusOptions = {
            TRY: "Try",
            BUY: "Buy",
            RMA: 'RMA',
            options: [
                {
                    label: "Try",
                    value: "TRY"
                },
                {
                    label: "Buy",
                    value: "BUY"
                },
                {
                    label: "RMA",
                    value: "RMA"
                }
            ]    
        }

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
            * Get list of all promotions for the account
        */
        function getPromotions() {

            function success(data) {
                promotionsService.promotions = data;
            }

            function error(error) {
                console.error('PromotionService getPromotions error: ', JSON.stringify(error));
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
        
        /**
            * Get promotion details
        */
        function viewPromotionDetails(promotionId) {

            function success(data) {
               
            }

            function error(error) {
                console.error('promotionsService viewPromotionDetails error: ', JSON.stringify(error));
            }
            return promotionsRequest($http.get([basePromotionAPIUrlv2, promotionId].join('/')).success(success).error(error));
        }
		

        function deletePromotion(promotion) {

            function success(data) {
                promotionsService.promotions = _.reject(promotionsService.promotions, function(c){ return c._id == promotion._id });
            }

            function error(error) {
                console.error('promotionsService deletePromotion error: ', JSON.stringify(error));
            }

            return promotionsRequest(
                $http({
                    url: [basePromotionAPIUrlv2, promotion._id].join('/'),
                    method: "DELETE"
                }).success(success).error(error)
            )
        }

        function updatePromotion(promotion) {

            function success(data) {
                var index = _.findIndex(promotionsService.promotions, {
                    _id: data._id
                });

                if (index > -1) {
                    promotionsService.promotions[index] = data;
                } else {
                    promotionsService.promotions.splice(0, 0, data);
                }
            }

            function error(error) {
                console.error('promotionsService updatePromotion error: ', JSON.stringify(error));
            }

            var apiUrl = basePromotionAPIUrlv2;
            if(promotion._id){
                apiUrl = [basePromotionAPIUrlv2, promotion._id].join('/');
            }

            return promotionsRequest($http.post(apiUrl, promotion).success(success).error(error));
            
        }

        /**
            * Get list of allvendors for the account
        */
        function getVendors() {

            function success(data) {
                promotionsService.vendors = data;
            }

            function error(error) {
                console.error('PromotionService getVendors error: ', JSON.stringify(error));
            }

            return promotionsRequest($http.get([baseVendorAPIUrlv2].join('/')).success(success).error(error));
        }

        function updatePromotionAttachment(attachment, _id, fn){
            function success(data) {                
                console.log(data);
            }

            function error(error) {
                console.error('PromotionService updatePromotionAttachment error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', attachment);
            
            return promotionsRequest($http.post([basePromotionAPIUrlv2, 'attachment', _id].join('/'), _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }


        function saveShipment(shipment) {

            function success(data) {
                // var index = _.findIndex(promotionsService.shipments, {
                //     _id: data._id
                // });

                // if (index > -1) {
                //     promotionsService.promotions[index] = data;
                // } else {
                //     promotionsService.promotions.splice(0, 0, data);
                // }
            }

            function error(error) {
                console.error('promotionsService saveShipment error: ', JSON.stringify(error));
            }

            var apiUrl = [basePromotionAPIUrlv2, 'promotion', 'shipment'].join('/');
            if(shipment._id){
                apiUrl = [basePromotionAPIUrlv2, 'promotion', 'shipment', shipment._id].join('/');
            }

            return promotionsRequest($http.post(apiUrl, shipment).success(success).error(error));
            
        }

        function updateShipmentAttachment(attachment, _id, fn){
            function success(data) {                
                console.log(data);
            }

            function error(error) {
                console.error('PromotionService updateShipmentAttachment error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', attachment);
            
            return promotionsRequest($http.post([basePromotionAPIUrlv2, 'promotion', 'shipment', 'attachment', _id].join('/'), _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }


        /**
            * Get list of all shipment for the promotion
        */
        function getShipments(promotionId) {

            function success(data) {
                promotionsService.shipments = data;
            }

            function error(error) {
                console.error('PromotionService getShipments error: ', JSON.stringify(error));
            }

            return promotionsRequest($http.get([basePromotionAPIUrlv2, promotionId, 'shipments'].join('/')).success(success).error(error));
        }


        /**
            * Get list of all customers
        */
        function getCustomers() {

            function success(data) {
                promotionsService.customers = data.results;
            }

            function error(error) {
                promotionsService.customers = [];
                console.error('promotionsService getCustomers error: ', JSON.stringify(error));
            }

            return promotionsRequest($http.get([baseCustomerAPIUrl, 'customers'].join('/')).success(success).error(error));
        }

        function refreshPromotionShipment(status)
        {
            promotionsService.refreshShipment = false;
            $timeout(function() {
                promotionsService.refreshShipment = status;
            }, 0);
            
        }

        function deleteShipment(shipment) {

            function success(data) {
                
            }

            function error(error) {
                console.error('promotionsService deleteShipment error: ', JSON.stringify(error));
            }

            return promotionsRequest(
                $http({
                    url: [basePromotionAPIUrlv2, 'promotion', 'shipment', shipment._id].join('/'),
                    method: "DELETE"
                }).success(success).error(error)
            )
        }

        function truncateVendorList(list){
            var _wordsToremoveArray = ["hardware", "service", "services", "support", "education", "software", "networks", "license"];
            _wordsToremoveArray = _.map(_wordsToremoveArray, function(item){
                return " " + item.trim(); 
            })

            var regexString = _wordsToremoveArray.join("|");
            var regex = new RegExp(regexString + "\s*$", "g");
            
            var _list = _.uniq(_.map(list, function(item){
                return item.replace(regex, "")
            }))
            return _list;
        }

        (function init() {
            promotionsService.getPromotions();
            getCustomers();
        })();

		return promotionsService;
	}

})();
