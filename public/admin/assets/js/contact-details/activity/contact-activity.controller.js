(function(){

app.controller('ContactActivityController', contactActivityController);

contactActivityController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService', 'contactConstant'];
/* @ngInject */
function contactActivityController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService, contactConstant) {

    console.info('contact-activity directive init...')

    var vm = this;
    vm.state = {
        activityFilter:{
            type: 'all',
            sort: 'desc'
        },
        contactConstant: contactConstant
    };
    vm.state.contactConstant.contact_activity_types.dp.push({
        data: 'all',
        label : 'All'
    });
    vm.uiState= {
        loading: true
    }
    vm.getTimelineIcons = getTimelineIcons;
    vm.filterContactActivities = filterContactActivities;
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

                vm.state.activities = activities

                filterContactActivities();

                vm.state.contact = contact;
                vm.uiState.loading = false;
            })
        });
    }

    function filterContactActivities(){
        var activities = angular.copy(vm.state.activities);
        if(vm.state.activityFilter.type !== 'all'){
            activities = _.filter(vm.state.activities, function(activity){
                return activity.activityType === vm.state.activityFilter.type
            })
        }
        vm.state.filteredActivities = activities;
        getGroupedActivities(activities);
    }

    function getGroupedActivities(activities){        
        var groupedActivities = _.groupBy(activities, 'activityDate');
        vm.state.groupedActivities = _.sortBy(groupedActivities, function(value, key){
            return vm.state.activityFilter.sort === "asc" ? Date.parse(key) : -Date.parse(key);
        })
    }

}

})();
