(function(){

app.controller('ContactActivityController', contactActivityController);

contactActivityController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService'];
/* @ngInject */
function contactActivityController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService) {

    console.info('contact-activity directive init...')

    var vm = this;
    vm.state = {
        activityFilter:{
            type: 'all',
            sort: 'asc'
        }
    };
    vm.uiState= {
        loading: true
    }
    vm.getTimelineIcons = getTimelineIcons;

    vm.init = init; 
    function getTimelineIcons(activityType, isIcon){
        var iconClass = ""
        switch (activityType) {
            case 'EMAIL':
            case 'EMAIL_DELIVERED':
            case 'EMAIL_OPENED':
            case 'EMAIL_CLICKED':
            case 'EMAIL_UNSUB':
            case 'EMAIL_BOUNCED':
                if(isIcon)
                    iconClass = "envelope-o"
                else{
                    iconClass = "email-type"
                }
                break;
            case 'PAGE_VIEW':
                if(isIcon)
                    iconClass = "eye"
                else{
                    iconClass = "page-type"
                }
                break;
            case 'CONTACT_CREATED':
            case 'CONTACT_FORM':
            case 'FORM_SUBMISSION':
                if(isIcon)
                    iconClass = "list-alt"
                else{
                    iconClass = "form-type"
                }
                break;
            case 'CREATE_PAYPAL_ORDER':
            case 'CREATE_ORDER':
                if(isIcon)
                    iconClass = "shopping-cart"
                else{
                    iconClass = "order-type"
                }
                break;        
            default:
                iconClass = ""
                if(isIcon)
                    iconClass = "sticky-note-o"
        }
        return iconClass
    };
    function init(element) {
        vm.element = element;        
        ContactService.getContactActivities(vm.contactId, function(activities) {
            ContactService.getContact(vm.contactId, function (contact) {  
                activities = _.filter(activities, function(activity){
                    return activity.activityType != "PAGE_VIEW"
                })
                _.each(activities, function(activity){
                    activity.activityDate = $filter('date')(activity.start, "MMMM dd, yyyy")
                })

                vm.state.activities = _.groupBy(activities, function(activity){ 
                    return activity.activityDate; 
                });

                vm.state.contact = contact;
                vm.uiState.loading = false;
            })
        });
    }

}

})();
