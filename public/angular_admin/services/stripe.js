define(['app', 'stripe'], function (app) {
	app.service('StripeService', function ($http) {
		Stripe.setPublishableKey('pk_test_EuZhZHVourE3RaRxELJaYEya');
		this.getStripeCardToken = function (fn) {
			Stripe.card.createToken({
  				number: $('.card-number').val(),
  				cvc: $('.card-cvc').val(),
  			   	exp_month: $('.card-expiry-month').val(),
  				exp_year: $('.card-expiry-year').val()
			}, function (status, response) {
				console.log(status, response);
			});
		};
	});
});
