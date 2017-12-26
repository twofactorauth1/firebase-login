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
    vm.init = init; 

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
