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
    };
    vm.notesEmail = {
        enable: false
    };
    vm.getTimelineIcons = getTimelineIcons;
    vm.filterContactActivities = filterContactActivities;
    vm.init = init; 
    vm.addNote = addNote;
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
            case 'USER_NOTES':
                if(isIcon)
                    iconClass = ""
                else{
                    iconClass = "user-notes-type"
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
            //ContactService.getContact(vm.contactId, function (contact) {  
                vm.state.contact = vm.contact;

                activities = _.filter(activities, function(activity){
                    return activity.activityType != "PAGE_VIEW"
                })
                if(vm.state.contact.notes.length){
                    ContactService.getContactNotes(vm.contactId, function(notes){
                        mergeContactNotes(notes, activities);
                    })
                }
                else{
                    iterateActivities(activities);
                }                
                
            //})
        });
    };

    function iterateActivities(activities){
        _.each(activities, function(activity){
            activity.activityDate = $filter('date')(activity.start, "MMMM dd, yyyy")
        });
        vm.state.activities = activities;
        filterContactActivities();
        vm.uiState.loading = false;
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
    };

    function getGroupedActivities(activities){        
        var groupedActivities = _.groupBy(activities, 'activityDate');
        vm.state.groupedActivities = _.sortBy(groupedActivities, function(value, key){
            return vm.state.activityFilter.sort === "asc" ? Date.parse(key) : -Date.parse(key);
        })
    };

    function mergeContactNotes(notes, activities, note){
        if(note){            
            note.start = note.date;
            note.activityType = "USER_NOTES";
            note.user = $scope.$parent.currentUser;
            activities.push(note);
        }       
        else if (notes && notes.length > 0) {
            _.each(notes, function (_note) {
                _note.start = _note.date;
                _note.activityType = "USER_NOTES";
            });
            activities = activities || [];
            activities = activities.concat(notes);
        }
        iterateActivities(activities)
    };

    function addNote(_note) {
        var date = moment(),
            _noteToPush = {
                note: _note,
                user_id: $scope.$parent.currentUser._id,
                date: date.toISOString()
            },
            contactData = {};

        vm.newNote.text = '';
        
        var sendEmail = {};
        
        sendEmail = {
            sendTo: vm.state.contact.details[0].emails[0].email,
            fromEmail: $scope.$parent.currentUser.email,
            fromName: getUserName(),
            note_value: _note,
            enable_note: vm.notesEmail.enable
        };
        contactData = {
            emailData: sendEmail,
            note: _noteToPush,
            sendEmailToContact: vm.notesEmail.enable
        };

        ContactService.addContactNote(contactData, vm.contactId, function (data) {            
            vm.notesEmail = {
                enable: false
            };
            vm.state.contact.notes = data.notes;
            vm.uiState.showNote = false;
            mergeContactNotes(null, vm.state.activities, _noteToPush);
        });
    };

    function getUserName() {
        var _userName = $scope.$parent.currentUser.email;
        if ($scope.$parent.currentUser.first || $scope.$parent.currentUser.last) {
            _userName = $scope.$parent.currentUser.first + " " + $scope.$parent.currentUser.last;
        }
        return _userName.trim();
    }

}

})();
