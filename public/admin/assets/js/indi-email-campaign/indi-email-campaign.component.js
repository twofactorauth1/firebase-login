(function () {

    app.directive('indiEmailCampaign', indiEmailCampaign);

    function indiEmailCampaign() {

        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'assets/js/indi-email-campaign/indi-email-campaign.component.html',
            controller: 'EmailCampaignController',
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs, ctrl) {
                ctrl.init(element);
            }
        };

    }

})();