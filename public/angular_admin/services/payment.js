define(['app', 'stripe'], function (app) {
	app.service('PaymentService', function ($http) {
		var baseUrl = '/api/1.0/';
		Stripe.setPublishableKey('pk_test_EuZhZHVourE3RaRxELJaYEya');
		
		this.getStripeCardToken = function (cardInput, fn) {
			Stripe.card.createToken(cardInput, function (status, response) {
				fn(response.id);
			});
		};
		
		this.postStripeCustomer = function (cardToken, fn) {
			var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
			$http.post(apiUrl, {cardToken: cardToken})
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};
		
	});
});
