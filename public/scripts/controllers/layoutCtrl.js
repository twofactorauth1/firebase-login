'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'userService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll', '$sce', 'postService', 'paymentService', 'productService',
    function($scope, pagesService, websiteService, postsService, userService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll, $sce, PostService, PaymentService, ProductService) {
        var account, theme, website, pages, teaserposts, route, postname, products, that = this;

        route = $location.$$path;
        window.oldScope;
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;
        $scope.$url = $location.$$url;

        //var config = angular.module('config');
        //that.segmentIOWriteKey = ENV.segmentKey;
        //$window.segmentIOWriteKey = ENV.segmentKey;
        //that.themeUrl = $scope.themeUrl;

        // $scope.activateSettings = function() {
        //     console.log('>>>>> ', window.parent);
        //     window.parent.frames[0].parentNode.activateSettings();
        // };

        accountService(function(err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                that.account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_indimain.html';

            }
        });

        pagesService(function(err, data) {
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
                PostService.getAllPostsByPageId($scope.currentpage._id, function (posts){
                    that.blogposts = posts;
                });
                /*PostService.getAllPosts(function(posts) {
                    that.blogposts = posts;
                });*/
            }
        });

        websiteService(function(err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
            }
        });

        postsService(function(err, data) {
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
                that.blogposts = data;
            }
        });

        ProductService.getAllProducts(function(data) {
            console.log('product service data >>> ', data);
            that.products = data;
        });

        $scope.trustSrc = function(src) {
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

        /********** CMS RELATED **********/

            window.activateAloha = function() {
                aloha.dom.query('.editable', document).forEach(aloha);
            };

            window.deactivateAloha = function() {
                if(aloha.editor && aloha.editor.selection)
                    aloha.dom.setStyle(aloha.editor.selection.caret, 'display', 'none');
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
                PostService.createPost($scope.currentpage._id, postData, function(data) {});
            };

            $scope.deletePost = function(postId) {
                PostService.deletePost($scope.currentpage._id, postId, function(data) {

                });
            };

            $scope.resfeshIframe = function() {
                //document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
            };

            window.updateComponents = function(data) {
                $scope.$apply(function() {
                    $scope.currentpage.components = data;
                    for (var i = 0; i < $scope.currentpage.components.length; i++) {
                        if ($scope.currentpage.components[i].type == 'navigation') {
                            var body = document.getElementsByTagName('body')[0];
                            body.className = body.className.replace('navbar-v', '');
                            body.className = body.className + ' navbar-v' + $scope.currentpage.components[i].version;
                        }
                    };
                });
            };

            window.triggerEditMode = function() {
                var body = document.getElementsByTagName('body')[0];
                var hasClass = body.classList.contains('editing');
                if (hasClass === false) {
                    body.className += ' editing';
                }

                var toolbar = body.querySelectorAll('.btn-toolbar')[0];
                if (toolbar.classList.contains('editing') === false) {
                    toolbar.className += ' editing';
                }
                window.oldScope.isEditing = true;

                window.oldScope.$digest();
            };

            window.triggerEditModeOff = function() {
                var body = document.getElementsByTagName('body')[0];
                body.className = body.className.replace(/(?:^|\s)editing(?!\S)/, '');

                var toolbar = body.querySelectorAll('.btn-toolbar')[0];
                toolbar.className = toolbar.className.replace(/(?:^|\s)editing(?!\S)/, '');
                console.log(window.oldScope);
                window.oldScope.isEditing = false;
                window.oldScope.$digest();
            };

            window.triggerFontUpdate = function(font) {
                WebFont.load({
                    google: {
                        families: [font, 'undefined']
                    }
                });
                $('h1,h2,h3,h4,h5,h6,h1 .editable,h2 .editable,h3 .editable,h4 .editable,h5 .editable,h6 .editable ').each( function () {
                    this.style.setProperty( 'font-family', font, 'important' );
                });

            };

            if ( !window.oldScope ) {
                window.oldScope = $scope;
            }
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
                    angular.element(ui.item[0].parentNode).sortable("refresh");
                },
                update: function(e, ui) {
                    console.log('sorting update');
                },
                stop: function(e, ui) {
                    ui.item[0].classList.remove('dragging');
                    $scope.wait = setTimeout(function() {
                        ui.item[0].parentNode.classList.remove('active');
                    }, 1500);
                    // var componentId = ui.item[0].querySelectorAll('.component')[0].attributes['data-id'].value;
                    // var newOrder = ui.item.index();
                }
            };

        /********** END CMS RELATED **********/

        /********** SIGNUP SECTION **********/

            $scope.createUser = function(user) {
                console.log('user', user);

                //create contact
                userService.addContact(user, function(data) {
                    console.log('data ', data);
                });

                //redirect to signup with details
                window.location.href = "http://app.indigenous.local:3000/signup";
            };

            $scope.createAccount = function(newAccount) {
                //validate
                    //email
                    if (!$scope.newAccount.email) {
                        $scope.checkEmailExists(newAccount);
                        return;
                    }

                    //pass
                    if (!$scope.newAccount.password) {
                        $scope.checkPasswordLength(newAccount);
                        return;
                    }

                    //business name
                    if (!$scope.newAccount.businessName) {
                        $scope.checkDomainExists(newAccount);
                        return;
                    }

                    //membership selection
                    if (!$scope.newAccount.membership) {
                        $scope.checkMembership(newAccount);
                        return;
                    }

                    //credit card
                    newAccount.card = {
                        number: $('#cc_number').val(),
                        cvc: $('#cc_cvc').val(),
                        exp_month: $('#cc_exp_month').val(),
                        exp_year: $('#cc_exp_year').val()
                    };

                    var cc_name = $('#cc_name').val();

                    if (!newAccount.card.number || !newAccount.card.cvc || !newAccount.card.exp_month || !newAccount.card.exp_year || !cc_name) {
                        console.log('card invalid');
                        //hightlight card in red
                        return;
                    }
                //end validate

                userService.getTmpAccount(function(data) {
                    var tmpAccount = data;
                    tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                    userService.saveOrUpdateTmpAccount(tmpAccount, function(data) {

                        var newUser = {
                            username: newAccount.email,
                            password: newAccount.password,
                            email: newAccount.email,
                            accountToken: data.token
                        };

                        //get the token
                        PaymentService.getStripeCardToken(newAccount.card, function(token) {
                            newUser.cardToken = token;
                            newUser.plan = $scope.selectedPlan;
                            newUser.anonymousId = window.analytics.user().anonymousId();
                            userService.initializeUser(newUser, function(data){
                                window.location.replace(newUser.accountUrl);
                            });
                        });

                        /*
                        userService.createUser(newUser, function(data) {
                            var newUser = data;
                            PaymentService.getStripeCardToken(newAccount.card, function(token) {
                                PaymentService.postStripeCustomer(token, newUser, newUser.accounts[0].accountId, function(stripeUser) {
                                    userService.postAccountBilling(stripeUser.id, token, function(billing) {});
                                    window.location.replace(newUser.accountUrl);
                                    // PaymentService.postCreateStripeSubscription(stripeUser.id, $scope.selectedPlan, function(subscription) {
                                    //     window.location.replace(adminUrl);
                                    // });
                                });
                            });
                        });*/
                    });
                });
            };

            $scope.newAccount = {};

            $scope.checkDomainExists = function(newAccount) {
                console.log('checking to see if the domiain exists ', newAccount.businessName);
                if (!newAccount.businessName) {
                    $("#business-name .error").html("Business Name Required");
                    $("#business-name").addClass('has-error');
                    $("#business-name .glyphicon").addClass('glyphicon-remove');
                } else {
                    var name = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                    userService.checkDomainExists(name, function(data) {
                        if (data != 'true') {
                            $("#business-name .error").html("Domain Already Exists");
                            $("#business-name").addClass('has-error');
                            $("#business-name .glyphicon").addClass('glyphicon-remove');
                        } else {
                            $("#business-name .error").html("");
                            $("#business-name").removeClass('has-error').addClass('has-success');
                            $("#business-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        }
                    });
                }
            };

            $scope.checkEmailExists = function(newAccount) {
                $scope.newAccount.email = newAccount.email;
                console.log('checking to see if the username exists ', newAccount.email);
                if (!newAccount.email) {
                    $("#email .error").html("Email Required");
                    $("#email").addClass('has-error');
                    $("#email .glyphicon").addClass('glyphicon-remove');
                } else {
                    userService.checkEmailExists(newAccount.email, function(data) {
                        if (data === 'true') {
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
                }
            };

            $scope.checkPasswordLength = function(newAccount) {
                console.log('checking to see if the password exists ', newAccount.password);

                if (!newAccount.password) {
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

            $scope.checkMembership = function(newAccount) {
                if (!newAccount.membership) {
                    console.log('membership not selected');
                } else {
                    console.log('membership has been selected');
                }
            };

        /********** END SIGNUP SECTION **********/

    }
]);
