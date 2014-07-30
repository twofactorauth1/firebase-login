angular.module('app.directives').directive('videoPlayer', function () {
    return {
        scope: {
            video: "=",
            courseDetails: '='
        },
        controller: function ($scope, $sce, $http, $window, host) {
            $scope.embedurl = "http://www.youtube.com/embed/" + $scope.video.videoId + "?autoplay=0&theme=light&color=white&iv_load_policy=3";
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            }
            $scope.onPreviewImageClick = function () {
                var details = { courseId: $scope.courseDetails.courseId};

                var handler = StripeCheckout.configure({
                    key: 'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
                    image: '/img/payment.jpg',
                    token: function (token, args) {
                        $http.post(host + "payment/stripe", {stripeToken: token, details: details}).success(function (data) {
                            if (data.success) {
                                alert("Payment successfull");
                                $window.location.reload();
                            } else {
                                alert(data.error);
                            }
                        }).error(function (data) {
                            alert("Some error happened.");
                        });
                    }
                });


                // Open Checkout with further options
                handler.open({
                    name: 'Purchase course: ' + $scope.courseDetails.title,
                    description: $scope.courseDetails.description,
                    amount: $scope.courseDetails.price * 100,
                    currency: 'usd'
                });
            }
        },
        replace: true,
        restrict: 'A',
        templateUrl: '/views/directives/videoPlayerVG.html'
    }
});
