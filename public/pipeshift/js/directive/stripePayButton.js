angular.module('app.directives').directive('stripePayButton', ['$http', function ($http) {
    return {
        restrict: "E",
        scope: {label: '@'},
        template: "<button class='btn btn-primary'>{{label}}</button>",
        link: function (scope, element, attrs) {
            var detail = { amount: 0, description: "", currency: "usd"};

            var handler = StripeCheckout.configure({
                key: 'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
                image: '/img/payment.jpg',
                token: function (token, args) {
                    $http.post("payment/stripe", {stripeToken: token, stripeEmail: detail}).success(function (data) {
                        if (data.success) {
                            alert("Payment successfull");
                        } else {
                            alert(data.error);
                        }
                    }).error(function (data) {
                        alert("Some error happened.");
                    });
                }
            });

            element.on('click', function (e) {
                // Open Checkout with further options
                handler.open({
                    name: 'Premium account',
                    description: 'Nicer description ($50.00)',
                    amount: 5000,
                    currency: 'usd'
                });

                detail.description = 'Product/Service desc goes here';
                detail.amount = 5000; // this is needed so it can be processed in the payment

                e.preventDefault();
            });
        }
    };
}]);