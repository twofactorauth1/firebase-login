(function(){

app.directive('emailActionButtons', emailActionButtons);

function emailActionButtons() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            saveAction: '&',
            cancelAction: '&',
            createCampaignAction: '&',
            sendEmailAction: '&',
            settingsValidAction: '&'
        },
        templateUrl: 'assets/js/indi-email-builder/email-controls/email-action-buttons/email-action-buttons.component.html',
        controller: 'EmailBuilderActionButtonsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
