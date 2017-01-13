'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('BroadcastMessagesService', BroadcastMessagesService);

	BroadcastMessagesService.$inject = ['$http', '$q', '$timeout', 'AccountService'];
	/* @ngInject */
	function BroadcastMessagesService($http, $q, $timeout, AccountService) {

        var messageService = {
        };
        
        var baseAccountAPIUrl = '/api/1.0/account/';
        var baseBroadcastMessagesAPIUrl = '/api/2.0/insights/messages';

        messageService.loading = { value:0 };
        
        messageService.listBroadcastMessages = listBroadcastMessages;


		function messageRequest(fn) {
            messageService.loading.value = messageService.loading.value + 1;
            // console.info('dashService | loading +1 : ' + messageService.loading.value);
            fn.finally(function() {
                messageService.loading.value = messageService.loading.value - 1;
                // console.info('dashService | loading -1 : ' + messageService.loading.value);
            });
            return fn;
		}

        function listBroadcastMessages() {

            function success(data) {
                console.log('messageService listBroadcastMessages: ', JSON.stringify(data));
                messageService.messages = data;
            }

            function error(error) {
                console.error('messageService listBroadcastMessages error: ', JSON.stringify(error));
            }

            return messageRequest($http.get(baseBroadcastMessagesAPIUrl).success(success).error(error));

        }

		(function init() {
            AccountService.getAccount(function(data) {
                messageService.account = data;
                messageService.listBroadcastMessages();
            })
            
		})();


		return messageService;
	}

})();
