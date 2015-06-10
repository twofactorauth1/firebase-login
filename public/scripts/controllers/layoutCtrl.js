'use strict';

mainApp.controller('LayoutCtrl', ['$scope', '$timeout', 'pagesService', 'websiteService', 'postsService', 'userService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll', '$sce', 'postService', 'paymentService', 'productService', 'courseService', 'ipCookie', '$q', 'customerService', 'pageService', 'analyticsService', 'leafletData', 'cartService',
    function($scope, $timeout, pagesService, websiteService, postsService, userService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll, $sce, PostService, PaymentService, ProductService, CourseService, ipCookie, $q, customerService, pageService, analyticsService, leafletData, cartService) {
        var account, theme, website, pages, teaserposts, route, postname, products, courses, setNavigation, that = this;

        route = $location.$$path;
        console.log('$location ', $location);
        $scope.adminUrl = $location.$$absUrl + '/admin'
        if (route.indexOf('/') === 0) {
            route = route.replace('/', '');
        }
        window.oldScope;
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;
        $scope.$url = $location.$$url;
        $scope.tagCloud = [];
        $scope.isPageDirty = false;
        $scope.currentcomponents = [];
        $scope.thumbnailSlider = [];
        $scope.contactDetails = [];
        $scope.activeEditor = null;
        $scope.activated = false;

        //displays the year dynamically for the footer
        var d = new Date();
        $scope.currentDate = new Date();
        $scope.copyrightYear = d.getFullYear();
        $scope.allowUndernav = false;
        $scope.addUndernavClasses = false;
        $scope.$watch(function () { return cartService.getCartItems() }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                console.log('cart changed >>> ', newValue);
            }
        });

        $scope.parentScope = parent.angular.element('#iframe-website').scope();

        $scope.sortBlogFn = function(component) {
            return function(blogpost) {
                if (component.postorder) {
                    if (component.postorder == 1 || component.postorder == 2) {
                        return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
                    } else if (component.postorder == 3 || component.postorder == 4) {
                        return Date.parse($filter('date')(blogpost.created.date, "MM/dd/yyyy HH:mm:ss"));
                    } else if (component.postorder == 5 || component.postorder == 6) {
                        return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
                    }
                } else
                    return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
            };
        };

        $scope.customSortOrder = function(component) {
            if (component.postorder == 1 || component.postorder == 3 || component.postorder == 5) {
                return false;
            } else if (component.postorder == 2 || component.postorder == 4 || component.postorder == 6) {
                return true;
            } else {
                return true;
            }
        };

        CourseService.getAllCourses(function(data) {
            that.courses = data;
        });

        $scope.getCourse = function(campaignId) {
            for (var i = 0; i < that.courses.length; i++) {
                if (that.courses[i]._id === parseInt(campaignId)) {
                    return that.courses[i];
                }
            };
        };

        $scope.visitAdmin = function() {
            window.location = $location.$$absUrl + 'admin';
        };

        $scope.visitEditor = function() {
            window.location = $location.$$absUrl + 'admin/website/pages/?pagehandle='+route;
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
                // setNavigation(data);
                if ($scope.$location.$$path === '/' || $scope.$location.$$path === '') {
                    route = 'index';
                    /*
                     * if you just set a variable... why would you need to replace a character that ISN'T IN IT?
                     */
                    route = route.replace('/', ''); // <-- why?
                    if (!angular.isDefined(data[route])) {
                        route = 'coming-soon';
                        /*
                         * This is pants-on-head stupid.  Why would you be able to create a page from the front-end?
                         * var pageData = {
                         title: 'Coming Soon',
                         handle: 'coming-soon',
                         mainmenu: false
                         };
                         var websiteId = that.account.website.websiteId;
                         pageService.createPage(websiteId, pageData, function(newpage) {
                         var cmpVersion = 1;
                         var pageId = newpage._id;
                         pageService.addNewComponent(pageId, pageData.title, pageData.handle, cmpVersion, function(data) {
                         window.location.reload();
                         });
                         that.pages = newpage;
                         });
                         */
                        that.pages = data[route];
                    }
                    if (angular.isDefined(data[route])) {
                        that.pages = data[route];
                    } else {
                        console.log('there is no route defined for ' + route);
                    }

                } else {
                    route = $scope.$location.$$path.replace('/page/', '');
                    route = route.replace('/', '');
                    that.pages = data[route];
                }

                if ($scope.$location.$$path === '/signup') {
                    userService.getTmpAccount(function(data) {
                        var tmpAccount = data;
                        //$scope.tmpAccount = tmpAccount;
                        if (tmpAccount.tempUser) {
                            if (tmpAccount.tempUser.email) {
                                $scope.newAccount.email = tmpAccount.tempUser.email;
                                $scope.newAccount.tempUserId = tmpAccount.tempUser._id;
                            }
                            if (tmpAccount.tempUser.businessName) {
                                $scope.newAccount.businessName = tmpAccount.tempUser.businessName;
                            }
                            if (tmpAccount.tempUser.profilePhotos && tmpAccount.tempUser.profilePhotos.length) {
                                $scope.newAccount.profilePhoto = tmpAccount.tempUser.profilePhotos[0];
                            }
                        } else {
                            userService.saveOrUpdateTmpAccount(tmpAccount, function(data) {});
                        }


                    });
                }


                $scope.currentpage = that.pages;

                if ($route.current.params.custid != null) {
                    $scope.custid = $route.current.params.custid;
                    customerService.getCustomer($scope.custid, function(data) {
                        that.customer = data;
                        that.shipping = customerService.getAddressByType(data, "shipping");
                        that.billing = customerService.getAddressByType(data, "billing");
                        that.billingChange = false;
                        that.shippingChange = false;
                    });

                    $scope.getAddressByType = function(customer, type) {
                        var address;
                        if (customer) {
                            address = customerService.getAddressByType(customer, type)
                            if (address == "") {
                                return '';
                            }
                            return _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip], function(str) {
                                return str !== "";
                            }).join(", ")
                        }
                        return '';
                    }
                }

                angular.element(document).ready(function() {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.isLoaded = true;
                            if ($scope.parentScope) {
                                $scope.parentScope.iframeLoaded;
                                $scope.parentScope.afteriframeLoaded($scope.currentpage);
                            }
                            $scope.dataLoaded = true;
                            
                        })
                        var locId = $location.$$hash;
                        if (locId) {
                            var element = document.getElementById(locId);
                            if (element)
                                $document.scrollToElementAnimated(element);
                        }
                        $scope.setUnderbnavMargin();
                    }, 500);
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $scope.$watch('layout.postTags', function(newValue, oldValue) {
                                    if (newValue !== undefined && newValue.length) {
                                        var tagsArr = [];
                                        that.totalPosts.forEach(function(val) {
                                            if (val.post_tags)
                                                tagsArr.push(val.post_tags);
                                        })
                                        newValue.forEach(function(value, index) {
                                            var default_size = 2;
                                            var count = _.countBy(_.flatten(tagsArr), function(num) {
                                                return num == value
                                            })["true"];
                                            if (count)
                                                default_size += count;
                                            $scope.tagCloud.push({
                                                text: value,
                                                weight: default_size, //Math.floor((Math.random() * newValue.length) + 1),
                                                link: '/tag/' + value
                                            })
                                        });
                                    }
                                });
                            })
                        }, 1000);
                    });

                var iframe = window.document.getElementById("iframe-website")
                $scope.isAdmin = iframe;
                //if ($scope.parentScope.updateAdminPageScope) {
                // $scope.parentScope.updateAdminPageScope($scope.currentpage);
                // }
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
                that.totalPosts = angular.copy(data);

                var total = data.total;
                var limit = data.limit;
                var start = data.start;
                if (data.results)
                    data = data.results;
                if (that.teaserposts) {
                    //donothing
                } else {
                    that.teaserposts = data;
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

                // if (route.indexOf('blog') > -1) {
                that.blogposts = data;
                // }

                //if tagname is present, filter the cached posts with the tagname
                if ($route.current.params.tagname != null) {
                    var filterPosts = [];
                    that.currentTag = decodeURIComponent($route.current.params.tagname);
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


        $scope.stringifyAddress = function(address) {
            if (address) {
                var _topline = _.filter([address.address, address.address2], function(str) {
                    return str !== "";
                }).join(", ");
                var _bottomline = _.filter([address.city, address.state, address.zip], function(str) {
                    return str !== "";
                }).join(", ");

                return _topline + ' <br> ' + _bottomline;
            }
        };

        $scope.showEdit = function(type) {
            if (type == "billing")
                that.billingChange = that.billingChange ? false : true;
            else
                that.shippingChange = that.shippingChange ? false : true;
        };

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.flvVideoUrl = function(iframeUrl, url) {
            var parsedUrl = urlParser.parse(url);
            var retUrl = "";
            if (parsedUrl)
                retUrl = iframeUrl + parsedUrl.id + '?showinfo=0&rel=0&hd=1';
            else
                retUrl = iframeUrl
            return $sce.trustAsResourceUrl(retUrl);
        };

        $scope.config = {
            width: 780,
            height: 320,
            autoHide: true,
            autoPlay: false,
            autoHideTime: 1500,
            responsive: false,
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

        $scope.newContact = {
            isAuthenticated: true,
            details: [{
                phones: [{
                    type: 'w',
                    default: false,
                    number: ''
                }],
                addresses: [{}],
                emails: [{}]
            }]
        };

        $scope.getUrl = function(value) {
            if (value && !/http[s]?/.test(value)) {
                value = 'http://' + value;
            }
            return value;
        };

        /********** BLOG PAGE PAGINATION RELATED **********/
        $scope.curPage = 0;
        $scope.pageSize = 10;
        $scope.numberOfPages = function() {
            if (that.blogposts)
                return Math.ceil(that.blogposts.length / $scope.pageSize);
            else
                return 0;
        };

        /********** END BLOG PAGE PAGINATION RELATED **********/

        /********** CMS RELATED **********/

        /********** MAP RELATED **********/
        angular.extend($scope, {
            mapLocation: {
                lat: 51,
                lng: 0,
                zoom: 10
            },
            defaults: {
                scrollWheelZoom: false
            },
            markers: {

            }
        });

        $scope.updateContactUsMap = function(component) {
            var matchingContact = _.find($scope.contactDetails, function(item) {
                return item.contactId == component._id
            })

            if (!matchingContact) {

                $scope.contactDetails.push({
                    contactId: component._id,
                    contactPhone: angular.copy(component.contact.phone),
                    geo_address_string: $scope.stringifyAddress(component.location)
                });
                matchingContact = _.find($scope.contactDetails, function(item) {
                    return item.contactId == component._id
                });

            } else {
                matchingContact.contactPhone = angular.copy(component.contact.phone);
                matchingContact.geo_address_string = $scope.stringifyAddress(component.location);
            }

            if (matchingContact.geo_address_string == "" && that.account.business.addresses.length) {
                if (that.account.business.addresses[0].address || that.account.business.addresses[0].address2)
                    matchingContact.geo_address_string = $scope.stringifyAddress(that.account.business.addresses[0]);
            }
            if (!component.contact.phone && that.account.business.phones.length)
                matchingContact.contactPhone = that.account.business.phones[0].number;
            if (component.location.lat && component.location.lat && matchingContact.geo_address_string) {
                angular.extend($scope, {
                    mapLocation: {
                        lat: parseFloat(component.location.lat),
                        lng: parseFloat(component.location.lon),
                        zoom: 10
                    },
                    markers: {
                        mainMarker: {
                            lat: parseFloat(component.location.lat),
                            lng: parseFloat(component.location.lon),
                            focus: false,
                            message: matchingContact.geo_address_string,
                            draggable: false
                        }
                    }
                });
                leafletData.getMap('leafletmap').then(function(map) {
                    $timeout(function() {
                        map.invalidateSize();
                    }, 500);
                });
            } else {
                customerService.getGeoSearchAddress($scope.stringifyAddress(component.location), function(data) {
                    if (data.lat && data.lon) {
                        component.location.lat = data.lat;
                        component.location.lon = data.lon;
                        angular.extend($scope, {
                            mapLocation: {
                                lat: parseFloat(component.location.lat),
                                lng: parseFloat(component.location.lon),
                                zoom: 10
                            },
                            markers: {
                                mainMarker: {
                                    lat: parseFloat(component.location.lat),
                                    lng: parseFloat(component.location.lon),
                                    focus: false,
                                    message: matchingContact.geo_address_string,
                                    draggable: false
                                }
                            }
                        });
                    }
                });
            }
        };
        /********** END MAP RELATED **********/
        $scope.sharePost = function(post, type) {
            var url = $location.$$absUrl;
            var postData = {};
            switch (type) {
                case "twitter":
                    postData = {
                        status: url
                    }
                    PostService.sharePostOnTwitter(postData, function(data) {

                    });
                    break;
                case "facebook":
                    postData = {
                        url: url,
                        picture: post.featured_image,
                        name: post.post_title,
                        caption: post.post_excerpt,
                        description: post.post_excerpt
                    }
                    PostService.sharePostOnFacebook(postData, function(data) {

                    });
                    break;
                case "linked-in":
                    postData = {
                        url: url,
                        picture: post.featured_image,
                        name: post.post_title,
                        caption: post.post_excerpt,
                        description: post.post_excerpt
                    }
                    PostService.sharePostOnLinkedIn(postData, function(data) {

                    });
                    break;
            }
        };

        $scope.setPostImage = function(componentId, blogpost) {
            $scope.parentScope.setPostImage(componentId);
            blogpost.featured_image = $scope.parentScope.postImageUrl;
        };

        $scope.setProfileImage = function(componentId, customer) {
            $scope.parentScope.changeProfilePhoto(componentId, customer);
        };

        $scope.changeBlogImage = function(blogpost) {
            $scope.parentScope.changeBlogImage(blogpost);
        };

        $scope.changeLogoImage = function(componentId) {
            $scope.parentScope.changeLogoImage(componentId);
        };

        $scope.saveCustomerAccount = function(customer) {
            if (customer && customer.accountId)
                customerService.putCustomer(customer, function(data) {
                    that.customer = data;
                });
        };

        $scope.deleteTeamMember = function(componentId, index) {
            $scope.parentScope.deleteTeamMember(componentId, index);
        };

        $scope.addTeamMember = function(componentId, index) {
            // to do: the information should fetch from component model
            var newTeam = {
                "name": "<p>First Last</p>",
                "position": "<p>Position of Person</p>",
                "profilepic": "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
                "bio": "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                "networks": [{
                    "name": "linkedin",
                    "url": "http://www.linkedin.com",
                    "icon": "linkedin"
                }]
            }
            $scope.parentScope.addTeamMember(componentId, newTeam, index);
        };

        $scope.deleteFeatureList = function(componentId, index) {
            $scope.parentScope.deleteFeatureList(componentId, index);
        };

        $scope.addFeatureList = function(componentId, index) {
            var newFeature = {
                "top": "<div style='text-align:center'><span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%23ffffff%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#ffffff;font-size:96px;\"></span></div>",
                "content": "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Another Feature</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
            };
            $scope.parentScope.addNewFeatureList(componentId, index, newFeature);
        };

        /*
         * @clickImageButton
         * -
         */

        window.clickImageButton = function(btn) {
            var urlInput = $(btn).closest('td').prev('td').find('input');
            $scope.parentScope.clickImageButton(urlInput, true);
        };

        /*
         * @clickandInsertImageButton
         * -
         */

        window.clickandInsertImageButton = function(editor) {
            $scope.parentScope.clickImageButton(editor, false);
        };

        $scope.getActiveEditor = function() {
           return $scope.activeEditor;
        };

        $scope.deletePricingTable = function(componentId, index) {
            $scope.parentScope.deletePricingTable(componentId, index);
        };

        $scope.deletePricingTableFeature = function(componentId, index, parentIndex) {
            $scope.parentScope.deletePricingTableFeature(componentId, index, parentIndex);
        };


        $scope.addPricingTableFeature = function(componentId, index, parentIndex) {
            // to do: the information should fetch from component model
            var newFeature = {
                title: "<h4>This is the feature title</h4>",
                subtitle: "<b>This is the feature subtitle</b>",
            }
            $scope.parentScope.addPricingTableFeature(componentId, newFeature, index, parentIndex);
        };

        $scope.addPricingTable = function(componentId, index) {
            // to do: the information should fetch from component model
            var newTable = {
                title: "<h1>This is title</h1>",
                subtitle: "<h3>This is the subtitle.</h3>",
                text: 'This is text',
                price: '$9.99/per month',
                features: [{
                    title: "<h4>This is the feature title</h4>",
                    subtitle: "<b>This is the feature subtitle</b>",
                }],
                btn: "<a class=\"btn btn-primary\" href=\"#\" data-cke-saved-href=\"#\">Get it now</a>"
            }

            $scope.parentScope.addPricingTable(componentId, newTable, index);
        };

        $scope.deleteTestimonial = function(componentId, index) {
            $scope.dataLoaded = false;
            $scope.parentScope.deleteTestimonial(componentId, index);

        };


        $scope.addTestimonial = function(componentId, index) {
            // to do: the information should fetch from component model
            var newTestimonial = {
                "img": "",
                "name": "Name",
                "site": "Site",
                "text": "Description"
            }
            $scope.dataLoaded = false;
            $scope.parentScope.addTestimonial(componentId, newTestimonial, index);
        };


        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };


        $scope.activateCKEditor = function() {            
                $scope.isEditing = true;
                for (name in CKEDITOR.instances) {  
                        CKEDITOR.instances[name].removeCustomListeners();
                        CKEDITOR.remove(CKEDITOR.instances[name]);
                }
                CKEDITOR.disableAutoInline = true;
                var elements = angular.element('.editable');
                elements.each(function(index) {
                    if (!angular.element(this).parent().hasClass('edit-wrap')) {
                        var dataClass = angular.element(this).data('class').replace('.item.', ' ');
                        angular.element(this).wrapAll('<div class="edit-wrap"></div>').parent().append('<span class="editable-title">' + toTitleCase(dataClass) + '</span>');
                    }
                    CKEDITOR.inline(this, {
                        on: {
                            instanceReady: function(ev) {
                                var editor = ev.editor;
                                editor.setReadOnly(false);
                                if(index === 0)
                                    $scope.activeEditor = editor;
                                editor.on('change', function() {
                                    $scope.isPageDirty = true;
                                });
                                editor.on('focus', function() {
                                    $scope.activeEditor = editor;
                                });
                                editor.on('blur', function() {
                                    $scope.activeEditor = null;
                                });
                            }
                        },
                        sharedSpaces: {
                            top: 'editor-toolbar'
                        }
                    });
                });
                setTimeout(function() {
                    $scope.$apply(function() {
                        if (angular.element("div.meet-team-height").length) {
                            var maxTeamHeight = Math.max.apply(null, angular.element("div.meet-team-height").map(function() {
                                return angular.element(this).height();
                            }).get());
                            angular.element(".meet-team-height").css("min-height", maxTeamHeight);
                        }
                        for (var i = 1; i <= 3; i++) { 
                            if($("div.feature-height-"+i).length)
                            {
                              var maxFeatureHeight = Math.max.apply(null, $("div.feature-height-"+i).map(function ()
                              {
                                  return $(this).height();
                              }).get());
                              $("div.feature-height-"+ i + " .feature-single").css("min-height", maxFeatureHeight + 20);
                            }
                        }                      
                        $scope.parentScope.resizeIframe();
                  });  
                }, 500)            
            
        };


        window.calculateWindowHeight = function() {
           return $scope.parentScope.calculateWindowHeight();
        };

        $scope.deactivateCKEditor = function() {
            for (name in CKEDITOR.instances) {
                CKEDITOR.instances[name].destroy()
            }
        };

        $scope.checkOrSetPageDirty = function(status) {
            if (status)
                $scope.isPageDirty = false;
            else
                return $scope.isPageDirty;
        }

        $scope.createPost = function(postData) {
            PostService.createPost($scope.currentpage._id, postData, function(data) {});
        };

        $scope.deleteBlogPost = function(postId, blogpost) {
            console.log('delete post');
            PostService.deletePost($scope.currentpage._id, postId, function(data) {
                if (blogpost) {
                    var index = that.blogposts.indexOf(blogpost);
                    that.blogposts.splice(index, 1);
                    $scope.parentScope.showToaster(false, true, "Post deleted successfully");
                }
            });
        };

        $scope.getAllBlogs = function() {
            return that.blogposts;
        }

        $scope.updateBlogPageData = function(iframe)
        {
            if (iframe && iframe.contentWindow) {
                var posts = iframe.contentWindow.body.querySelectorAll('.blog-entry');
                for (var i = 0; i < posts.length; i++) {
                    var blog_id = posts[i].attributes['data-id'].value;
                    var post_excerpt_div = posts[i].querySelectorAll('.post_excerpt');
                    var post_title_div = posts[i].querySelectorAll('.post_title');
                    var post_excerpt = post_excerpt_div.length ? post_excerpt_div[0].outerText : "";
                    var post_title = post_title_div.length ? post_title_div[0].outerText : "";
                    var matching_post = _.find(that.blogposts, function(item) {
                        return item._id === blog_id
                    })
                    if (matching_post) {
                        matching_post.post_excerpt = post_excerpt;
                        matching_post.post_title = post_title;                       
                    }
                }
            }
        }

        $scope.resfeshIframe = function() {
            //document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
        };

        $scope.updateWebsite = function(data) {
            $scope.$apply(function() {
                if (data)
                    that.website = data;
            });
        };


        $scope.updateComponents = function(data) {
            $scope.$apply(function() {
                var scroll = angular.element(window).scrollTop();
                $scope.currentpage.components = data;
                for (var i = 0; i < $scope.currentpage.components.length; i++) {
                    if ($scope.currentpage.components[i].type == 'navigation') {
                        var body = document.getElementsByTagName('body')[0];
                        body.className = body.className.replace('navbar-v', '');
                        body.className = body.className + ' navbar-v' + $scope.currentpage.components[i].version;
                    }
                    if ($scope.currentpage.components[i].type === 'thumbnail-slider') {
                        var w = angular.element($window);
                        var check_if_mobile = mobilecheck();
                        var thumbnailId = $scope.currentpage.components[i]._id;

                        var matching = _.find($scope.thumbnailSlider, function(item) {
                            return item.thumbnailId == thumbnailId
                        })

                        if (!matching) {
                            $scope.thumbnailSlider.push({
                                thumbnailId: thumbnailId,
                                thumbnailSliderCollection: angular.copy($scope.currentpage.components[i].thumbnailCollection)
                            });

                        } else
                            matching.thumbnailSliderCollection = angular.copy($scope.currentpage.components[i].thumbnailCollection);

                        var winWidth = w.width();
                        $scope.bindThumbnailSlider(w.width(), check_if_mobile, thumbnailId);
                    }

                    if ($scope.currentpage.components[i].type == 'single-post') {  
                        if(!$scope.blog)
                        {
                            $scope.blog = {};
                            $scope.blog.post = {};                      
                        }
                        $scope.blog.post.post_title = $scope.currentpage.components[i].post_title;
                        $scope.blog.post.post_excerpt = $scope.currentpage.components[i].post_excerpt;                    
                        $scope.blog.post.post_content = $scope.currentpage.components[i].post_content;
                        $scope.blog.post.publish_date = $scope.currentpage.components[i].publish_date;
                        $scope.blog.post.post_tags = $scope.currentpage.components[i].post_tags;
                        $scope.blog.post.post_author = $scope.currentpage.components[i].post_author || " ";
                    }

                    if ($scope.currentpage.components[i].type == 'masthead') {
                        if (i != 0 && $scope.currentpage.components[i-1].type == "navigation")
                        {
                            $scope.allowUndernav = true;
                            if($scope.currentpage.components[i].bg && $scope.currentpage.components[i].bg.img && $scope.currentpage.components[i].bg.img.undernav)
                                $scope.addUndernavClasses = true
                            else
                                $scope.addUndernavClasses = false;
                        }
                        else {
                            $scope.addUndernavClasses = false;
                            $scope.allowUndernav = false;
                        }

                    }

                };
                setTimeout(function() {
                    angular.element(window).scrollTop(scroll);
                }, 200);
            });
        };

        $scope.updateCustomComponent = function(data, networks) {
            var scroll = angular.element(window).scrollTop();
            //$scope.dataLoaded = false;
            if (data) {
                $scope.currentpage.components = data;

                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.activateCKEditor();
                        $scope.dataLoaded = true;
                    });
                });
            } else {
                $scope.$apply(function() {

                });
            }

            if (networks)
                $scope.networks = networks;

            for (var i = 0; i < $scope.currentpage.components.length; i++) {
                if ($scope.currentpage.components[i].type === 'thumbnail-slider') {
                    var w = angular.element($window);
                    var check_if_mobile = mobilecheck();
                    var thumbnailId = $scope.currentpage.components[i]._id;

                    var matching = _.find($scope.thumbnailSlider, function(item) {
                        return item.thumbnailId == thumbnailId
                    })

                    if (!matching) {
                        $scope.thumbnailSlider.push({
                            thumbnailId: thumbnailId,
                            thumbnailSliderCollection: angular.copy($scope.currentpage.components[i].thumbnailCollection)
                        });
                    } else
                        matching.thumbnailSliderCollection = angular.copy($scope.currentpage.components[i].thumbnailCollection);

                    var winWidth = w.width();
                    $scope.bindThumbnailSlider(w.width(), check_if_mobile, thumbnailId);
                }
            };
            setTimeout(function() {
                angular.element(window).scrollTop(scroll);
                //if(angular.element(".slick-slider"))         
                //angular.element(".slick-slider")[0].slick.refresh();
            }, 200);

        };

        $scope.updateContactComponent = function(data, networks) {
            if (data) {
                $scope.currentpage.components = data;
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.activateCKEditor();
                    });
                });
            } else {
                $scope.$apply(function() {

                });
            }
            for (var i = 0; i < $scope.currentpage.components.length; i++) {
                if ($scope.currentpage.components[i].type == 'contact-us') {
                    $scope.updateContactUsMap($scope.currentpage.components[i]);
                }
            };
        };

        $scope.addCKEditorImage = function(url, inlineInput, edit) {
            if(inlineInput)
            {
                if (edit)
                    inlineInput.val(url);
                else
                    inlineInput.insertHtml('<img data-cke-saved-src="' + url + '" src="' + url + '"/>');
            }
        };

        $scope.triggerEditMode = function() {
            var body = document.getElementsByTagName('body')[0];
            var hasClass = body.classList.contains('editing');
            if (hasClass === false) {
                body.className += ' editing';
            }
            window.oldScope.isEditing = true;
            // window.oldScope.$digest();
        };

        $scope.triggerEditModeOff = function() {
            var body = document.getElementsByTagName('body')[0];
            body.className = body.className.replace(/(?:^|\s)editing(?!\S)/, '');
            window.oldScope.isEditing = false;
            window.oldScope.$digest();
        };

        $scope.triggerFontUpdate = function(font) {
            WebFont.load({
                google: {
                    families: [font, 'undefined']
                }
            });

            angular.element('h1,h2,h3,h4,h5,h6,h1 .editable,h2 .editable,h3 .editable,h4 .editable,h5 .editable,h6 .editable ').each(function() {
                this.style.setProperty('font-family', font, 'important');
            });

        };

        if (!window.oldScope) {
            window.oldScope = $scope;
        }
        $scope.sortingLog = [];

        $scope.wait;

        $scope.sortableOptions = {
            parentElement: "body",
            dragStart: function(e, ui) {
                var componentId = e.source.itemScope.modelValue._id;
                e.source.itemScope.modelValue = $scope.parentScope.updateComponent(componentId);
                e.source.itemScope.element.addClass(" dragging");
                clearTimeout($scope.wait);
                $scope.parentScope.resizeIframe();
            },
            dragMove: function(e, ui) {
                console.log('sorting update');
            },
            dragEnd: function(e, ui) {
                e.dest.sortableScope.element.removeClass("dragging");
                $scope.wait = setTimeout(function() {
                    $scope.activateCKEditor();
                    angular.element(".ui-sortable").removeClass("active");
                }, 1500);

            for (var i = 0; i < $scope.currentpage.components.length; i++) {
                if ($scope.currentpage.components[i].type == 'masthead') {
                    if (i != 0 && $scope.currentpage.components[i-1].type == "navigation")
                        {
                            $scope.allowUndernav = true;
                            if($scope.currentpage.components[i].bg && $scope.currentpage.components[i].bg.img && $scope.currentpage.components[i].bg.img.undernav)
                                $scope.addUndernavClasses = true
                            else
                                $scope.addUndernavClasses = false;
                        }
                    else{
                        $scope.allowUndernav = false;
                        $scope.addUndernavClasses = false;
                    }

                    }
            };
            }
        };

        /********** END CMS RELATED **********/

        /********** SIGNUP SECTION **********/
        $scope.planStatus = {};
        $scope.$watch('currentpage.components', function(newValue, oldValue) {
            if (newValue) {
                
                $scope.dataLoaded = false;
                $scope.currentcomponents = newValue;
                newValue.forEach(function(value, index) {
                    
                    if (value.bg && value.bg.img && value.bg.img.url && !value.bg.color)
                        value.bg.img.show = true;
                    if (value && value.type === 'payment-form') {
                        var productId = value.productId;
                        ProductService.getProduct(productId, function(product) {
                            $scope.paymentFormProduct = product;
                            var promises = [];
                            $scope.subscriptionPlans = [];
                            if ('stripePlans' in $scope.paymentFormProduct.product_attributes) {
                                $scope.paymentFormProduct.product_attributes.stripePlans.forEach(function(value, index) {
                                    if (value.active)
                                        $scope.planStatus[value.id] = value;
                                    promises.push(PaymentService.getPlanPromise(value.id));
                                });
                                $q.all(promises)
                                    .then(function(data) {
                                        data.forEach(function(value, index) {
                                            $scope.subscriptionPlans.push(value.data);
                                            if ($scope.subscriptionPlans.length === 1) {
                                                var plan = $scope.subscriptionPlans[0];
                                                $scope.selectSubscriptionPlanFn(plan.id, plan.amount, plan.interval, $scope.planStatus[plan.id].signup_fee);
                                            }
                                        });
                                    })
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                            }
                        });
                    }
                    if (value && value.type === 'thumbnail-slider') {
                        var w = angular.element($window);
                        var check_if_mobile = mobilecheck();
                        var thumbnailId = value._id;

                        var matching = _.find($scope.thumbnailSlider, function(item) {
                            return item.thumbnailId == thumbnailId
                        })

                        if (!matching) {
                            $scope.thumbnailSlider.push({
                                thumbnailId: thumbnailId,
                                thumbnailSliderCollection: angular.copy(value.thumbnailCollection)
                            });
                        } else
                            matching.thumbnailSliderCollection = angular.copy(value.thumbnailCollection);
                        var winWidth = w.width();
                        $scope.bindThumbnailSlider(winWidth, check_if_mobile, thumbnailId);
                        w.bind('resize', function() {
                            $scope.$apply(function() {
                                $scope.bindThumbnailSlider(w.width(), check_if_mobile, thumbnailId);
                            });
                        });
                    }
                    if (value && value.type == 'contact-us') {
                        $scope.updateContactUsMap(value);
                    }
                    if (value && value.type == 'single-post') {  
                        if(!$scope.blog)
                        {
                            $scope.blog = {};
                            $scope.blog.post = {};                      
                        }                     
                        $scope.blog.post.post_title = value.post_title;
                        $scope.blog.post.post_excerpt = value.post_excerpt;
                        $scope.blog.post.post_content = value.post_content;
                        $scope.blog.post.publish_date = value.publish_date;
                        $scope.blog.post.post_tags = value.post_tags;
                        $scope.blog.post.post_author = value.post_author || " ";
                    }
                    if (value && value.type === 'masthead') {
                        if (index != 0 && $scope.currentpage.components[index-1].type == "navigation")
                           {
                            $scope.allowUndernav = true;
                            if(value.bg && value.bg.img && value.bg.img.undernav)
                                $scope.addUndernavClasses = true
                            else
                                $scope.addUndernavClasses = false
                            }
                        else
                            $scope.allowUndernav = false;
                    }
                });
            }
        });

        $scope.bindThumbnailSlider = function(width, is_mobile, thumbnailId) {
            var number_of_arr = 4;
            if (width <= 750 || is_mobile) {
                number_of_arr = 1;
            }
            $scope.imagesPerPage = number_of_arr;

            var matching = _.find($scope.thumbnailSlider, function(item) {
                return item.thumbnailId == thumbnailId
            })

            if (matching) {
                matching.thumbnailCollection = partition(matching.thumbnailSliderCollection, number_of_arr);
                if (matching.thumbnailCollection.length > 1)
                    matching.displayThumbnailPaging = true;
                else
                    matching.displayThumbnailPaging = false;
            }
        };

        function mobilecheck() {
            var check = false;
            (function(a, b) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        };

        $scope.isAdmin = function() {
            return $scope.isAdmin;
        };

        function partition(arr, size) {
            var newArr = [];
            var isArray = angular.isArray(arr[0]);
            if (isArray) {
                return arr;
            }
            for (var i = 0; i < arr.length; i += size) {
                newArr.push(arr.slice(i, i + size));
            }
            return newArr;
        };


        $scope.selectSubscriptionPlanFn = function(planId, amount, interval, cost) {
            $scope.newAccount.membership = planId;
            $scope.subscriptionPlanAmount = amount;
            $scope.subscriptionPlanInterval = interval;
            $scope.subscriptionPlanOneTimeFee = parseInt(cost);
        };
        $scope.monthly_sub_cost = 49.95;
        $scope.yearly_sub_cost = 32.91;
        $scope.selected_sub_cost = $scope.monthly_sub_cost;

        $scope.createUser = function(user, component) {
            angular.element("#user_email_" + component._id + " .error").html("");
            angular.element("#user_email_" + component._id).removeClass('has-error');
            angular.element("#user_email_" + component._id).removeClass('has-success');
            angular.element("#user_email_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
            angular.element("#user_email_" + component._id + " .glyphicon").removeClass('glyphicon-ok');
            angular.element("#user_phone_" + component._id + " .error").html("");
            angular.element("#user_phone_" + component._id).removeClass('has-error');
            angular.element("#user_phone_" + component._id).removeClass('has-success');
            angular.element("#user_phone_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
            angular.element("#user_phone_" + component._id + " .glyphicon").removeClass('glyphicon-ok');

            var fingerprint = new Fingerprint().get();
            var sessionId = ipCookie("session_cookie")["id"];

            if (!user || !user.email) {

                angular.element("#user_email_" + component._id + " .error").html("Email Required");
                angular.element("#user_email_" + component._id).addClass('has-error');
                angular.element("#user_email_" + component._id + " .glyphicon").addClass('glyphicon-remove');
                return;
            }

            var first_name = _.findWhere(component.fields, {
                name: 'first'
            });
            var last_name = _.findWhere(component.fields, {
                name: 'last'
            });
            var phone = _.findWhere(component.fields, {
                name: 'phone'
            });
            if (first_name)
                user.first = first_name.model;
            if (last_name)
                user.last = last_name.model;
            if (phone)
                user.phone = phone.model;

            if (user.phone) {
                var regex = /^\s*$|^(\+?1-?\s?)*(\([0-9]{3}\)\s*|[0-9]{3}-)[0-9]{3}-[0-9]{4}|[0-9]{10}|[0-9]{3}-[0-9]{4}$/;
                if (!regex.test(user.phone)) {
                    angular.element("#user_phone_" + component._id + " .error").html("Phone is invalid");
                    angular.element("#user_phone_" + component._id).addClass('has-error');
                    angular.element("#user_phone_" + component._id + " .glyphicon").addClass('glyphicon-remove');
                    return;
                }
            }
            if (user.email) {
                var regex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var result = regex.test(user.email);
                if (!result) {

                    angular.element("#user_email_" + component._id + " .error").html("Valid Email Required");
                    angular.element("#user_email_" + component._id).addClass('has-error');
                    angular.element("#user_email_" + component._id + " .glyphicon").addClass('glyphicon-remove');
                    return;
                }


                var skipWelcomeEmail;

                if (component.skipWelcomeEmail) {
                    skipWelcomeEmail = true;
                }
                var formatted = {
                    fingerprint: fingerprint,
                    sessionId: sessionId,
                    first: user.first,
                    last: user.last,
                    details: [{
                        emails: [],
                        phones: []
                    }],
                    campaignId: component.campaignId,
                    skipWelcomeEmail: skipWelcomeEmail,
                    fromEmail: component.from_email
                };
                formatted.details[0].emails.push({
                    email: user.email
                });
                if (user.phone) {
                    formatted.details[0].phones.push({
                        number: user.phone,
                        type: 'm'
                    });
                }

                //create contact
                userService.addContact(formatted, function(data, err) {
                    if (err && err.code === 409) {
                        // angular.element("#input-company-name").val('');

                        angular.element("#user_email_" + component._id + " .error").html("Email already exists");
                        angular.element("#user_email_" + component._id).addClass('has-error');
                        angular.element("#user_email_" + component._id + " .glyphicon").addClass('glyphicon-remove');

                    } else if (data) {
                        angular.element("#user_email_" + component._id + " .error").html("");
                        angular.element("#user_email_" + component._id).removeClass('has-error')
                        angular.element("#user_email_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
                        user.email = "";
                        component.fields.forEach(function(value) {
                            value.model = null;
                        })
                        user.success = true;

                        var name;

                        if (user.first && user.last) {
                            name = user.first + ' ' + user.last;
                        } else {
                            name = 'John Doe';
                        }

                        var hash = CryptoJS.HmacSHA256(user.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
                        //send data to intercom
                        $window.intercomSettings = {
                            name: user.first + ' ' + user.last,
                            email: user.email,
                            phone: user.phone,
                            user_hash: hash.toString(CryptoJS.enc.Hex),
                            created_at: new Date().getTime(),
                            app_id: "b3st2skm"
                        };

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

        $scope.createContactwithFormActivity = function(contact, component) {
            angular.element("#contact_email_" + component._id + " .error").html("");
            angular.element("#contact_email_" + component._id).removeClass('has-error');
            angular.element("#contact_email_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
            angular.element("#contact_email_" + component._id + " .glyphicon").removeClass('glyphicon-ok');
            angular.element("#contact_email_" + component._id).removeClass('has-success');
            angular.element("#contact_phone_" + component._id + " .error").html("");
            angular.element("#contact_phone_" + component._id).removeClass('has-error');
            angular.element("#contact_phone_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
            angular.element("#contact_phone_" + component._id + " .glyphicon").removeClass('glyphicon-ok');
            angular.element("#contact_phone_" + component._id).removeClass('has-success');
            
            if (!contact || !contact.email) {
                angular.element("#contact_email_" + component._id + " .error").html("Email Required");
                angular.element("#contact_email_" + component._id).addClass('has-error');
                angular.element("#contact_email_" + component._id + " .glyphicon").addClass('glyphicon-remove');
                return;
            }

            var first_name = _.findWhere(component.fields, {
                name: 'first'
            });
            var last_name = _.findWhere(component.fields, {
                name: 'last'
            });
            var phone = _.findWhere(component.fields, {
                name: 'phone'
            });
            if (first_name)
                contact.first_name = first_name.model;
            if (last_name)
                contact.last_name = last_name.model;
            if (phone)
                contact.phone = phone.model;

            if (contact.phone) {
                var regex = /^\s*$|^(\+?1-?\s?)*(\([0-9]{3}\)\s*|[0-9]{3}-)[0-9]{3}-[0-9]{4}|[0-9]{10}|[0-9]{3}-[0-9]{4}$/;
                if (!regex.test(contact.phone)) {
                    angular.element("#contact_phone_" + component._id + " .error").html("Phone is invalid");
                    angular.element("#contact_phone_" + component._id).addClass('has-error');
                    angular.element("#contact_phone_" + component._id + " .glyphicon").addClass('glyphicon-remove');
                    return;
                }
            }
            if (contact.email) {
                if (contact.full_name) {
                    var full_name = contact.full_name.split(" ")
                    contact.first_name = full_name[0];
                    contact.last_name = full_name[1];
                }
                var contact_info = {
                    first: contact.first_name,
                    last: contact.last_name,
                    fromEmail: component.from_email,
                    details: [{
                        emails: [],
                        phones: []
                    }],
                    activity: {
                        activityType: 'CONTACT_FORM',
                        note: "Contact form data.",
                        sessionId: ipCookie("session_cookie")["id"],
                        contact: contact
                    }
                };

                contact_info.details[0].emails.push({
                    email: contact.email
                });
                if (contact.phone) {
                    contact_info.details[0].phones.push({
                        number: contact.phone,
                        type: 'm'
                    });
                }


                userService.addContact(contact_info, function(data, err) {
                    if (err && err.code === 409) {
                        // angular.element("#input-company-name").val('');
                        angular.element("#contact_email_" + component._id + " .error").html("Email already exists");
                        angular.element("#contact_email_" + component._id).addClass('has-error');
                        angular.element("#contact_email_" + component._id + " .glyphicon").addClass('glyphicon-remove');

                    } else if (data) {
                        angular.element("#contact_email_" + component._id + " .error").html("");
                        angular.element("#contact_email_" + component._id).removeClass('has-error');
                        angular.element("#contact_email_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
                        contact.email = '';
                        contact.message = '';
                        contact.success = true;
                        component.fields.forEach(function(value) {
                            value.model = null;
                        })
                        setTimeout(function() {
                            $scope.$apply(function() {
                                contact.success = false;
                            });
                        }, 3000);
                    }

                });
            }


            //create contact


            //redirect to signup with details
            //window.location.href = "http://app.indigenous.local:3000/signup";
        };

        $scope.removeAccount = function(type) {
            $scope.newAccount.businessName = null;
            $scope.newAccount.profilePhoto = null;
            $scope.newAccount.tempUserId = null;
            $scope.newAccount.email = null;
            $scope.tmpAccount.tempUser = null;
        };

        $scope.makeSocailAccount = function(socialType) {
            if (socialType) {
                window.location.href = "/signup/" + socialType + "?redirectTo=/signup";
                return;
            }
        };
        if ($scope.$location.$$path === '/signup') {
            userService.getTmpAccount(function(data) {
                $scope.tmpAccount = data;
            });
        };

        $scope.showFooter = function(status) {
            if (status)
                angular.element("#footer").show();
            else
                angular.element("#footer").hide();
        };

        $scope.createAccount = function(newAccount) {
            //validate
            //email
            $scope.isFormValid = false;
            $scope.showFooter(true);
            if (!$scope.newAccount.email) {
                $scope.checkEmailExists(newAccount);
                return;
            }

            //pass
            if (!$scope.newAccount.password && !$scope.newAccount.tempUserId) {
                $scope.checkPasswordLength(newAccount);
                return;
            }

            //url
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
                number: angular.element('#number').val(),
                cvc: angular.element('#cvc').val(),
                exp_month: parseInt(angular.element('#expiry').val().split('/')[0]),
                exp_year: parseInt(angular.element('#expiry').val().split('/')[1])
            };

            var cc_name = angular.element('#name').val();

            if (!newAccount.card.number || !newAccount.card.cvc || !newAccount.card.exp_month || !newAccount.card.exp_year) {
                //|| !cc_name
                //hightlight card in red
                $scope.checkCardNumber();
                $scope.checkCardExpiry();
                $scope.checkCardCvv();
                return;
            }
            $scope.checkCoupon();
            if(!$scope.couponIsValid) {
                return;
            }
            //end validate
            $scope.isFormValid = true;
            $scope.showFooter(false);
            var tmpAccount = $scope.tmpAccount;
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
                        $scope.$apply(function() {
                            $scope.isFormValid = false;
                            $scope.showFooter(true);
                        })
                        switch (error.param) {
                            case "number":
                                angular.element("#card_number .error").html(error.message);
                                angular.element("#card_number").addClass('has-error');
                                angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                                break;
                            case "exp_year":
                                angular.element("#card_expiry .error").html(error.message);
                                angular.element("#card_expiry").addClass('has-error');
                                angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
                                break;
                            case "cvc":
                                angular.element("#card_cvc .error").html(error.message);
                                angular.element("#card_cvc").addClass('has-error');
                                angular.element("#card_cvc .glyphicon").addClass('glyphicon-remove');
                                break;
                        }
                    } else {
                        newUser.cardToken = token;
                        newUser.plan = $scope.newAccount.membership;
                        newUser.anonymousId = window.analytics.user().anonymousId();
                        newUser.permanent_cookie = ipCookie("permanent_cookie");
                        newUser.fingerprint = new Fingerprint().get();
                        if ($scope.subscriptionPlanOneTimeFee) {
                            newUser.setupFee = $scope.subscriptionPlanOneTimeFee * 100;
                        }
                        userService.initializeUser(newUser, function(data) {
                            if (data && data.accountUrl) {
                                /*
                                 * I'm not sure why these lines were added.  The accountUrl is a string.
                                 * It will never have a host attribute.
                                 *
                                 * var currentHost = $.url(window.location.origin).attr('host');
                                 * var futureHost = $.url(data.accountUrl).attr('host');
                                 * if (currentHost.indexOf(futureHost) > -1) {
                                 *      window.location = data.accountUrl;
                                 * } else {
                                 *      window.location = currentHost;
                                 * }
                                 */
                                window.location = data.accountUrl;
                            } else {
                                $scope.isFormValid = false;
                                $scope.showFooter(true);
                            }
                        });
                    }

                });

            });
        };

        $scope.newAccount = {};

        $scope.checkDomainExists = function(newAccount) {
            if (!newAccount.businessName) {
                angular.element("#business-name .error").html("Url Required");
                angular.element("#business-name").addClass('has-error');
                angular.element("#business-name .glyphicon").addClass('glyphicon-remove');
            } else {
                var name = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                userService.checkDomainExists(name, function(data) {
                    if (data != 'true') {
                        angular.element("#business-name .error").html("Domain Already Exists");
                        angular.element("#business-name").addClass('has-error');
                        angular.element("#business-name .glyphicon").addClass('glyphicon-remove');
                    } else {
                        angular.element("#business-name .error").html("");
                        angular.element("#business-name").removeClass('has-error').addClass('has-success');
                        angular.element("#business-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    }
                });
            }
        };

        $scope.checkEmailExists = function(newAccount) {
            $scope.newAccount.email = newAccount.email;
            if (!newAccount.email) {
                angular.element("#email .error").html("Email Required");
                angular.element("#email").addClass('has-error');
                angular.element("#email .glyphicon").addClass('glyphicon-remove');
            } else {
                userService.checkEmailExists(newAccount.email, function(data) {
                    if (data === 'true') {
                        angular.element("#email .error").html("Email Already Exists");
                        angular.element("#email").addClass('has-error');
                        angular.element("#email .glyphicon").addClass('glyphicon-remove');
                    } else {
                        angular.element("#email .error").html("");
                        angular.element("#email").removeClass('has-error').addClass('has-success');
                        angular.element("#email .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    }
                });
            }
        };

        $scope.checkPasswordLength = function(newAccount) {
            if (!newAccount.password) {
                angular.element("#password .error").html("Password must contain at least 5 characters");
                angular.element("#password").addClass('has-error');
                angular.element("#password .glyphicon").addClass('glyphicon-remove');
            } else {
                angular.element("#password .error").html("");
                angular.element("#password").removeClass('has-error').addClass('has-success');
                angular.element("#password .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
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
            var card_number = angular.element('#number').val();
            if (!card_number) {
                angular.element("#card_number .error").html("Card Number Required");
                angular.element("#card_number").addClass('has-error');
                angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
            } else {
                angular.element("#card_number .error").html("");
                angular.element("#card_number").removeClass('has-error').addClass('has-success');
                angular.element("#card_number .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
            }
        };

        $scope.checkCardExpiry = function() {
            var expiry = angular.element('#expiry').val();
            var card_expiry = expiry.split("/")
            var exp_month = card_expiry[0].trim();
            var exp_year;
            if (card_expiry.length > 1)
                exp_year = card_expiry[1].trim();

            if (!expiry || !exp_month || !exp_year) {
                if (!expiry)
                    angular.element("#card_expiry .error").html("Expiry Required");
                else if (!exp_month)
                    angular.element("#card_expiry .error").html("Expiry Month Required");
                else if (!exp_year)
                    angular.element("#card_expiry .error").html("Expiry Year Required");
                angular.element("#card_expiry").addClass('has-error');
                angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
            } else {
                angular.element("#card_expiry .error").html("");
                angular.element("#card_expiry .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                angular.element("#card_expiry").removeClass('has-error').addClass('has-success');
            }
        };

        $scope.checkCardCvv = function() {
            var card_cvc = angular.element('#cvc').val();
            if (!card_cvc) {
                angular.element("#card_cvc .error").html("CVC Required");
                angular.element("#card_cvc").addClass('has-error');
                angular.element("#card_cvc .glyphicon").addClass('glyphicon-remove');
            } else {
                angular.element("#card_cvc .error").html("");
                angular.element("#card_cvc").removeClass('has-error').addClass('has-success');
                angular.element("#card_cvc .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
            }
        };

        $scope.checkCoupon = function() {
            console.log('>> checkCoupon');
            var coupon = $scope.newAccount.coupon
            //console.dir(coupon);
            //console.log($scope.newAccount.coupon);
            if(coupon) {
                PaymentService.validateCoupon(coupon, function(data){
                    if(data.id && data.id === coupon) {
                        console.log('valid');
                        angular.element("#coupon-name .error").html("");
                        angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
                        angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        $scope.couponIsValid = true;
                    } else {
                        console.log('invalid');
                        angular.element("#coupon-name .error").html("Invalid Coupon");
                        angular.element("#coupon-name").addClass('has-error');
                        angular.element("#coupon-name .glyphicon").addClass('glyphicon-remove');
                        $scope.couponIsValid = false;
                    }
                });
            } else {
                angular.element("#coupon-name .error").html("");
                angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
                angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                $scope.couponIsValid = true;
            }
        };

        $scope.checkCardName = function() {
            var name = $('#card_name #name').val();
             if (name) {
                $("#card_name .error").html("");
                $("#card_name").removeClass('has-error').addClass('has-success');
                $("#card_name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
            }
        };

        /********** END SIGNUP SECTION **********/

        $scope.addImage = function(component) {
            parent.angular.element('body').trigger('add_image');
        };
        $scope.DeleteImageFromGallery = function(componentId, index) {
            $scope.parentScope.deleteImageFromGallery(componentId, index);
        };
        $scope.AddImageToGallery = function(componentId, index) {
            $scope.parentScope.addImageToGallery(componentId, index);
        };
        $scope.deleteImageFromThumbnail = function(componentId, index, parentIndex) {
            var imageIndex = parentIndex > 0 ? (parentIndex * $scope.imagesPerPage + index) : index;
            $scope.parentScope.deleteImageFromThumbnail(componentId, imageIndex);
        };
        $scope.addImageToThumbnail = function(componentId) {
            $scope.parentScope.addImageToThumbnail(componentId);
        };

        $scope.feature_inserted = false;
        $scope.team_inserted = false;
        angular.element('body').on("DOMNodeInserted", ".feature", function (e)
            {
                setTimeout(function() {
                  if(!$scope.feature_inserted)
                  {
                   $scope.feature_inserted = true; 
                   for (var i = 0; i <= 3; i++) { 
                      if($("div.feature-height-"+i).length)
                      {
                        var maxFeatureHeight = Math.max.apply(null, $("div.feature-height-"+i).map(function ()
                        {
                            return $(this).height();
                         }).get());

                        $("div.feature-height-"+ i + " .feature-single").css("min-height", maxFeatureHeight - 20);
                      }
                    }
                    $scope.feature_inserted = true;
                  }  
                }, 1000)
            })

        angular.element('body').on("DOMNodeInserted", ".meet-team-height", function(e) {
            setTimeout(function() {
                if (!$scope.team_inserted) {
                    $scope.team_inserted = true;
                    if (angular.element("div.meet-team-height").length) {
                        var maxTeamHeight = Math.max.apply(null, angular.element("div.meet-team-height").map(function() {
                            return angular.element(this).height();
                        }).get());
                        angular.element(".meet-team-height").css("min-height", maxTeamHeight + 10);
                    }
                }
            }, 1000)
        });

        angular.element('body').on("click", ".navbar-toggle", function(e) {
            $scope.setUnderbnavMargin();
        });

        angular.element($window).bind('resize', function() {
            $scope.setUnderbnavMargin();
            $scope.feature_inserted = false;
            if(!$scope.feature_inserted)
                  {
                   $scope.feature_inserted = true;
                   for (var i = 0; i <= 3; i++) {
                      if($("div.feature-height-"+i).length)
                      {
                        var maxFeatureHeight = Math.max.apply(null, $("div.feature-height-"+i).map(function ()
                        {
                            return $(this).height();
                         }).get());
                        $("div.feature-height-"+ i + " .feature-single").css("min-height", maxFeatureHeight - 20);
                      }
                    }
                    $scope.feature_inserted = true;
                  }
        });
        $scope.setUnderbnavMargin = function() {
            setTimeout(function() {
                if($scope.addUndernavClasses)
                {
                    var navHeight = angular.element("#bs-example-navbar-collapse-1").height();
                    var margin = 200 + navHeight;
                   if(angular.element(".mt200"))
                        angular.element(".mt200").css("margin-top", -margin);
                   if(angular.element(".mastHeadUndernav"))
                        angular.element(".mastHeadUndernav").css("height", margin);
                   if(angular.element(".masthead-actions"))
                        angular.element(".masthead-actions").css("margin-top", margin-4);

                }
                else
                {
                    if(angular.element(".mt200"))
                        angular.element(".mt200").css("margin-top", 0);
                    if(angular.element(".masthead-actions"))
                        angular.element(".masthead-actions").css("margin-top", 0);
                }
               
            },300);
        };

        if($scope.parentScope)
            angular.element("body").on("DOMNodeInserted", ".editable", function(e) {
                if (!$scope.activated) {
                  $scope.activated = true;
                  setTimeout(function() {
                    console.log("Activate Ckeditor")
                    $scope.activateCKEditor();
                  }, 1000)
                }
            });
    }

]);