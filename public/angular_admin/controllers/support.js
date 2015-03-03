define(['app', 'userService', 'navigationService', 'powertour', 'toasterService'], function(app) {
    app.register.controller('SupportCtrl', ['$scope', 'UserService', 'NavigationService', 'ToasterService', function($scope, UserService, NavigationService, ToasterService) {
        NavigationService.updateNavigation();
        ToasterService.processPending();
        ToasterService.processHtmlPending();
    	$scope.startTask = function(section, task) {
    		console.log('starting task >>> ', task);
    		if (section && task) {
          if (section == 'website-editor') {
            window.location = '/admin#/'+section+'?pagehandle=index&onboarding='+task
          } else {
    			     window.location = '/admin#/'+section+'?onboarding='+task
          }
    		};
    	};

        $scope.initialWelcome = true;

        $scope.preventClick = function(e) {
          e.preventDefault();
        };

        $scope.topics = [
            {
                "title" : "Can I use my own domain name?",
                "text" : "Yes! No need to go changing all of those business cards! Please send a request via chat or email to info@indigenous.io.",
                "category" : "Website"
            },
            {
                "title" : "Can I use my existing website?",
                "text" : "No. For you to be able to utilize all of the cool integrated features we have, your site needs to be built on the Indigenous platform. However, you can customize our templates to get a feel very similar to your existing website. Or, try something fresh and give your site a makeover. Remember, you can always easily make changes.",
                "category" : "Website"
            },
            {
                "title" : "Will I lose all of my content and blog posts?",
                "text" : "Not at all. You can upload your content and media to use in our templates. We can also move your blog posts over for you; just sent us a request via chat or email to info@indigenous.io.",
                "category" : "Website"
            },
            {
                "title" : "Do I need a designer to make changes to my website?",
                "text" : "Absolutely not. Using our templates and drag-and-drop technology, it’s easy to upload media and restructure the design of your site.",
                "category" : "Website"
            },
            {
                "title" : "How do I select a page template?",
                "text" : "Go to the Website tab, click on “Themes,” and select your template.",
                "category" : "Website"
            },
            {
                "title" : "How do I create a page?",
                "text" : "Go to the Website tab, click “Add” in the top right corner, and select “Page.”",
                "category" : "Website"
            },
            {
                "title" : "Can I create pages without selecting a theme?",
                "text" : "Yes. However, selecting a theme first will help you to create a cohesive site efficiently. If you’re not sure where to begin, use our Getting Started Checklist.",
                "category" : "Website"
            },
            {
                "title" : "How do I create a blog post?",
                "text" : "Go to the Website tab, click “Add” in the top right corner, and select “Post.”",
                "category" : "Website"
            },
            {
                "title" : "How do I add a feature or functionality to my site that’s not offered in the templates?",
                "text" : "We’re working to make sure everything you need is at your fingertips, but if there’s a feature you don’t see, send us a request via chat or email to info@indigenous.io. We like wish lists because we know how to answer them.",
                "category" : "Website"
            },
            {
                "title" : "How do I add a new customer?",
                "text" : "Go to the Customers tab and click “Add” in the top right corner.",
                "category" : "Customers"
            },
            {
                "title" : "Are customers added automatically?",
                "text" : "Yes. When a visitor enters his/her email address on your site, a profile is automatically generated.",
                "category" : "Customers"
            },
            {
                "title" : "Is there a limit to how many customers I can add?",
                "text" : "No. Currently, there is no tiered membership. You can add as many customers as you like.",
                "category" : "Customers"
            },
            {
                "title" : "Can I import/export my existing contact data?",
                "text" : "Yes. You can import your contacts from Facebook, LinkedIn, and Google+). Soon, you will be able to import .csv files. If you need to export files, please send a request via chat or email to info@indigenous.io.",
                "category" : "Customers"
            },
            {
                "title" : "How can I tag customers with labels?",
                "text" : "All customers are automatically tagged as “Lead.” You can then go in and edit that label, which allows for targeted communication and marketing. Soon, you will be able to have multiple labels for each customer.",
                "category" : "Customers"
            },
            {
                "title" : "Can I add variables/fields in customer profiles? ",
                "text" : "Indigenous tracks all of the activities of your customers in their respective profiles, but if there’s additional field that you’d like to see, please send a request via chat or email to info@indigenous.io.",
                "category" : "Customers"
            },
            {
                "title" : "How do I see my customers in a list?",
                "text" : "Go the Customers tab, click on the gear (Settings) icon in the top right corner, and select “List” under Default View.",
                "category" : "Customers"
            },
            {
                "title" : "How do I add products?",
                "text" : "Go to the Commerce tab, click “Add” in the top right corner, and fill in the fields. These products will not be visible on your site until you have added a store page with the products component under the Website tab.",
                "category" : "Commerce"
            },
            {
                "title" : "How do I add a store to my site?",
                "text" : "A store is a page on your site. Go to the Website tab, click “Add” in the top right corner, and select “Page.” Then, select a store template and add the product component. ",
                "category" : "Commerce"
            },
            {
                "title" : "What happens if I add a store before I add products?",
                "text" : "Visitors will see a message saying, “We’re busy getting our products ready. Please come back soon!”",
                "category" : "Commerce"
            },
            {
                "title" : "What kinds of products can I add?",
                "text" : "You can add physical, digital, subscription, and external link products.",
                "category" : "Commerce"
            },
            {
                "title" : "Where can I see my customer orders?",
                "text" : "This feature is coming soon and when complete you will go the Commerce tab and click on “Orders.” You can also see orders in individual customer profile activity feeds and in your dashboard activity feed.",
                "category" : "Commerce"
            },
            {
                "title" : "Where does my money go?",
                "text" : "Straight into your wallet! Commerce is linked to and processed through your Stripe account.",
                "category" : "Commerce"
            },
            {
                "title" : "How do I add my social accounts?",
                "text" : "Go to the Account tab, click on “Integrations,” and easily connect your Facebook, LinkedIn, Twitter, and Google+ accounts.",
                "category" : "Marketing"
            },
            {
                "title" : "How do I track my social media?",
                "text" : "Go to the Marketing tab and click on “Social Feed” to see a collaborative filterable view of your social media activity. ",
                "category" : "Marketing"
            },
            {
                "title" : "How do I post to social media?",
                "text" : "Go to the Marketing tab and click on “Social Feed” to post, like, comment, edit, and delete on multiple sites, all from one place!",
                "category" : "Marketing"
            },
            {
                "title" : "Can I create targeted social media messages?",
                "text" : "You will be able to use the labels and tracked activities in your customer profiles to create targeted social media messages.",
                "category" : "Marketing"
            },
            {
                "title" : "Can I set up automated campaigns?",
                "text" : "Absolutely! You can use our campaign builder under the Marketing tab to enter your own content into smart and modifiable campaign templates. We will soon have more trigger and conditional options that allow you to send communication based on tracked customer activity (e.g. whether a specific email is opened, if no emails are opened for a certain amount of time, etc.).",
                "category" : "Marketing"
            },
            {
                "title" : "How do I know what marketing is working well?",
                "text" : "Go to your Dashboard and click on “Marketing” to see what campaigns and individual posts are generating leads and conversions.",
                "category" : "Marketing"
            },
            {
                "title" : "How do I send out a targeted email?",
                "text" : "Go to the Marketing tab and click on “Campaigns” to filter customers by label.",
                "category" : "Marketing"
            },
            {
                "title" : "How do I know what my customers are doing on my site?",
                "text" : "Go the Dashboard tab and click on “Activity” to see what customers are doing alongside easy-to-read summaries of your site analytics (who’s visiting and how often, etc.).",
                "category" : "Dashboard"
            },
            {
                "title" : "Where can I see my site analytics?",
                "text" : "Go to the Dashboard tab and click on “Site Analytics” to who’s visiting and how often, etc. in easy-to-read graphs and charts.",
                "category" : "Dashboard"
            },
            {
                "title" : "Can I add additional employees?",
                "text" : "Not currently. If you require multiple users on one account, please send your request via chat or email to info@indigenous.io.",
                "category" : "Dashboard"
            },
            {
                "title" : "Can I use Indigenous on my mobile phone or device?",
                "text" : "Absolutely. You have all of the same capabilities on a mobile device that you would have on your computer.",
                "category" : "Dashboard"
            },
            {
                "title" : "Can I rearrange how my dashboard looks?",
                "text" : "Not currently, but if there’s a concern, please let us know via chat or email to info@indigenous.io.",
                "category" : "Dashboard"
            },
            {
                "title" : "Where can I see my past invoices?",
                "text" : "Go to the Account tab and click on “Billing.”",
                "category" : "Account"
            },
            {
                "title" : "Where can I see my past invoices?",
                "text" : "Go to the Account tab and click on “Billing.”",
                "category" : "Account"
            },
            {
                "title" : "What happens if I cancel Indigenous?",
                "text" : "We will store your data for 30 days, and you may request export of your data, but more importantly, please let us know why you’re considering canceling, and how our platform can serve you better.",
                "category" : "Account"
            },
            {
                "title" : "Can I get my money back?",
                "text" : "Your startup fee and monthly payments are non-refundable, but we are committed to making Indigenous work for you, so please send your concerns via chat or email to info@indigenous.io.",
                "category" : "Account"
            },
            {
                "title" : "What is the first thing I should do?",
                "text" : "Enter your basic personal and business information under “Account information.” Then, consult our Getting Started checklist and begin building your business with Indigenous.",
                "category" : "Account"
            },
            {
                "title" : "Where can I change my credit card information?",
                "text" : "Go to the Account tab and click on “Billing.” ",
                "category" : "Account"
            },
            {
                "title" : "What if forget my password?",
                "text" : "Click on “Forgot Your Password?” on the login page to have instructions for setting up a new password sent to your associated email account. If you cannot access that email account, please send a request via email to info@indigenous.io.",
                "category" : "Account"
            },
            {
                "title" : "Where can I get one-on-one support?",
                "text" : "We provide 24/7 live chat support. You can also schedule a one-on-one demo with one of our team members.",
                "category" : "Account"
            }

        ];

    	$scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.support_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.activeTab = preferences.support_default_tab || 'getting-started';
            $scope.initialWelcome = preferences.welcome_alert.initial;
        });

        $scope.savePreferencesFn = function() {
            console.log('saving preferences ', $scope.userPreferences);
            UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        };

        $scope.clearWelcome = function(e) {
          e.preventDefault();
            console.log('clear welcome');
        	$scope.initialWelcome = true;
        	if ($scope.userPreferences) {
                $scope.userPreferences.welcome_alert.initial = true;
                console.log('$scope.userPreferences ', $scope.userPreferences);
                $scope.savePreferencesFn();
            }
        };

        $scope.$watch('initialWelcome', function(newValue, oldValue) {
            console.log('initial welcome change ', newValue);
            if (!$scope.initialWelcome) {
                $('.indi-assistant').powerTour({
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
                                    console.log('tour ended');
                                    // animate back to the top
                                    $('html, body').animate({scrollTop:0}, 1000, 'swing');
                                    //$('html, body').animate({scrollLeft:0}, 1000, 'swing');
                                    $scope.userPreferences.welcome_alert.initial = true;
                                    $scope.savePreferencesFn();
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
                                            }
                                        }
                                ]
                            }
                        ]
                });
                $('.indi-assistant').powerTour('run',0);
            }
        });

  }]);
});
