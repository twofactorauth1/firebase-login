'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'userService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll', '$sce', 'PostService', 'PaymentService',
    function ($scope, pagesService, websiteService, postsService, userService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll, $sce, PostService, PaymentService) {
        var account, theme, website, pages, teaserposts, route, postname, that = this;

        route = $location.$$path;
        window.oldScope;
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;
        $scope.$url=$location.$$url;

        //var config = angular.module('config');
        //that.segmentIOWriteKey = ENV.segmentKey;
        //$window.segmentIOWriteKey = ENV.segmentKey;
        //that.themeUrl = $scope.themeUrl;

        // $scope.activateSettings = function() {
        //     console.log('>>>>> ', window.parent);
        //     window.parent.frames[0].parentNode.activateSettings();
        // };

        if(!window.oldScope)
            window.oldScope = $scope;
        $scope.sortingLog = [];

        $scope.wait;

        $scope.sortableOptions = {
            handle: '.reorder',
            start: function(e, ui) {
                console.log('ui >>> ', ui);
                ui.item[0].parentNode.className += ' active';
                ui.item[0].className += ' dragging';
                clearTimeout($scope.wait);
                ui.placeholder.height('60px');
                // ui.item.sortable('refreshPositions');
                angular.element(ui.item[0].parentNode).sortable( "refresh" );
            },
            update: function(e, ui) {
              console.log('sorting update');
            },
            stop: function(e, ui) {
                ui.item[0].classList.remove('dragging');
                $scope.wait = setTimeout(function () {
                    ui.item[0].parentNode.classList.remove('active');
                }, 1500);
                // var componentId = ui.item[0].querySelectorAll('.component')[0].attributes['data-id'].value;
                // var newOrder = ui.item.index();
            }
        };

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                that.account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_indimain.html';

            }
        });

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                if ($scope.$location.$$path === '/' || $scope.$location.$$path === '') {
                     route = 'index';
                     route = route.replace('/', '');
                     that.pages = data[route];
                     console.log('that.pages >>> ', that.pages);
                } else {
                    route = $scope.$location.$$path.replace('/page/', '');
                    console.log('route ', route);
                    that.pages = data[route];
                }
                $scope.currentpage = that.pages;

                PostService.getAllPosts(function (posts){
                    that.blogposts = posts;
                });
            }
        });

        websiteService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
            }
        });

        postsService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:postsService Error: ' + err);
            } else {
                if (that.teaserposts) {
                    //donothing
                } else {
                    if (route === '/' || route === '') {
                        that.teaserposts = data;
                    }
                }
            }
        });

        window.updateComponents = function(data) {
            $scope.$apply(function() {
                $scope.currentpage.components = data;
                for (var i = 0; i < $scope.currentpage.components.length; i++) {
                    if($scope.currentpage.components[i].type == 'navigation')  {
                        var body = document.getElementsByTagName('body')[0];
                        body.className = body.className.replace('navbar-v', '');
                        body.className = body.className + ' navbar-v'+ $scope.currentpage.components[i].version;
                    }
                };
            });
        };

        window.triggerEditMode = function() {
            var body = document.getElementsByTagName('body')[0];
            var hasClass = body.classList.contains('editing');
            if(hasClass === false) { body.className+=' editing'; }

            var toolbar = body.querySelectorAll('.btn-toolbar')[0];
            if(toolbar.classList.contains('editing') === false) { toolbar.className+=' editing'; }
            window.oldScope.isEditing = true;

            window.oldScope.$digest();
        };

        window.triggerEditModeOff = function() {
            var body = document.getElementsByTagName('body')[0];
            body.className = body.className.replace( /(?:^|\s)editing(?!\S)/ , '' );

            var toolbar = body.querySelectorAll('.btn-toolbar')[0];
            toolbar.className = toolbar.className.replace( /(?:^|\s)editing(?!\S)/ , '' );
           console.log(window.oldScope);
            window.oldScope.isEditing = false;
            window.oldScope.$digest();
        };

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        $scope.config = {
            width: 740,
            height: 380,
            autoHide: true,
            autoPlay: false,
            autoHideTime: 1500,
            responsive: false,
            theme: {
              url: "../../js/libs/videogular-themes-default/videogular.css",
              playIcon: "&#xe000;",
              pauseIcon: "&#xe001;",
              volumeLevel3Icon: "&#xe002;",
              volumeLevel2Icon: "&#xe003;",
              volumeLevel1Icon: "&#xe004;",
              volumeLevel0Icon: "&#xe005;",
              muteIcon: "&#xe006;",
              enterFullScreenIcon: "&#xe007;",
              exitFullScreenIcon: "&#xe008;"
            }
        }

        // $scope.$on('$locationChangeStart', function(event, next, current) {
        //     console.log('location changed '+event+' '+next+' '+current);
        //     $scope.currentLoc = next.replace("?editor=true", "").substr(next.lastIndexOf('/') + 1);
        //     // parent.document.getUpdatediFrameRoute($scope.currentLoc);
        // });

        // window.scrollTo = function(section) {
        //     console.log('>>> ', section);
        //     if(section) {
        //         $location.hash(section);
        //         $anchorScroll();

        //         //TODO scrollTo on click

        //         // var offset = 0;
        //         // var duration = 2000;
        //         // var someElement = angular.element(document.getElementById(section));
        //         // console.log('someElement >>>', document);
        //         // console.log('>>> scrollTo '+ document.body.getElementById(section));
        //         // $document.scrollToElementAnimated(someElement);
        //     }
        // };

        window.activateAloha = function() {
            aloha.dom.query('.editable', document).forEach(aloha);
        };

        window.deactivateAloha = function() {
           aloha.dom.query('.editable', document).forEach(aloha.mahalo);
        };

        window.updateWebsite = function(data) {
            that.account.website = data;
            // $scope.$apply(function() {
            //     $scope.primaryColor = data.settings.primary_color;
            //     $scope.primaryHighlight = data.settings.primary_highlight;
            //     $scope.secondaryColor = data.settings.secondary_color;
            //     $scope.navHover = data.settings.nav_hover;
            //     $scope.primaryTextColor = data.settings.primary_text_color;
            //     $scope.fontFamily = data.settings.font_family;
            //     $scope.fontFamily2 = data.settings.font_family_2;
            // });
        };

        $scope.createPost = function(postData) {


            //            var data = {
            //                _id: $scope.website._id,
            //                accountId: $scope.website.accountId,
            //                settings: $scope.website.settings
            //            };
            PostService.createPost($scope.currentpage._id,postData, function(data) {
            });
        };

        $scope.deletePost = function(postId) {
            PostService.deletePost($scope.currentpage._id, postId, function(data) {

            });
        };

        $scope.resfeshIframe = function() {
            //document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
        };

        //SIGNUP SECTION

        $scope.createUser = function(user) {
            console.log('user', user);

            //create contact
            userService.addContact(user, function (data) {
               console.log('data ', data);
            });

            //redirect to signup with details
            window.location.href = "http://app.indigenous.local:3000/signup";
        };

        /*
            {
                "_id": null,
                "company": {
                    "name": "",
                    "type": 0,
                    "size": 0,
                    "logo": ""
                },
                "subdomain": "",
                "domain": "",
                "token": "b3729701-bbce-435d-b60d-7e1a9c46ff07",
                "website": {
                    "settings": null,
                    "websiteId": null,
                    "themeId": "default"
                },
                "business": {
                    "logo": "",
                    "name": "",
                    "description": "",
                    "category": "",
                    "size": "",
                    "phones": [],
                    "addresses": [],
                    "type": ""
                },
                "billing": {
                    "userId": "",
                    "customerId": "",
                    "cardToken": ""
                },
                "_v": "0.1",
                "accountUrl": "http://.indigenous.local:3000"
            }
        */

        $scope.createAccount = function(newAccount) {
            newAccount.card = {
                number: $('#cc_number').val(),
                cvc: $('#cc_cvc').val(),
                exp_month: $('#cc_exp_month').val(),
                exp_year: $('#cc_exp_year').val()
              };
            console.log('newAccount', newAccount);
            userService.getTmpAccount( function (data) {
                var tmpAccount = data;
               console.log('createAccount ', data);
               tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@","");
               userService.saveOrUpdateTmpAccount(tmpAccount,  function (data) {
                    console.log('saveOrUpdateTmpAccount', data);
                    //username, password, email, accountToken
                    var newUser = {
                        username: newAccount.email,
                        password: newAccount.password,
                        email: newAccount.email,
                        accountToken: data.token
                    };
                    console.log('newUser Data >>> ', newUser);
                    userService.createUser(newUser, function (data) {
                        var newUser = data;
                        console.log('newUser', newUser);
                        PaymentService.getStripeCardToken(newAccount.card, function(token) {
                            console.log('newUser.accounts[0].accountId >>> ', newUser.accounts[0].accountId);
                              PaymentService.postStripeCustomer(token, newUser, newUser.accounts[0].accountId, function(stripeUser) {
                                console.log('stripuser >>> ', stripeUser);
                                console.log('stripuser ID >>> ', stripeUser.id);
                                PaymentService.putCustomerCard(stripeUser.id, token, function (card) {});
                                userService.postAccountBilling(stripeUser.id, token, function(billing) {});
                                console.log('successfully added card ', card);
                                // PaymentService.postCreateStripeSubscription(stripeUser.id, $scope.selectedPlan, function(subscription) {
                                //     window.location.replace(adminUrl);
                                // });
                              });
                        });
                    });
                });
            });
        };

        $scope.newAccount = {};

        $scope.checkDomainExists = function(newAccount) {
            console.log('checking to see if the domiain exists ', newAccount.businessName);
            var name = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@","");
            userService.checkDomainExists(name, function (data) {
               if(data != 'true') {
                    $("#business-name .error").html("Domain Already Exists");
                    $("#business-name").addClass('has-error');
                    $("#business-name .glyphicon").addClass('glyphicon-remove');
                } else {
                    $("#business-name .error").html("");
                    $("#business-name").removeClass('has-error').addClass('has-success');
                    $("#business-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            });
        };

        $scope.checkEmailExists = function(newAccount) {
            console.log('checking to see if the username exists ', newAccount.email);
            userService.checkEmailExists(newAccount.email, function (data) {
               if(data === 'true') {
                    // $("#input-company-name").val('');
                    $("#email .error").html("Email Already Exists");
                    $("#email").addClass('has-error');
                    $("#email .glyphicon").addClass('glyphicon-remove');
                } else {
                    console.log('email avaliable');
                    $("#email .error").html("");
                    $("#email").removeClass('has-error').addClass('has-success');
                    $("#email .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            });
        };

        $scope.checkPasswordLength = function(newAccount) {
            console.log('checking to see if the password exists ', newAccount.password);

               if(newAccount.password.length < 5) {
                    // $("#input-company-name").val('');
                    $("#password .error").html("Password must contain at least 5 characters");
                    $("#password").addClass('has-error');
                    $("#password .glyphicon").addClass('glyphicon-remove');
                } else {
                    $("#password .error").html("");
                    $("#password").removeClass('has-error').addClass('has-success');
                    $("#password .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
        };


    }]);
