'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SecurematicsParticipantsService', SecurematicsParticipantsService);

	SecurematicsParticipantsService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function SecurematicsParticipantsService($http, $q, $timeout) {

        var participantService = {
            
        };

        var baseParticipantAPIUrl = '/api/1.0/integrations/zi/promotions';
        

        participantService.loading = {value: 0};

        participantService.getParticipants = getParticipants;        

        function participantRequest(fn) {
            participantService.loading.value = participantService.loading.value + 1;
            console.info('service | loading +1 : ' + participantService.loading.value);
            fn.finally(function () {
                participantService.loading.value = participantService.loading.value - 1;
                console.info('service | loading -1 : ' + participantService.loading.value);
            });
            return fn;
        }

        /**
            * Get list of all participants
        */
        function getParticipants(pagingParams) {
            var urlParts = [baseParticipantAPIUrl];
            function success(data) {
                participantService.participants = data;
            }

            function error(error) {
                console.error('participantService getParticipants error: ', JSON.stringify(error));
            }

            var _qString = "?limit="+pagingParams.limit+"&skip="+ pagingParams.skip;

            if(pagingParams.sortBy){
                _qString += "&sortBy=" + pagingParams.sortBy + "&sortDir=" + pagingParams.sortDir;
            }
            
            else if(pagingParams.globalSearch){
                _qString += "&term=" + encodeURIComponent(pagingParams.globalSearch);
                
            }
            urlParts.push('participants/search');
            return (
                participantRequest($http({
                  url: urlParts.join('/') + _qString,
                  method: "GET"
                }).success(success).error(error))
            );

        }
		(function init() {
            
           
		})();


		return participantService;
	}

})();
