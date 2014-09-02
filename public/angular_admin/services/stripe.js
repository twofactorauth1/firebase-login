define(['app', 'stripe'], function (app) {
	app.service('StripeService', function ($http) {
		Stripe.setPublishableKey('pk_test_EuZhZHVourE3RaRxELJaYEya');
		this.getStripeCardToken = function (cardInput, fn) {
			Stripe.card.createToken(cardInput, function (status, response) {
				fn(response.id);
			});
		};
	});
});
