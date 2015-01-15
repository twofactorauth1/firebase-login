define(['app', 'userService', 'powertour'], function(app) {
    app.register.controller('IndiCtrl', ['$scope', 'UserService', function($scope, UserService) {
    	$scope.startTask = function(section, task) {
    		console.log('starting task >>> ', task);
    		if (section && task) {
    			window.location = '/admin#/'+section+'?onboarding='+task
    		};
    	};

        $scope.initialWelcome = true;

        $scope.topics = [
            {
                "title" : "Can I use my own domain name?",
                "text" : "Yes! If you already have a domain registered you can point your domain to the Indigenous Servers."
            },
            {
                "title" : "Do I need a designer to change my website?",
                "text" : "Not at all. Choose from one of our many professionally designed templates and use the graphical user interface to modify and edit the details of the site."
            }
        ];

    	$scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.indi_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.activeTab = preferences.indi_default_tab || 'getting-started';
            $scope.initialWelcome = preferences.welcome_alert.initial;
        });

        $scope.savePreferencesFn = function() {
            UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        };

        $scope.clearWelcome = function() {
        	$scope.initialWelcome = true;
        	if ($scope.userPreferences) {
                $scope.userPreferences.welcome_alert.initial = true;
                $scope.savePreferencesFn();
            }
        };

        $('body').powerTour({
            tours : [
                {
                        trigger            : '',
                        startWith          : 1,
                        easyCancel         : false,
                        escKeyCancel       : false,
                        scrollHorizontal   : false,
                        keyboardNavigation : true,
                        loopTour           : false,
                        onStartTour        : function(ui){ },
                        onEndTour          : function(){

                            // animate back to the top
                            $('html, body').animate({scrollTop:0}, 1000, 'swing');  
                            //$('html, body').animate({scrollLeft:0}, 1000, 'swing');   
                        },
                        onProgress : function(ui){ },
                        steps:[
                                {
                                    hookTo          : '',//not needed
                                    content         : '#step-1',
                                    width           : 400,
                                    position        : 'sc',
                                    offsetY         : 0,
                                    offsetX         : 0,
                                    fxIn            : 'fadeIn',
                                    fxOut           : 'bounceOutUp',
                                    showStepDelay   : 500,
                                    center          : 'step',
                                    scrollSpeed     : 400,
                                    scrollEasing    : 'swing',
                                    scrollDelay     : 0,
                                    timer           : '00:00',
                                    highlight       : true,
                                    keepHighlighted : true,
                                    onShowStep      : function(ui){ },
                                    onHideStep      : function(ui){ }
                                },
                                {
                                    hookTo          : '',//not needed
                                    content         : '#step-2',
                                    width           : 400,
                                    position        : 'sc',
                                    offsetY         : 0,
                                    offsetX         : 0,
                                    fxIn            : 'fadeIn',
                                    fxOut           : 'bounceOutLeft',
                                    showStepDelay   : 1000,
                                    center          : 'step',
                                    scrollSpeed     : 400,
                                    scrollEasing    : 'swing',
                                    scrollDelay     : 0,
                                    timer           : '00:00',
                                    highlight       : true,
                                    keepHighlighted : true,
                                    onShowStep      : function(ui){ },
                                    onHideStep      : function(ui){ }
                                },
                                {
                                    hookTo          : '',//not needed
                                    content         : '#step-3',
                                    width           : 400,
                                    position        : 'sc',
                                    offsetY         : 0,
                                    offsetX         : 0,
                                    fxIn            : 'fadeIn',
                                    fxOut           : 'bounceOutRight',
                                    showStepDelay   : 1000,
                                    center          : 'step',
                                    scrollSpeed     : 400,
                                    scrollEasing    : 'swing',
                                    scrollDelay     : 0,
                                    timer           : '00:00',
                                    highlight       : true,
                                    keepHighlighted : true,
                                    onShowStep      : function(ui){ },
                                    onHideStep      : function(ui){ }
                                }
                        ],
                        stepDefaults:[
                                {
                                    width           : 500,
                                    position        : 'tr',
                                    offsetY         : 0,
                                    offsetX         : 0,
                                    fxIn            : '',
                                    fxOut           : '',
                                    showStepDelay   : 0,
                                    center          : 'step',
                                    scrollSpeed     : 200,
                                    scrollEasing    : 'swing',
                                    scrollDelay     : 0,
                                    timer           : '00:00',
                                    highlight       : true,
                                    keepHighlighted : false,
                                    onShowStep      : function(){ },
                                    onHideStep      : function(){
                                        $scope.userPreferences.welcome_alert.initial = true;
                                        $scope.savePreferencesFn();
                                    }
                                }
                        ]
                    }
                ]
        });

        $scope.$watch('initialWelcome', function(newValue, oldValue) {
            if (!$scope.initialWelcome) {
                $('body').powerTour('run',0);
            }
        });

  }]);
});
