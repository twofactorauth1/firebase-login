(function(){

app.controller('AnonymousContactActivityController', anonymousContactActivityController);

anonymousContactActivityController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService', 'contactConstant', 'TrafficService'];
/* @ngInject */
function anonymousContactActivityController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService, contactConstant, TrafficService) {

    console.info('anonymous-activity directive init...')

    var vm = this;
    vm.state = {
        activityFilter:{
            type: 'all',
            sort: 'desc'
        },
        contactConstant: angular.copy(contactConstant)
    };
    vm.state.contactConstant.contact_activity_types.dp.push({
        data: 'USER_NOTES',
        label: 'User Notes'
    },{
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
    vm.getSessionIcon = getSessionIcon;
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
                    iconClass = "address-card-o"
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
        return iconClass;
    };

    function init(element) {
        vm.element = element;
        TrafficService.getFingerprintSessionActivities(vm.fingerprintId).then(function(activities) {            
            iterateActivities(activities);
        });
    };

    function iterateActivities(activities){
        _.each(activities, function(activity){
            activity.activityDate = $filter('date')(activity.start, "MMMM dd, yyyy");
        });
        vm.state.activities = activities;
        filterContactActivities();
        //setContactDeviceDetails();
        //setContactAttributionDetails();
        //setContactSessionDetails();
        vm.uiState.loading = false;
    }

    function filterContactActivities(){
        var activities = angular.copy(vm.state.activities);
        if(vm.state.activityFilter.type !== 'all'){
            activities = _.filter(vm.state.activities, function(activity){
                return activity.activityType === vm.state.activityFilter.type
            })
        }
        if(vm.state.dateFilter){
            activities = _.filter(activities, function(activity){
                return $filter('date')(activity.activityDate, "MMMM dd, yyyy") === $filter('date')(vm.state.dateFilter, "MMMM dd, yyyy")
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
            note.user = {
                _id: $scope.$parent.currentUser._id,
                username: $scope.$parent.currentUser.username,
                first: $scope.$parent.currentUser.first,
                last: $scope.$parent.currentUser.last,
                user_profile_photo: $scope.$parent.currentUser.profilePhotos && $scope.$parent.currentUser.profilePhotos[0] ? $scope.$parent.currentUser.profilePhotos[0] : {}
            }
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

    $scope.$watch("vm.state.dateFilter", function(_date){
        if(angular.isDefined(_date) && vm.state.activities && vm.state.activities.length){
            filterContactActivities();
        }
    })

    function getUserName() {
        var _userName = $scope.$parent.currentUser.email;
        if ($scope.$parent.currentUser.first || $scope.$parent.currentUser.last) {
            _userName = $scope.$parent.currentUser.first + " " + $scope.$parent.currentUser.last;
        }
        return _userName.trim();
    };

    function getSessionIcon(activity){
       session_activity = _.find(activity, function(id){return id.session_event && id.session_event._id});
       if(session_activity){
         if(session_activity.session_event && session_activity.session_event.user_agent && session_activity.session_event.user_agent.device){
            return "fa fa-" + session_activity.session_event.user_agent.device;
         }
       }
    };

    function setContactDeviceDetails(){
        if(vm.contactDeviceDetails && vm.state.activities.length){
            var session_activity = _.find(vm.state.activities, function(id){return id.session_event && id.session_event._id});
            if(session_activity){
                if(session_activity.session_event && session_activity.session_event.user_agent){
                    $timeout(function() {
                        vm.contactDeviceDetails = session_activity.session_event;
                    }, 0);
                }
            } 
        }
    }

    function setContactAttributionDetails(){
        if(vm.contactAttributionDetails && vm.state.activities.length){            
            vm.contactAttributionDetails = _.filter(vm.state.activities, function(activity){
                return activity.extraFields && 
                checkIfAttributionActivity(activity.extraFields)
            })
        }
    }

    function checkIfAttributionActivity(fields){
        return _.find(Object.keys(fields), function(k){
            return k.indexOf("utm_") === 0
        })
    }

    function setContactSessionDetails(){
        if(vm.contactSessionDetails && vm.state.activities.length){
            var session_activities = _.filter(vm.state.activities, function(id){
                return id.session_event && id.session_event._id
            });
            if(session_activities && session_activities.length){
                vm.contactSessionDetails.sessionsCount = session_activities.length;
                var _time = 0;
                _.each(session_activities, function(activity){
                    if(activity.session_event.timeDifference){
                        _time += activity.session_event.timeDifference;
                    }
                    else if(activity.session_event.session_length){
                        _time += Math.round(activity.session_event.session_length);
                    }
                })
                if(_time > 0){
                    var sec = Math.floor((_time / 1000) % 60);
                    vm.contactSessionDetails.sessionsDuration = Math.floor(_time / 60000)+(sec<10?":0"+sec:":"+sec);
                }
            }

            var pageViewActivity = _.find(vm.state.activities, function(id){
                return id.activityType && id.activityType === 'PAGE_VIEW'
            });

            if(pageViewActivity){
                if(pageViewActivity && pageViewActivity.page_events && pageViewActivity.page_events.length){
                    vm.contactSessionDetails.pageView = pageViewActivity.page_events.length;                    
                }
            }
        }
    }
}

})();