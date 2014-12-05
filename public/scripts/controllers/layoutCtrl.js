'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'userService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll', '$sce', 'postService', 'paymentService', 'productService', 'courseService', 'ipCookie', '$q',
    function($scope, pagesService, websiteService, postsService, userService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll, $sce, PostService, PaymentService, ProductService, CourseService, ipCookie, $q) {
        var account, theme, website, pages, teaserposts, route, postname, products, courses, setNavigation, that = this;

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

        CourseService.getAllCourses(function(data) {
            that.courses = data;
        });

        // setNavigation = function (data) {
        //     var tempPageComponents, indexNavComponent, page, pageNavComponent, setting;
        //     tempPageComponents = data['index'].components;
        //     indexNavComponent = angular.copy($filter('getByType')(tempPageComponents, 'navigation'));

        //     // indexNavComponent._id = null;
        //     // indexNavComponent.anchor = null;
        //     // indexNavComponent.visibility = null;
        //     if (indexNavComponent !== null) {
        //         ['_id', 'anchor', 'visibility'].forEach(function (v){
        //             indexNavComponent[v] = null;
        //         })

        //         for ( page in data ) {
        //             if ( data.hasOwnProperty(page) && page != 'index' ) {
        //                 tempPageComponents = data[page].components;
        //                 pageNavComponent = $filter('getByType')(tempPageComponents, 'navigation');
        //             }
        //             if (pageNavComponent !== null){
        //                 for (setting in indexNavComponent) {
        //                     if (indexNavComponent[setting] !== null) {
        //                         pageNavComponent[setting] = indexNavComponent[setting];
        //                     }
        //                 }
        //             }
        //         }
        //     }

        // };

        $scope.getCourse = function(campaignId) {
            console.log('campaign Id ', campaignId);
            for (var i = 0; i < that.courses.length; i++) {
                if (that.courses[i]._id === parseInt(campaignId)) {
                    return that.courses[i];
                }
            };
        };

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
                } else {
                    route = $scope.$location.$$path.replace('/page/', '');
                    console.log('route ', route);
                    that.pages = data[route];
                }
                $scope.currentpage = that.pages;
                var iframe = window.parent.document.getElementById("iframe-website")               
                iframe && iframe.contentWindow && iframe.contentWindow.parent.updateAdminPageScope && iframe.contentWindow.parent.updateAdminPageScope($scope.currentpage);
                // PostService.getAllPostsByPageId($scope.currentpage._id, function(posts) {
                //     that.blogposts = posts;
                // });
                //                $scope.currentpage.components.forEach(function(component){
                //                    if (component.bg.img) {
                //                        component.bgimg = {
                //                            "background": "url(" + component.bg.img.url + ") no-repeat fixed",
                //                            "background-size": "cover",
                //                            "color": component.txtcolor || $scope.primaryTextColor
                //                        };
                //                    }
                //
                //                })
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
                console.log('BlogCtrl Error: ' + err);
            } else {

                if (that.teaserposts) {
                    //donothing
                } else {
                    if (route === '/' || route === '') {
                        that.teaserposts = data;
                    }
                }

                that.currentTag, that.currentAuthor, that.currentCat = '';
                //get post tags for sidebar
                //should be replaced by get tags filter

                if (data) {
                    that.postTags = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_tags) {
                            var tags = data[i].post_tags;
                            for (var j = 0; j < tags.length; j++) {
                                if (that.postTags.indexOf(tags[j]) == -1) {
                                    that.postTags.push(tags[j]);
                                }
                            };
                        }
                    };

                    //get post cateogires for sidebar
                    //should be replaced by get cateogires filter
                    that.categories = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_category) {
                            if (that.categories.indexOf(data[i].post_category) <= -1) {
                                that.categories.push(data[i].post_category);
                            }
                        }
                    };

                    //get latest posts for sidebar
                    //should be replaced by get latest posts filter
                    that.latestposts = [];
                    for (var i = 0; i < data.length; i++) {
                        that.latestposts.push(data[i]);
                    };
                    that.latestposts.slice(Math.max(data.length - 3, 1));
                }

                if (route.indexOf('blog') > -1) {
                    that.blogposts = data;
                }

                //if tagname is present, filter the cached posts with the tagname
                if ($route.current.params.tagname != null) {
                    var filterPosts = [];
                    that.currentTag = $route.current.params.tagname;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_tags) {
                            var tags = data[i].post_tags;
                            for (var i2 = 0; i2 < tags.length; i2++) {
                                if (tags[i2] === $route.current.params.tagname) {
                                    filterPosts.push(data[i]);
                                }
                            };
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                //if authorname is present, filter the cached posts with the authorname
                if ($route.current.params.authorname != null) {
                    var filterPosts = [];
                    that.currentAuthor = $route.current.params.authorname;
                    for (var i = 0; i < data.length; i++) {
                        if (typeof data[i].post_author !== "undefined") {
                            if (data[i].post_author === $route.current.params.authorname) {
                                filterPosts.push(data[i]);
                            }
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                //if catname is present, filter the cached posts with the catname
                if ($route.current.params.catname != null) {
                    var filterPosts = [];
                    that.currentCat = $route.current.params.catname;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_category) {
                            if (data[i].post_category === $route.current.params.catname) {
                                filterPosts.push(data[i]);
                            }
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                if ($route.current.params.postname != null) {
                    var found = $filter('getByProperty')('post_url', $route.current.params.postname, data);
                    if (found) {
                        that.post = found;
                    }
                    return;
                }

                return;
            }
        });

        ProductService.getAllProducts(function(data) {
            that.products = data;
        });

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }

        $scope.config = {
            width: 780,
            height: 320,
            autoHide: true,
            autoPlay: false,
            autoHideTime: 1500,
            responsive: true,
            stretch: 'fit',
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

        /********** PRODUCT RELATED **********/
        $scope.addDetailsToCart = function(product) {
            if (!$scope.cartDetails) {
                $scope.cartDetails = [];
            }
            if (!product.quantity) {
                product.quantity = 1;
            }
            var match = _.find($scope.cartDetails, function(item) {
                return item._id === product._id
            })
            if (match) {
                match.quantity = parseInt(match.quantity) + 1;
            } else {
                $scope.cartDetails.push(product);
            }
            $scope.calculateTotalChargesfn();

        };

        $scope.calculateTotalChargesfn = function() {
            var subTotal = 0;
            var totalTax = 0;
            var total = 0;
            $scope.cartDetails.forEach(function(item) {
                subTotal = parseFloat(subTotal) + (parseFloat(item.regular_price) * item.quantity);
            })
            $scope.subTotal = subTotal;
            $scope.totalTax = parseFloat(($scope.subTotal * 8) / 100);
            $scope.total = $scope.subTotal + $scope.totalTax;
        }

        $scope.makeCartPayment = function() {
            var expiry = $('#expiry').val().split("/")
            var exp_month = expiry[0].trim();
            var exp_year = "";
            if (expiry.length > 1)
                exp_year = expiry[1].trim();
            $('#expiry').val().split("/")[0].trim()
            var cardInput = {
                number: $('#number').val(),
                cvc: $('#cvc').val(),
                exp_month: exp_month,
                exp_year: exp_year
            };

            if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
                //|| !cc_name
                console.log('card invalid');
                //hightlight card in red
                return;
            }

            PaymentService.getStripeCardToken(cardInput, function(token) {
                PaymentService.saveCartDetails(token, parseInt($scope.total * 100), function(data) {
                    $('#cart-checkout-modal').modal('hide');
                });
            });

        };


        /********** END PRODUCT RELATED **********/


        /********** CMS RELATED **********/

        window.activateAloha = function() {
            $('.editable').aloha();
            // aloha.dom.query('.editable', document).forEach(aloha);
            // $('.aloha-caret.aloha-ephemera', document).css('visibility','visible');
        };

        window.deactivateAloha = function() {
            $('.editable').mahalo();
            // if (aloha.editor && aloha.editor.selection) {
            //     // aloha.dom.setStyle(aloha.editor.selection.caret, 'display', 'none');
            //     // $('.aloha-caret.aloha-ephemera', document).css('visibility', 'collapse');
            // }
            // aloha.dom.query('.editable', document).forEach(aloha.mahalo);
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

        window.saveBlobData = function(iframe) {
            if (iframe) {
                var posts = iframe.body.querySelectorAll('.blog-entry');
                for (var i = 0; i < posts.length; i++) {
                    var blog_id = posts[i].attributes['data-id'].value;
                    var post_excerpt_div = posts[i].querySelectorAll('.post_excerpt');
                    var post_title_div = posts[i].querySelectorAll('.post_title');
                    var post_excerpt = post_excerpt_div[0].outerText;
                    var post_title = post_title_div[0].outerText;
                    var matching_post = _.find(that.blogposts, function(item) {
                        return item._id === blog_id
                    })
                    if (matching_post) {
                        matching_post.post_excerpt = post_excerpt;
                        matching_post.post_title = post_title;
                        PostService.updatePost($scope.currentpage._id, blog_id, matching_post, function(data) {});
                    }
                }
            }
        }

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

            // var toolbar = body.querySelectorAll('.btn-toolbar')[0];
            // if (toolbar.classList.contains('editing') === false) {
            //     toolbar.className += ' editing';
            // }
            window.oldScope.isEditing = true;

            window.oldScope.$digest();
        };

        window.triggerEditModeOff = function() {
            var body = document.getElementsByTagName('body')[0];
            body.className = body.className.replace(/(?:^|\s)editing(?!\S)/, '');

            // var toolbar = body.querySelectorAll('.btn-toolbar')[0];
            // toolbar.className = toolbar.className.replace(/(?:^|\s)editing(?!\S)/, '');
            // console.log(window.oldScope);
            window.oldScope.isEditing = false;
            window.oldScope.$digest();
        };

        window.triggerFontUpdate = function(font) {
            WebFont.load({
                google: {
                    families: [font, 'undefined']
                }
            });

            $('h1,h2,h3,h4,h5,h6,h1 .editable,h2 .editable,h3 .editable,h4 .editable,h5 .editable,h6 .editable ').each(function() {
                this.style.setProperty('font-family', font, 'important');
            });

        };

        if (!window.oldScope) {
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
        $scope.$watch('currentpage.components', function(newValue, oldValue) {
            if (newValue) {
                newValue.forEach(function(value, index) {
                    if (value.type === 'payment-form') {
                        var productId = value.productId;
                        ProductService.getProduct(productId, function(product) {
                            $scope.paymentFormProduct = product;
                            var promises = [];
                            $scope.subscriptionPlans = [];
                            if ('stripePlans' in $scope.paymentFormProduct.product_attributes) {
                                $scope.paymentFormProduct.product_attributes.stripePlans.forEach(function(value, index) {
                                    if (value.active)
                                        promises.push(PaymentService.getPlanPromise(value.id));
                                });
                                $q.all(promises)
                                    .then(function(data) {
                                        data.forEach(function(value, index) {
                                            $scope.subscriptionPlans.push(value.data);
                                        });
                                    })
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                            }
                        });
                    }
                });
            }
        });

        $scope.selectSubscriptionPlanFn = function(planId, amount, interval) {
            $scope.newAccount.membership = planId;
            $scope.subscriptionPlanAmount = amount;
            $scope.subscriptionPlanInterval = interval;
        };
        $scope.monthly_sub_cost = 49.95;
        $scope.yearly_sub_cost = 32.91;
        $scope.selected_sub_cost = $scope.monthly_sub_cost;

        $scope.createUser = function(user) {
            console.log('user', user);
            if (!user || !user.email) {
                $("#user_email .error").html("Email Required");
                $("#user_email").addClass('has-error');
                $("#user_email .glyphicon").addClass('glyphicon-remove');
                return;
            }
            if (user.email) {
                var formatted = {
                    details: [{
                        emails: []
                    }]
                };
                formatted.details[0].emails.push({
                    email: user.email
                });
                //create contact
                userService.addContact(formatted, function(data, err) {
                    if (err && err.code === 409) {
                        // $("#input-company-name").val('');
                        $("#user_email .error").html("Email already exists");
                        $("#user_email").addClass('has-error');
                        $("#user_email .glyphicon").addClass('glyphicon-remove');

                    } else if (data) {
                        console.log('email avaliable');
                        $("#user_email .error").html("");
                        $("#user_email").removeClass('has-error').addClass('has-success');
                        $("#user_email .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        console.log('data ', data);
                        user.email = "";
                        user.success = true;

                        setTimeout(function() {
                            $scope.$apply(function() {
                                user.success = false;
                            });
                        }, 3000);
                    }

                });
            }

            //redirect to signup with details
            //window.location.href = "http://app.indigenous.local:3000/signup";
        };

        $scope.createContactwithFormActivity = function(contact) {
            console.log('contact', contact);
            if (!contact || !contact.email) {
                $("#contact_email .error").html("Email Required");
                $("#contact_email").addClass('has-error');
                $("#contact_email .glyphicon").addClass('glyphicon-remove');
                return;
            }
            if (contact.email) {
                var contact_info = {
                    first: contact.first_name,
                    last: contact.last_name,
                    details: [{
                        emails: []
                    }]
                };

                contact_info.details[0].emails.push({
                    email: contact.email
                });

                userService.addContact(contact_info, function(data, err) {
                    console.log('data ', data);
                    if (err && err.code === 409) {
                        // $("#input-company-name").val('');
                        $("#contact_email .error").html("Email already exists");
                        $("#contact_email").addClass('has-error');
                        $("#contact_email .glyphicon").addClass('glyphicon-remove');

                    } else if (data) {
                        console.log('email avaliable');
                        $("#contact_email .error").html("");
                        $("#contact_email").removeClass('has-error').addClass('has-success');
                        $("#contact_email .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        //create activity
                        var activity_info = {
                            accountId: data.accountId,
                            contactId: data._id,
                            activityType: 'CONTACT_FORM',
                            note: "Contact form data.",
                            start: new Date(),
                            extraFields: contact,
                            sessionId: ipCookie("session_cookie")["id"]
                        };
                        userService.addContactActivity(activity_info, function(data) {
                            console.log('data ', data);
                            contact.email = '';
                            contact.message = '';
                            contact.full_name = '';
                            contact.success = true;
                            setTimeout(function() {
                                $scope.$apply(function() {
                                    contact.success = false;
                                });
                            }, 3000);
                        });
                    }

                });
            }


            //create contact


            //redirect to signup with details
            //window.location.href = "http://app.indigenous.local:3000/signup";
        };

        $scope.createAccount = function(newAccount) {
            //validate
            //email
            $scope.isFormValid = false;
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
                number: $('#number').val(),
                cvc: $('#cvc').val(),
                exp_month: parseInt($('#expiry').val().split('/')[0]),
                exp_year: parseInt($('#expiry').val().split('/')[1])
            };

            var cc_name = $('#name').val();

            console.info(newAccount.card.number);
            console.info(newAccount.card.cvc);
            console.info(newAccount.card.exp_month);
            console.info(newAccount.card.exp_year);
            console.info(cc_name);

            if (!newAccount.card.number || !newAccount.card.cvc || !newAccount.card.exp_month || !newAccount.card.exp_year) {
                //|| !cc_name
                console.log('card invalid');
                //hightlight card in red
                $scope.checkCardNumber();
                $scope.checkCardExpiry();
                $scope.checkCardCvv();
                return;
            }
            //end validate
            $scope.isFormValid = true;
            userService.getTmpAccount(function(data) {
                var tmpAccount = data;
                tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                userService.saveOrUpdateTmpAccount(tmpAccount, function(data) {

                    var newUser = {
                        username: newAccount.email,
                        password: newAccount.password,
                        email: newAccount.email,
                        accountToken: data.token,
                        coupon: newAccount.coupon
                    };

                    //get the token
                    PaymentService.getStripeCardToken(newAccount.card, function(token, error) {
                        if (error) {
                            console.info(error);
                            switch (error.param) {
                                case "number":
                                    $("#card_number .error").html(error.message);
                                    $("#card_number").addClass('has-error');
                                    break;
                                case "exp_year":
                                    $("#card_expiry .error").html(error.message);
                                    $("#card_expiry").addClass('has-error');
                                    break;
                                case "cvc":
                                    $("#card_cvc .error").html(error.message);
                                    $("#card_cvc").addClass('has-error');
                                    break;
                            }
                        }
                        $scope.isFormValid = false;
                        newUser.cardToken = token;
                        newUser.plan = $scope.selectedPlan;
                        newUser.anonymousId = window.analytics.user().anonymousId();
                        newUser.permanent_cookie = ipCookie("permanent_cookie");
                        newUser.fingerprint = new Fingerprint().get();
                        userService.initializeUser(newUser, function(data) {
                            window.location = data.accountUrl;
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

        $scope.checkCardNumber = function() {
            var card_number = $('#number').val();
            console.log('checking to see if the card numer exists ', card_number);

            if (!card_number) {
                $("#card_number .error").html("Card Number Required");
                $("#card_number").addClass('has-error');
            } else {
                $("#card_number .error").html("");
                $("#card_number").removeClass('has-error').addClass('has-success');
            }
        };

        $scope.checkCardExpiry = function() {
            var expiry = $('#expiry').val();
            var card_expiry = expiry.split("/")
            var exp_month = card_expiry[0].trim();
            var exp_year;
            if (card_expiry.length > 1)
                exp_year = card_expiry[1].trim();



            console.log('checking to see if the card expiry details exists ', card_expiry);

            if (!expiry || !exp_month || !exp_year) {
                if (!expiry)
                    $("#card_expiry .error").html("Expiry Required");
                else if (!exp_month)
                    $("#card_expiry .error").html("Expiry Month Required");
                else if (!exp_year)
                    $("#card_expiry .error").html("Expiry Year Required");
                $("#card_expiry").addClass('has-error');
            } else {
                $("#card_expiry .error").html("");
                $("#card_expiry").removeClass('has-error').addClass('has-success');
            }
        };

        $scope.checkCardCvv = function() {

            var card_cvc = $('#cvc').val();
            console.log('checking to see if the card cvc exists ', card_cvc);

            if (!card_cvc) {
                $("#card_cvc .error").html("CVC Required");
                $("#card_cvc").addClass('has-error');
            } else {
                $("#card_cvc .error").html("");
                $("#card_cvc").removeClass('has-error').addClass('has-success');
            }
        };

        /********** END SIGNUP SECTION **********/

        // $scope.uploadImage = function(asset) {

        //     console.log("image Changed");

        // }
        // $scope.currentComponent = "sgsgsdgsd";
        // $scope.currentImage = "";
        // $scope.insertMedia = function(asset) {

        //     console.log(asset);
        //     console.log($scope.currentComponent);
        //     console.log($scope.currentImage);
        //     //   $scope.componentEditing.bg.img.url=asset.url;
        //     //  $scope.updateIframeComponents();

        // };

        $scope.addImage = function(component) {
            parent.$('body').trigger('add_image');
        };
        $scope.deleteImage = function(component, index) {
            parent.$('body').trigger('delete_image', [index]);
        };
    }
]);
