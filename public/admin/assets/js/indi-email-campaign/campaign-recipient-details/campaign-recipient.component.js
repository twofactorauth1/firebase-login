(function(){

app.directive('campaignRecipientDetailsComponent', campaignRecipientDetailsComponent);
/* @ngInject */
function campaignRecipientDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/js/indi-email-campaign/campaign-recipient-details/campaign-recipient.component.html',
        controller: 'CampaignRecipientDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
