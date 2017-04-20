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
        var baseBroadcastMessagesAPIUrl = '/api/2.0/insights/messages/';

        messageService.loading = { value:0 };
        
        messageService.listBroadcastMessages = listBroadcastMessages;
        
        messageService.createMessage = createMessage;
        messageService.updateMessage = updateMessage;
        messageService.deleteMessage = deleteMessage;

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
                if(messageService.messages.length){
                    messageService.message = messageService.messages[0];
                }
                else{
                    messageService.message = {};
                }
            }

            function error(error) {
                console.error('messageService listBroadcastMessages error: ', JSON.stringify(error));
            }

            return messageRequest($http.get(baseBroadcastMessagesAPIUrl).success(success).error(error));

        }
        
        
        function createMessage(message) {

            return (
                messageRequest($http({
                  url: baseBroadcastMessagesAPIUrl,
                  method: 'POST',
                  data: angular.toJson(message)
                }).success(success).error(error))
            );

            function success(data) {
                console.log('BroadcastMessagesService requested message created');
                var index = _.findIndex(messageService.messages, {
                    _id: data._id
                });

                if (index > -1) {
                    messageService.messages[index] = data;
                } else {
                    messageService.messages.push(data);
                }
                if(messageService.messages.length){
                    messageService.message = messageService.messages[0]
                }
            }

            function error(error) {
                console.error('BroadcastMessagesService message creation error: ', JSON.stringify(error));
            }

        }


        function updateMessage(message, _id) {

            return (
                messageRequest($http({
                  url: baseBroadcastMessagesAPIUrl + _id,
                  method: 'POST',
                  data: angular.toJson(message)
                }).success(success).error(error))
            );

            function success(data) {
                console.log('BroadcastMessagesService requested message created');
                var index = _.findIndex(messageService.messages, {
                    _id: data._id
                });

                if (index > -1) {
                    messageService.messages[index] = data;
                } else {
                    messageService.messages.push(data);
                }
                if(messageService.messages.length){
                    messageService.message = messageService.messages[0];
                }
            }

            function error(error) {
                console.error('BroadcastMessagesService message creation error: ', JSON.stringify(error));
            }

        }

        function deleteMessage(message) {
            function success(data) {
                console.log('BroadcastMessagesService requested message deleted');
                var index = _.findIndex(messageService.messages, {
                    _id: message._id
                });

                if (index > -1 && messageService.messages.length) {
                    messageService.messages.splice(index, 1);
                    messageService.message = {};
                }
                
            }

            function error(error) {
                console.error('BroadcastMessagesService message delete error: ', JSON.stringify(error));
            }

            return (
                messageRequest($http({
                    url: baseBroadcastMessagesAPIUrl + message._id,
                    method: 'DELETE'
                }).success(success).error(error))
            )
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
