define([
    'app',
    'websiteService',
    'jqueryUI',
    'angularUI',
    'userService',
    'ngAnimate',
    'toaster',
    'colorpicker',
    'angularBootstrapSwitch',
    'ngProgress',
    'unsafeHtml',
    'html2plain',
    'mediaDirective',
    'confirmClick2',
    'confirmClickDirective',
    'courseServiceAdmin',
    'navigationService',
    'draggableModalDirective',
    'bootstrap-iconpicker-font-awesome',
    'bootstrap-iconpicker',
    'ngSweetAlert',
    'blockUI',
    'adminValidationDirective','constants',
], function(app) {
    app.register.controller('WebsiteCtrl', [
        '$scope',
        '$window',
        '$timeout',
        '$location',
        'WebsiteService',
        'UserService',
        'toaster',
        'ngProgress',
        '$rootScope',
        'CourseService',
        'NavigationService',
        'SweetAlert',
        'blockUI',
        function($scope, $window, $timeout, $location, WebsiteService, UserService, toaster, ngProgress, $rootScope, CourseService, NavigationService, SweetAlert, blockUI) {
            var user, account, components, currentPageContents, previousComponentOrder, allPages, originalCurrentPageComponents = that = this;
            ngProgress.start();

            if ($location.$$search['pagehandle']) {
                document.getElementById("iframe-website").setAttribute("src", '/page/' + $location.$$search['pagehandle'] + '?editor=true');
            }

            if ($location.$$search['posthandle']) {
                document.getElementById("iframe-website").setAttribute("src", '/page/blog/' + $location.$$search['posthandle'] + '?editor=true');
            }

            // if ($location.$$search['custid']) {
            //     current_src = document.getElementById("iframe-website").getAttribute("src");
            //     document.getElementById("iframe-website").setAttribute("src", current_src + '&custid=' + $location.$$search['custid']);
            // }

            NavigationService.updateNavigation();
            $scope.$back = function() {
                window.history.back();
            };
            var editBlockUI = blockUI.instances.get('editBlockUI');
            editBlockUI.start("Initializing Edit Mode");
            var iFrame = document.getElementById("iframe-website");
            var subdomainCharLimit = 4;
            $scope.primaryFontStack = '';
            $scope.secondaryFontStack = '';
            $scope.iframeData = {};
            $scope.allPages = [];
            $scope.backup = {};
            $scope.components = [];
            $scope.isEditing = true;
            $scope.isMobile = false;
            $scope.tabs = {};
            $scope.addLinkType = 'page';
            $scope.saveLoading = false;
            $scope.hours = $$.constants.contact.business_hour_times;
            $scope.components.sort(function(a, b) {
                return a.i > b.i;
            });

            $scope.status = {
                isopen: false
            };

            $scope.spectrum = {
                options: {
                    showPalette: true,
                    clickoutFiresChange: true,
                    showInput: true,
                    showButtons: false,
                    allowEmpty: true,
                    hideAfterPaletteSelect: false,
                    showPaletteOnly: true,
                    togglePaletteOnly: true,
                    togglePaletteMoreText: 'more',
                    togglePaletteLessText: 'less',
                    appendTo: $("#component-setting-modal"),
                    palette: [
                        ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
                        ["#F08F907", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
                        ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
                        ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
                        ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
                        ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
                        ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
                        ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
                        ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6"]
                    ]
                }
            }

            //get all the courses avliable
            CourseService.getAllCourses(function(data) {
                $scope.courses = data;
            });

            UserService.getAccount(function(account) {
                $scope.account = account;
                that.account = account;
                //get pages and find this page
                WebsiteService.getPages(account.website.websiteId, function(pages) {
                    //TODO should be dynamic based on the history
                    currentPage = 'index';
                    that.allPages = pages;
                    var parsed = angular.fromJson(pages);
                    var arr = [];

                    for (var x in parsed) {
                        arr.push(parsed[x]);
                    }
                    $scope.allPages = arr;

                    //$scope.currentPage = _.findWhere(pages, {
                    //  handle: currentPage
                    //});

                    if ($scope.editingPageId) {
                        $scope.currentPage = _.findWhere(pages, {
                            _id: $scope.editingPageId
                        });
                        // if ($scope.currentPage && $scope.currentPage.components) {
                        //     $scope.components = $scope.currentPage.components;
                        // } else {
                        //     $scope.components = [];
                        // }
                        // console.log('$scope.currentPage >>> ', $scope.currentPage);
                        // $scope.resfeshIframe();
                    } else {
                        //$scope.currentPage = _.findWhere(pages, {
                        //    handle: currentPage
                        //});
                    }
                    //get components from page
                    if ($scope.currentPage) {
                        if ($scope.currentPage.components) {
                            $scope.components = $scope.currentPage.components;
                            if ($location.$$search['posthandle']) {
                                //$scope.updatePage("post", true);
                            }
                        }
                    } else {
                        console.log('Falied to retrieve Page');
                    }

                });

                //get website
                WebsiteService.getWebsite(account.website.websiteId, function(website) {

                    $scope.website = website;
                    $scope.website.settings = $scope.website.settings || {};

                    $scope.primaryColor = $scope.website.settings.primary_color;
                    $scope.secondaryColor = $scope.website.settings.secondary_color;
                    $scope.primaryHighlight = $scope.website.settings.primary_highlight;
                    $scope.primaryTextColor = $scope.website.settings.primary_text_color;
                    $scope.primaryFontFamily = $scope.website.settings.font_family;
                    $scope.secondaryFontFamily = $scope.website.settings.font_family_2;
                    $scope.googleFontFamily = $scope.website.settings.google_font_family;

                    $scope.primaryFontStack = $scope.website.settings.font_family;
                    $scope.secondaryFontStack = $scope.website.settings.font_family_2;
                });

                //get themes
                WebsiteService.getThemes(function(themes) {
                    $scope.themes = themes;
                    $scope.currentTheme = _.findWhere($scope.themes, {
                        _id: account.website.themeId
                    });
                });
            });

            //an array of component types and icons for the add component modal
            $scope.componentTypes = [{
                title: 'Blog',
                type: 'blog',
                icon: 'custom blog',
                enabled: false
            }, {
                title: 'Masthead',
                type: 'masthead',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/masthead.jpg',
                enabled: true
            }, {
                title: 'Feature List',
                type: 'feature-list',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-list.jpg',
                enabled: true
            }, {
                title: 'Contact Us',
                type: 'contact-us',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/contact-us.jpg',
                enabled: true
            }, {
                title: 'Coming Soon',
                type: 'coming-soon',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/coming-soon.jpg',
                enabled: true
            }, {
                title: 'Feature block',
                type: 'feature-block',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-block.jpg',
                enabled: true
            }, {
                title: 'Image Gallery',
                type: 'image-gallery',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/gallery.jpg',
                enabled: true
            }, {
                title: 'Image Text',
                version: 1,
                type: 'image-text',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/image-text.jpg',
                enabled: true
            }, {
                title: 'Meet Team',
                type: 'meet-team',
                icon: 'fa fa-users',
                enabled: true
            }, {
                title: 'Navigation 1',
                type: 'navigation',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/navbar-v1.jpg',
                version: 1,
                enabled: true
            }, {
                title: 'Navigation 2',
                type: 'navigation',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v2-preview.png',
                version: 2,
                enabled: true
            }, {
                title: 'Navigation 3',
                type: 'navigation',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v3-preview.png',
                version: 3,
                enabled: true
            }, {
                title: 'Products',
                type: 'products',
                icon: 'fa fa-money',
                enabled: false
            },
            {
                title: 'Pricing Tables',
                type: 'pricing-tables',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/pricing-tables.png',
                enabled: true
            },
             {
                title: 'Simple form',
                type: 'simple-form',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/simple-form.jpg',
                enabled: true
            }, {
                title: 'Single Post',
                type: 'single-post',
                icon: 'custom single-post',
                enabled: false
            }, {
                title: 'Social',
                type: 'social-link',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/social-links.jpg',
                enabled: true
            }, {
                title: 'Video',
                type: 'video',
                icon: 'fa fa-video',
                enabled: true
            }, {
                title: 'Text Only',
                type: 'text-only',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/text-block.jpg',
                enabled: true
            }, {
                title: 'Thumbnail Slider',
                type: 'thumbnail-slider',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/thumbnail.png',
                enabled: true
            }, {
                    title: 'Top Bar',
                    type: 'top-bar',
                    icon: 'fa fa-info',
                    enabled: true
            }
            ];

            /*****
                {
                    title: 'Customer SignUp',
                    type: 'customer-signup',
                    icon: 'fa fa-male',
                    enabled: false
                },
                {
                    title: 'Customer Login',
                    type: 'customer-login',
                    icon: 'fa fa-sign-in',
                    enabled: false
                },
                {
                    title: 'Customer Forgot Password',
                    type: 'customer-forgot-password',
                    icon: 'fa fa-lock',
                    enabled: false
                },
                {
                    title: 'Customer Account',
                    type: 'customer-account',
                    icon: 'fa fa-user',
                    enabled: false
                },
                {
                    title: 'Logo List',
                    type: 'logo-list',
                    icon: 'custom logo-list',
                    enabled: false
                },
                {
                    title: 'Image Slider',
                    type: 'image-slider',
                    icon: 'custom image-slider',
                    enabled: false
                },
                {
                    title: 'Campaign',
                    type: 'campaign',
                    icon: 'fa fa-bullhorn',
                    enabled: false
                },
                {
                    title: 'Footer',
                    type: 'footer',
                    icon: 'custom footer',
                    enabled: false
                }
            *****/
            $scope.activated = false;
            document.getElementById("iframe-website").onload = function() {

                ngProgress.complete();
                $scope.updatePage($location.$$search['pagehandle'], true);
                //$scope.bindEvents();
                // var iframe = document.getElementById("iframe-website");
                // var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                // // to do need to check when iframe content is loaded properly
                if ($scope.isEditing) {
                    if ($("#iframe-website").contents().find("body").length) {
                        setTimeout(function() {
                            $scope.editPage();
                            $scope.iframeLoaded = true;
                            editBlockUI.stop();
                        }, 5000)
                    }
                }

            }

            $scope.bindEvents = function() {
                var iframe = document.getElementById("iframe-website");
                if (!iframe)
                    return;
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                //wait for iframe to load completely
                //TODO: get trigger instead of timeout
                var elementBindingFn = function() {
                    //unhide no-component
                    if (iframeDoc.body.querySelectorAll('.no-component')[0]) {
                        iframeDoc.body.querySelectorAll('.no-component')[0].style.display = "block";
                        iframeDoc.body.querySelectorAll('.no-component')[0].style.visibility = "visible";
                    }
                    //Disable all links in edit
                    $("#iframe-website").contents().find('body').on("click", ".component a", function(e) {
                        if(!$(this).hasClass("clickable-link")) {
                            e.preventDefault();
                            e.stopPropagation();    
                        }
                    });

                    //add click events for all the settings buttons
                    $("#iframe-website").contents().find('body').on("click", ".componentActions .settings, .map-wrap .settings", function(e) {
                        if (e.currentTarget.attributes['tab-active'] && e.currentTarget.attributes['tab-active'].value === "address")
                            $scope.tabs.address = true;
                        $scope.editComponent(e.currentTarget.attributes['data-id'].value);
                        var element = angular.element('#component-setting-modal');
                        element.modal('show');
                    });

                    //add click events for all the add component buttons.
                    $("#iframe-website").contents().find('body').on("click", ".add-component", function(e) {
                        $scope.editComponentIndex = e.currentTarget.attributes['data-index'].value;
                        var element = angular.element('#add-component-modal');
                        element.modal('show');
                    });

                    //add click events for all the delete component buttons.
                    $("#iframe-website").contents().find('body').on("click", ".delete-component", function(e) {
                        SweetAlert.swal({
                                title: "Are you sure?",
                                text: "Do you want to delete this component?",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Yes, delete it!",
                                cancelButtonText: "No, do not delete it!",
                                closeOnConfirm: true,
                                closeOnCancel: true
                            },
                            function(isConfirm) {
                                if (isConfirm) {
                                    $scope.deleteComponent(e.currentTarget.attributes['data-id'].value);
                                };
                            });
                    });

                    $("#iframe-website").contents().find('body').on("DOMNodeInserted", ".editable", function(e) {
                        if (!$scope.activated) {
                            $scope.activated = true;
                            setTimeout(function() {
                                iFrame.contentWindow.activateAloha && iFrame.contentWindow.activateAloha();
                            }, 1000)
                        }
                    });

                    //add media modal click events to all images in image gallery

                    $("#iframe-website").contents().find('body').on("click", ".image-gallery, .image-thumbnail, .meet-team-image", function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $("#media-manager-modal").modal('show');
                        $(".insert-image").removeClass("ng-hide");
                        $scope.imageChange = true;
                        $scope.componentArrTarget = e.currentTarget;
                        $scope.componentImageIndex = e.currentTarget.attributes["data-index"].value;
                        if (e.currentTarget.attributes["parent-index"] && e.currentTarget.attributes["number-per-page"]) {
                            $scope.componentImageIndex = (parseInt(e.currentTarget.attributes["parent-index"].value) * parseInt(e.currentTarget.attributes["number-per-page"].value)) + parseInt(e.currentTarget.attributes["data-index"].value);
                        }
                        $scope.componentEditing = _.findWhere($scope.components, {
                            _id: $(e.currentTarget).closest('.component').data('id')
                        });
                    });
                };

                if (iframeDoc.getElementById('body')) {
                    elementBindingFn();
                }
            };

            $scope.toggled = function(open) {

                //console.log('Dropdown is now: ', open);
            };

            $scope.toggleDropdown = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };

            $scope.resfeshIframe = function() {
                console.log('refresh iframe');
                // document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
                // $scope.components = $scope.currentPage.components;
            };

            $scope.editPage = function() {
                $scope.isEditing = true;

                var iframe = document.getElementById("iframe-website");
                if (iframe.contentWindow.triggerEditMode)
                    iframe.contentWindow.triggerEditMode();

                if (iframe.contentWindow.copyPostMode) {
                    iframe.contentWindow.copyPostMode();
                    $scope.post_data = iframe.contentWindow.getPostData();
                    $scope.single_post = true;
                }
                $scope.activateAloha();
                $scope.backup['website'] = angular.copy($scope['website']);
                UserService.getUserPreferences(function(preferences) {
                    preferences.lastPageHandle = $scope.pageSelected;
                    UserService.updateUserPreferences(preferences, false, function() {});
                });
            };

            $scope.cancelPage = function() {
                // $scope.components = that.originalCurrentPageComponents;
                $scope.changesConfirmed = true;
                var pageId = $scope.currentPage._id;
                //$scope.deactivateAloha && $scope.deactivateAloha();
                $scope.deactivateAloha();
                WebsiteService.getPageComponents(pageId, function(components) {
                    $scope.components = components;

                    $scope.updateIframeComponents && $scope.updateIframeComponents();
                    $scope.isEditing = false;
                    $scope.componentEditing = null;
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.triggerEditModeOff && iFrame.contentWindow.triggerEditModeOff();

                    window.history.back();
                });


                //TODO Only use on single post
                // iFrame && iFrame.contentWindow && iFrame.contentWindow.updatePostMode && iFrame.contentWindow.updatePostMode();

                // $scope['website'] = angular.copy($scope.backup['website']);
                // $scope.backup = {};
                // $scope.primaryFontStack = $scope.website.settings.font_family;
                // $scope.secondaryFontStack = $scope.website.settings.font_family_2;
                // iFrame && iFrame.contentWindow && iFrame.contentWindow.triggerFontUpdate && iFrame.contentWindow.triggerFontUpdate($scope.website.settings.font_family)
            };

            $scope.editPageValidated = false;

            $scope.validateEditPage = function(page) {
                if (page.handle == '') {
                    $scope.handleError = true;
                    $('#edit-page-url').parents('div.form-group').addClass('has-error');
                } else {
                    $scope.handleError = false;
                    $('#edit-page-url').parents('div.form-group').removeClass('has-error');
                }
                if (page.title == '') {
                    $scope.titleError = true;
                    $('#edit-page-title').parents('div.form-group').addClass('has-error');
                } else {
                    $scope.titleError = false;
                    $('#edit-page-title').parents('div.form-group').removeClass('has-error');
                }
                if (page && page.title && page.title != '' && page.handle && page.handle != '') {
                    $scope.editPageValidated = true;
                }
            };

            //TODO: use scope connection
            $scope.savePage = function() {
                $scope.saveLoading = true;
                var iFrame = document.getElementById("iframe-website");
                if (iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty) {
                    iFrame.contentWindow.checkOrSetPageDirty(true);
                }
                if ($location.$$search['posthandle']) {
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.savePostMode && iFrame.contentWindow.savePostMode(toaster);
                    $scope.isEditing = true;
                } else {
                    $scope.validateEditPage($scope.currentPage);
                    console.log('$scope.editPageValidated ', $scope.editPageValidated);

                    if (!$scope.editPageValidated) {
                        $scope.saveLoading = false;
                        toaster.pop('error', "Page Title or URL can not be blank.");
                        return false;
                    } else {
                      for (var i = 0; i < that.allPages.length; i++) {
                        if (that.allPages[i].handle === $scope.currentPage.handle && that.allPages[i]._id != $scope.currentPage._id) {
                            toaster.pop('error', "Page URL " + $scope.currentPage.handle, "Already exists");
                            $scope.saveLoading = false;
                            $('#edit-page-url').parents('div.form-group').addClass('has-error');
                            return false;
                            }
                        };  
                        
                    }
                    var componentJSON = $scope.currentPage.components;
                    var pageId = $scope.currentPage._id;

                    var componentIdArr = [];

                    //foreach components by class .component
                    var editedPageComponents = iFrame.contentWindow.document.getElementsByTagName("body")[0].querySelectorAll('.component');
                    for (var i = 0; i < editedPageComponents.length; i++) {
                        var componentId = editedPageComponents[i].attributes['data-id'].value;
                        componentIdArr.push(componentId);
                        var componentType = editedPageComponents[i].attributes['data-type'].value;
                        var matchingComponent = _.findWhere($scope.currentPage.components, {
                            _id: componentId
                        });

                        //get all the editable variables and replace the ones in view with variables in DB
                        var componentEditable = editedPageComponents[i].querySelectorAll('.editable');
                        if (componentEditable.length >= 1) {
                            for (var i2 = 0; i2 < componentEditable.length; i2++) {
                                var componentVar = componentEditable[i2].attributes['data-class'].value;
                                var componentVarContents = componentEditable[i2].innerHTML;

                                //if innerhtml contains a span with the class ng-binding then remove it
                                var span = componentEditable[i2].querySelectorAll('.ng-binding')[0];

                                if (span) {
                                    var spanParent = span.parentNode;
                                    var spanInner = span.innerHTML;
                                    if (spanParent.classList.contains('editable')) {
                                        componentVarContents = spanInner;
                                    } else {
                                        spanParent.innerHTML = spanInner;
                                        componentVarContents = spanParent.parentNode.innerHTML;
                                    }
                                }
                                //remove "/n"
                                componentVarContents = componentVarContents.replace(/(\r\n|\n|\r)/gm, "");

                                    var regex = /<(\"[^\"]*\"|'[^']*'|[^'\">])*>/;
                                    if(regex.test(componentVarContents))
                                    {
                                        var jHtmlObject = $(componentVarContents);
                                        var editor = jQuery("<p>").append(jHtmlObject);
                                        editor.find(".cke_reset").remove();
                                        var newHtml = editor.html();
                                        componentVarContents = newHtml; 
                                    }
                                    

                                var setterKey, pa;
                                //if contains an array of variables
                                if (componentVar.indexOf('.item') > 0 && componentEditable[i2].attributes['data-index'] && !componentEditable[i2].attributes['parent-data-index']) {
                                    //get index in array
                                    var first = componentVar.split(".")[0];
                                    var second = componentEditable[i2].attributes['data-index'].value;
                                    var third = componentVar.split(".")[2];
                                    matchingComponent[first][second][third] = componentVarContents;
                                }
                                //if contains an array of array variables
                                if (componentVar.indexOf('.item') > 0 && componentEditable[i2].attributes['data-index'] && componentEditable[i2].attributes['parent-data-index']) {
                                    //get parent index in array
                                    var first = componentVar.split(".")[0];                                    
                                    var second = componentEditable[i2].attributes['parent-data-index'].value;
                                    //get child index in array
                                    var third = componentVar.split(".")[2];
                                    var fourth = componentEditable[i2].attributes['data-index'].value;
                                    var last = componentVar.split(".")[3];
                                    matchingComponent[first][second][third][fourth][last] = componentVarContents;
                                }
                                //if needs to traverse a single
                                if (componentVar.indexOf('-') > 0) {
                                    var first = componentVar.split("-")[0];
                                    var second = componentVar.split("-")[1];
                                    matchingComponent[first][second] = componentVarContents;
                                }
                                //simple
                                if (componentVar.indexOf('.item') <= 0 && componentVar.indexOf('-') <= 0) {
                                    matchingComponent[componentVar] = componentVarContents;
                                }
                            }
                        }

                        $scope.backup = {};
                    };

                    //sort the components in currentPage to match iframe

                    var newComponentOrder = [];

                    for (var i = 0; i < componentIdArr.length; i++) {
                        var matchedComponent = _.findWhere($scope.currentPage.components, {
                            _id: componentIdArr[i]
                        });
                        newComponentOrder.push(matchedComponent);
                    };


                    $scope.currentPage.components = newComponentOrder;



                    WebsiteService.updatePage($scope.currentPage.websiteId, $scope.currentPage._id, $scope.currentPage, function(data) {
                        $scope.isEditing = true;
                        WebsiteService.setEditedPageHandle($scope.currentPage.handle);

                        toaster.pop('success', "Page Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                        $scope.saveLoading = false;
                        iFrame && iFrame.contentWindow && iFrame.contentWindow.saveBlobData && iFrame.contentWindow.saveBlobData(iFrame.contentWindow);

                    });
                    //$scope.deactivateAloha();
                    var data = {
                        _id: $scope.website._id,
                        accountId: $scope.website.accountId,
                        settings: $scope.website.settings
                    };
                    //website service - save page data
                    WebsiteService.updateWebsite(data, function(data) {
                        console.log('updated website settings', data);
                    });
                }

            };

            $scope.updatePage = function(handle, editing) {
                if (!angular.isDefined(editing))
                    $scope.isEditing = false;

                $scope.pageSelected = handle || 'index';
                var route;
                var sPage = $scope.pageSelected;
                if (sPage === 'index') {
                    route = '';
                } else {
                    route = '/page/' + sPage;
                }

                if ($location.$$search['posthandle']) {
                    route = '/page/' + sPage + '/' + $location.$$search['posthandle'] + '?editor=true';
                    //document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');
                }

                //TODO - replace with sending route through scope to update without iframe refresh
                //document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');
                if ($location.$$search['custid']) {
                    current_src = document.getElementById("iframe-website").getAttribute("src");
                    document.getElementById("iframe-website").setAttribute("src", current_src + '&custid=' + $location.$$search['custid']);
                }

                WebsiteService.getPages($scope.account.website.websiteId, function(pages) {
                    var currentPage = $scope.pageSelected;
                    var parsed = angular.fromJson(pages);
                    var arr = [];

                    for (var x in parsed) {
                        arr.push(parsed[x]);
                    }
                    $scope.allPages = arr;
                    that.allPages = arr;
                    $scope.currentPage = _.findWhere(that.allPages, {
                        handle: currentPage
                    });

                    var localPage = _.findWhere(pages, {
                        handle: currentPage
                    });
                    //get components from page
                    if ($scope.currentPage && $scope.currentPage.components) {
                        $scope.components = $scope.currentPage.components;
                    } else {
                        $scope.components = [];
                    }

                    that.originalCurrentPageComponents = localPage.components;
                    $scope.originalCurrentPage = angular.copy($scope.currentPage);
                });
            };

            $scope.addTeamMember = function(team) {
                if (team && team.name) {
                    $scope.componentEditing.teamMembers.push({
                        name: team.name,
                        position: team.position,
                        bio: team.bio,
                        profilepic: team.profilepic
                    });
                    $scope.saveComponent();
                }
            }

            $scope.addFeatureList = function() {
                $scope.componentEditing.features.push({
                    "top": "<div style='text-align:center'><span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span></div>",
                    "content": "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
                });
                $scope.saveComponent();
            }

            //            $scope.addTeamMember = function () {
            //                $scope.componentEditing.features.push({
            //                    "top": "<div style='text-align:center'><span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span></div>",
            //                    "content": "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
            //                });
            //                $scope.saveComponent();
            //            }

            $scope.updateContactUsAddress = function(location) {
                if ($scope.componentEditing.location.city) {
                    $('#location-city').parents('.form-group').find('.error').html('');
                    $('#location-city').parents('.form-group').removeClass('has-error');
                } else {
                    $('#location-city').parents('.form-group').addClass('has-error');
                    $('#location-city').parents('.form-group').find('.error').html('City is required');
                }

                if ($scope.componentEditing.location.state) {
                    $('#location-state').parents('.form-group').find('.error').html('');
                    $('#location-state').parents('.form-group').removeClass('has-error');
                } else {
                    $('#location-state').parents('.form-group').addClass('has-error');
                    $('#location-state').parents('.form-group').find('.error').html('State is required');
                }

                if ($scope.componentEditing.location.city && $scope.componentEditing.location.state) {
                    $scope.saveComponent();
                    $('#component-setting-modal').modal('hide');
                }
            }

            $scope.addComponent = function() {
                //$scope.deactivateAloha();
                var pageId = $scope.currentPage._id;
                if ($scope.selectedComponent.type === 'footer') {
                    var footerType = _.findWhere($scope.currentPage.components, {
                        type: $scope.selectedComponent.type
                    });
                    if (footerType) {
                        toaster.pop('error', "Footer component already exists");
                        return;
                    }
                }
                if ($scope.selectedComponent.type === 'navigation') {
                    var navigationType = _.findWhere($scope.currentPage.components, {
                        type: $scope.selectedComponent.type
                    });
                    if (navigationType) {
                        toaster.pop('error', "Navbar header already exists");
                        return;
                    }
                }
                $scope.components = $scope.currentPage.components;

                var cmpVersion = $scope.selectedComponent.version;

                WebsiteService.saveComponent($scope.selectedComponent, cmpVersion || 1, function(data) {

                    if (data) {
                        var newComponent = data;
                        var indexToadd = $scope.editComponentIndex ? $scope.editComponentIndex : 1
                        $scope.currentPage.components.splice(indexToadd, 0, newComponent);
                        //$scope.currentPage.components.push(newComponent);
                        //$scope.components.push(newComponent);
                        $scope.components = $scope.currentPage.components;
                        $scope.updateIframeComponents();
                        //TODO: get updateIframeComponents callback
                        setTimeout(function() {
                                $scope.activateAloha();
                            }, 1000)
                            //$scope.scrollToIframeComponent(newComponent.anchor);
                        toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    }
                });
            };

            $scope.deleteComponent = function(componentId) {
                var pageId = $scope.currentPage._id;
                var deletedType;
                $scope.deactivateAloha();
                for (var i = 0; i < $scope.components.length; i++) {
                    if ($scope.components[i]._id == componentId) {
                        deletedType = $scope.components[i].type;
                        $scope.components.splice(i, 1);
                        break;
                    }
                }
                $scope.updateIframeComponents();
                $scope.componentEditing = null;
                $(".modal-backdrop").remove();
                $("#component-setting-modal").modal('hide');
                $scope.activateAloha();
            };

            $scope.updateIframeComponents = function(fn) {
                //document.getElementById("iframe-website").contentWindow.updateComponents($scope.components);
                iFrame && iFrame.contentWindow && iFrame.contentWindow.updateComponents && iFrame.contentWindow.updateComponents($scope.components);
                if (fn) {
                    fn();
                }
            };

            $scope.scrollToIframeComponent = function(section) {
                //document.getElementById("iframe-website").contentWindow.scrollTo(section);
                iFrame && iFrame.contentWindow && iFrame.contentWindow.scrollTo && iFrame.contentWindow.scrollTo(section)
            };

            $scope.activateAloha = function() {
                //document.getElementById("iframe-website").contentWindow.activateAloha();
                $scope.bindEvents();
                iFrame && iFrame.contentWindow && iFrame.contentWindow.activateAloha && iFrame.contentWindow.activateAloha()
            };

            $scope.deactivateAloha = function() {
                //document.getElementById("iframe-website").contentWindow.deactivateAloha();
                iFrame && iFrame.contentWindow && iFrame.contentWindow.deactivateAloha && iFrame.contentWindow.deactivateAloha()
            };

            $scope.editComponent = function(componentId) {
                $scope.$apply(function() {
                    $scope.componentEditing = _.findWhere($scope.components, {
                        _id: componentId
                    });
                    if($scope.componentEditing)
                    {
                    $scope.componentEditing.icon = _.findWhere($scope.componentTypes, {
                        type: $scope.componentEditing.type
                    }).icon;
                    $scope.componentEditing.title = _.findWhere($scope.componentTypes, {
                        type: $scope.componentEditing.type
                    }).title;

                    if($scope.componentEditing.bg && $scope.componentEditing.bg.img.url && !$scope.componentEditing.bg.color)
                        $scope.componentEditing.bg.img.show = true;
                    }
                    

                });
                //open right sidebar and component tab
                // document.body.className += ' leftpanel-collapsed rightmenu-open';
                // var nodes = document.body.querySelectorAll('.rightpanel-website .nav-tabs li a');
                // var last = nodes[nodes.length - 1];
                // angular.element(last).triggerHandler('click');

                if($scope.componentEditing)
                {
                    WebsiteService.getComponentVersions($scope.componentEditing.type, function(versions) {
                        $scope.componentEditingVersions = versions;
                        if ($scope.componentEditing && $scope.componentEditing.version) {
                            $scope.componentEditing.version = $scope.componentEditing.version.toString();
                            $scope.versionSelected = $scope.componentEditing.version;
                        }
                        $scope.originalCurrentPage = angular.copy($scope.currentPage);
                    });
                 }
                $('#feature-convert').iconpicker({
                    iconset: 'fontawesome',
                    icon: 'fa-credit-card',
                    rows: 5,
                    cols: 5,
                    placement: 'right',
                });

                $('#feature-convert').on('change', function(e) {
                    if (!$scope.featureIcon) {
                        $scope.featureIcon = {};
                    }
                    if ($scope.featureIcon) {
                        $scope.featureIcon.icon = e.icon;
                    }
                });
            };
            $scope.saveComponent = function() {

                var componentId = $scope.componentEditing._id;

                $scope.updateSingleComponent(componentId);

                var componentIndex;
                for (var i = 0; i < $scope.components.length; i++) {
                    if ($scope.components[i]._id === componentId) {
                        $scope.components[i] = $scope.componentEditing
                    }
                }
                $scope.currentPage.components = $scope.components;
                $scope.updateIframeComponents();
                $scope.isEditing = true;
                setTimeout(function() {
                    $scope.activateAloha();
                }, 500)

                //update the scope as the temppage until save

                // var pageId = $scope.currentPage._id;
                // WebsiteService.updateComponent(pageId, $scope.componentEditing._id, $scope.componentEditing, function(data) {
                //     toaster.pop('success', "Component Saved", "The component was saved successfully.");
                //     $scope.updateIframeComponents();
                // });
            };


            $scope.updateSingleComponent = function(componentId)
            {
                //update single component
                
                var matchingComponent = _.findWhere($scope.currentPage.components, {
                    _id: componentId
                });

                var editedComponent = iFrame.contentWindow.document.getElementsByTagName("body")[0].querySelectorAll('.component[data-id="' + componentId + '"]');
                if (editedComponent && editedComponent.length > 0) {
                    //get all the editable variables and replace the ones in view with variables in DB
                    var componentEditable = editedComponent[0].querySelectorAll('.editable');
                    if (componentEditable.length >= 1) {
                        for (var i2 = 0; i2 < componentEditable.length; i2++) {
                            var componentVar = componentEditable[i2].attributes['data-class'].value;
                            var componentVarContents = componentEditable[i2].innerHTML;

                            //if innerhtml contains a span with the class ng-binding then remove it
                            var span = componentEditable[i2].querySelectorAll('.ng-binding')[0];

                            if (span) {
                                var spanParent = span.parentNode;
                                var spanInner = span.innerHTML;
                                if (spanParent.classList.contains('editable')) {
                                    componentVarContents = spanInner;
                                } else {
                                    spanParent.innerHTML = spanInner;
                                    componentVarContents = spanParent.parentNode.innerHTML;
                                }
                            }
                            //remove "/n"
                            componentVarContents = componentVarContents.replace(/(\r\n|\n|\r)/gm, "");

                            var setterKey, pa;
                            //if contains an array of variables
                            if (componentVar.indexOf('.item') > 0 && componentEditable[i2].attributes['data-index']) {
                                //get index in array
                                var first = componentVar.split(".")[0];
                                var second = componentEditable[i2].attributes['data-index'].value;
                                var third = componentVar.split(".")[2];
                                matchingComponent[first][second][third] = componentVarContents;
                            }
                            //if needs to traverse a single
                            if (componentVar.indexOf('-') > 0) {
                                var first = componentVar.split("-")[0];
                                var second = componentVar.split("-")[1];
                                matchingComponent[first][second] = componentVarContents;
                            }
                            //simple
                            if (componentVar.indexOf('.item') <= 0 && componentVar.indexOf('-') <= 0) {
                                matchingComponent[componentVar] = componentVarContents;
                            }
                        }
                    }
                }
               return matchingComponent;
            }

            $scope.saveCustomComponent = function(networks) {
                    var currentComponentId = $scope.componentEditing._id;  
                    $scope.updateSingleComponent(currentComponentId);                  
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent($scope.components, networks ? networks : $scope.componentEditing.networks);
            };

            //delete page
            $scope.deletePage = function() {

                var pageId = $scope.currentPage._id;
                var websiteId = $scope.currentPage.websiteId;
                var title = $scope.currentPage.title;

                WebsiteService.deletePage(pageId, websiteId, title, function(data) {
                    toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
                    $(".menutoggle-right").click();
                    $location.path("/admin#/website");
                });
            };

            //delete post
            $scope.deletePost = function(post_data) {
                $(".menutoggle-right").click();
                iFrame && iFrame.contentWindow.deletePost && iFrame.contentWindow.deletePost(post_data, toaster);
            };

            //selected component when choosing from modal
            $scope.selectComponent = function(type) {
                if (type.enabled) {
                    $scope.selectedComponent = type;
                }
            };

            //insertmedia into various components
            $scope.insertMedia = function(asset) {
                if ($scope.imageChange) {
                    $scope.imageChange = false;
                    var type = $scope.componentEditing.type;
                    //if image/text component
                    if (type == 'image-text') {
                        $scope.componentEditing.imgurl = asset.url;
                    } else if (type == 'feature-list') {
                        var targetIndex = $($scope.componentArrTarget).closest('.single-feature').data('index');
                        $scope.componentEditing.features[targetIndex].imgurl = asset.url;
                    } else if (type == 'simple-form') {
                        $scope.componentEditing.imgurl = asset.url;
                    } else if (type == 'image-gallery') {
                        $scope.componentEditing.images[$scope.componentImageIndex].url = asset.url;
                    } else if (type == 'thumbnail-slider') {
                        $scope.componentEditing.thumbnailCollection[$scope.componentImageIndex].url = asset.url;
                    } else if (type == 'meet-team') {
                        $scope.componentEditing.teamMembers[$scope.componentImageIndex].profilepic = asset.url;
                    }
                     else {
                        console.log('unknown component or image location');
                    }
                    $scope.bindEvents();
                } else if ($scope.postImage && !$scope.componentEditing) {
                    $scope.postImage = false;
                    $scope.postImageUrl = asset.url;
                    toaster.pop('success', "Post Image added successfully");
                    return;
                } else if ($scope.profilepic && !$scope.componentEditing) {
                    $scope.profilepic = false;
                    $scope.customerAccount.photo = asset.url;
                    return;
                } else if ($scope.insertMediaImage) {
                    $scope.insertMediaImage = false;
                    var iFrame = document.getElementById("iframe-website");
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.addCKEditorImage && iFrame.contentWindow.addCKEditorImage(asset.url);
                    //iFrame && iFrame.contentWindow && iFrame.contentWindow.addCKEditorImageInput && iFrame.contentWindow.addCKEditorImageInput(asset.url);
                    return;
                } else if ($scope.logoImage && $scope.componentEditing) {
                    $scope.logoImage = false;
                    $scope.componentEditing.logourl = asset.url;
                } else if ($scope.changeblobImage && !$scope.componentEditing) {
                    $scope.changeblobImage = false;
                    $scope.blog_post.featured_image = asset.url;
                    var iFrame = document.getElementById("iframe-website");
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.setBlogImage && iFrame.contentWindow.setBlogImage(asset.url);
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent();
                    return;
                } else if ($scope.imgGallery && $scope.componentEditing) {
                    $scope.imgGallery = false;
                    $scope.componentEditing.images.push({
                        url: asset.url
                    });
                } else if ($scope.imgThumbnail && $scope.componentEditing) {
                    $scope.imgThumbnail = false;
                    $scope.componentEditing.thumbnailCollection.push({
                        url: asset.url
                    });
                } else {
                    $scope.componentEditing.bg.img.url = asset.url;
                    $scope.saveComponent();
                    return;
                }
                $scope.updateIframeComponents();
            };

            //when changing the subdomain associated with the account, check to make sure it exisits
            $scope.checkIfSubdomaddCKEditorImageInputainExists = function() {
                var parent_div = $('div.form-group.subdomain');
                UserService.checkDuplicateSubdomain($scope.account.subdomain, $scope.account._id, function(result) {
                    if (result === "true") {
                        parent_div.addClass('has-error');
                        parent_div.find('span.error').remove();
                        parent_div.append("<span class='error help-block'>Domain already exists</span>");
                    } else {
                        UserService.putAccount($scope.account, function(account) {
                            parent_div.removeClass('has-error');
                            parent_div.find('span.error').remove();
                        });
                    }
                });
            };

            $scope.changesConfirmed = false;
            //Before user leaves editor, ask if they want to save changes
            var offFn = $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                var isDirty = false;
                var iFrame = document.getElementById("iframe-website");
                if (iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty) {
                    var isDirty = iFrame.contentWindow.checkOrSetPageDirty();
                }

                if (isDirty && !$scope.changesConfirmed) {
                    event.preventDefault();

                    SweetAlert.swal({
                            title: "Are you sure?",
                            text: "Do you want to save your changes?",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, save changes!",
                            cancelButtonText: "No, do not save changes!",
                            closeOnConfirm: false,
                            closeOnCancel: false
                        },
                        function(isConfirm) {
                            if (isConfirm) {
                                SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
                                $scope.savePage();
                            } else {
                                SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
                            }
                            $scope.changesConfirmed = true;
                            $location.path(newUrl);
                            offFn();
                        });
                } else if ($scope.changesConfirmed) {
                    //do nothing
                }

            });

            //Add Link to navigation
            $scope.initializeLinks = function() {
                $scope.newLink = {
                    linkUrl: null,
                    linkTitle: null,
                    linkPage: null
                };
            }

            $scope.setLinkType = function(lnk) {
                $scope.addLinkType = lnk;
                $scope.initializeLinks();
            }

            $scope.addLinkToNav = function() {
                var linkTitle = null;
                var linkUrl = null;
                if ($scope.newLink && $scope.newLink.linkPage) {
                    $scope.linkPage = _.findWhere(that.allPages, {
                        handle: $scope.newLink.linkPage
                    });
                    linkTitle = $scope.linkPage.title;
                    linkUrl = $scope.newLink.linkPage;
                } else if ($scope.newLink && $scope.newLink.linkTitle && $scope.newLink.linkUrl) {
                    linkTitle = $scope.newLink.linkTitle;
                    linkUrl = $scope.newLink.linkUrl;
                }
                if (linkTitle && linkUrl) {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            value.links.push({
                                label: linkTitle,
                                type: "link",
                                linkTo: {
                                    data: linkUrl,
                                    type: $scope.addLinkType
                                }
                            });
                            $scope.initializeLinks();
                        }
                    });
                }

            }

            //when the navigation is reordered, update the linklist in the website object
            $scope.updateLinkList = function(linkLists) {
                var linkLabelsArr = [];
                var editedLinksLists = document.getElementById("reorderNavBarContainer").querySelectorAll('.head-menu-links');
                for (var i = 0; i < editedLinksLists.length; i++) {
                    var linkLabel = editedLinksLists[i].attributes['data-label'].value;
                    if (linkLabel)
                        linkLabelsArr.push(linkLabel);
                }
                if (linkLabelsArr.length) {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            var newLinkListOrder = [];
                            for (var i = 0; i < editedLinksLists.length; i++) {
                                var matchedLinkList = _.findWhere(value.links, {
                                    label: linkLabelsArr[i]
                                });
                                newLinkListOrder.push(matchedLinkList);
                            };
                            if (newLinkListOrder.length) {
                                $scope.website.linkLists[index].links = newLinkListOrder;
                                WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function(data) {
                                    iFrame && iFrame.contentWindow.updateWebsite && iFrame.contentWindow.updateWebsite($scope.website);
                                    toaster.pop('success', "Navigation updated successfully.");
                                });
                            }

                        }
                    });
                }
            };

            /********** LISTENERS ***********/

            window.deleteFeatureList = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.features.splice(index, 1);
                $scope.saveCustomComponent();
            }

            window.addNewFeatureList = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.features.push({
                    "top" : "<div style='text-align:center'><span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%23ffffff%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#ffffff;font-size:96px;\"></span></div>",
                    "content" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Another Feature</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
                });
                $scope.saveCustomComponent();
            }

            window.clickImageButton = function() {
                $scope.insertMediaImage = true;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.changeBlogImage = function(blog) {
                $scope.changeblobImage = true;
                $scope.blog_post = blog;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.setPostImage = function(componentId) {
                $scope.postImage = true;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.addImageToGallery = function(componentId) {
                $scope.imgGallery = true;
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.deleteImageFromGallery = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.images.splice(index, 1);
                $scope.saveCustomComponent();
            }

            window.addImageToThumbnail = function(componentId) {
                $scope.imgThumbnail = true;
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.deleteImageFromThumbnail = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.thumbnailCollection.splice(index, 1);
                $scope.saveCustomComponent();
            }

            window.changeProfilePhoto = function(componentId, customer) {
                $scope.profilepic = true;
                $scope.customerAccount = customer;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.changeLogoImage = function(componentId) {
                $scope.logoImage = true;
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.getPostImageUrl = function() {
                return $scope.postImageUrl;
            }

            window.deleteTeamMember = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.teamMembers.splice(index, 1);
                $scope.saveCustomComponent();
            }

            window.updateSocialNetworks = function(old_value, mode, new_value) {
                var selectedName;
                switch (mode) {
                    case "add":
                        if (new_value && new_value.name && new_value.url) {
                            $scope.componentEditing.networks.push({
                                name: new_value.name,
                                url: new_value.url,
                                icon: new_value.icon
                            });
                            $scope.saveCustomComponent();
                        }
                        break;
                    case "update":
                        if (new_value && new_value.name && new_value.url) {
                            selectedName = _.findWhere($scope.componentEditing.networks, {
                                name: old_value.name
                            });
                            selectedName.name = new_value.name;
                            selectedName.url = new_value.url;
                            selectedName.icon = new_value.icon;
                            $scope.saveCustomComponent();
                        }
                        break;
                    case "delete":
                        selectedName = _.findWhere($scope.componentEditing.networks, {
                            name: old_value.name
                        });
                        if (selectedName) {
                            var index = $scope.componentEditing.networks.indexOf(selectedName)
                            $scope.componentEditing.networks.splice(index, 1);
                            $scope.saveCustomComponent();
                        }
                        break;
                }
            }

            window.updateTeamNetworks = function(old_value, mode, new_value, parent_index) {
                var selectedName;
                switch (mode) {
                    case "add":
                        if (new_value && new_value.name && new_value.url) {
                            $scope.componentEditing.teamMembers[parent_index].networks.push({
                                name: new_value.name,
                                url: new_value.url,
                                icon: new_value.icon
                            });
                            $scope.saveCustomComponent($scope.componentEditing.teamMembers[parent_index].networks);
                        }
                        break;
                    case "update":
                        if (new_value && new_value.name && new_value.url) {
                            selectedName = _.findWhere($scope.componentEditing.teamMembers[parent_index].networks, {
                                name: old_value.name
                            });
                            selectedName.name = new_value.name;
                            selectedName.url = new_value.url;
                            selectedName.icon = new_value.icon;
                            $scope.saveCustomComponent($scope.componentEditing.teamMembers[parent_index].networks);
                        }
                        break;
                    case "delete":
                        selectedName = _.findWhere($scope.componentEditing.teamMembers[parent_index].networks, {
                            name: old_value.name
                        });
                        if (selectedName) {
                            var index = $scope.componentEditing.teamMembers[parent_index].networks.indexOf(selectedName)
                            $scope.componentEditing.teamMembers[parent_index].networks.splice(index, 1);
                            $scope.saveCustomComponent($scope.componentEditing.teamMembers[parent_index].networks);
                        }
                        break;
                }
            }

            window.getSocialNetworks = function(componentId, nested, parent_index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                if(nested)
                    return $scope.componentEditing.teamMembers[parent_index].networks;
                else
                    return $scope.componentEditing.networks;
            }

            window.updateAdminPageScope = function(page) {
                $scope.singlePost = false;
                console.log("Updating admin scope")
                if (!$scope.currentPage)
                {
                    $scope.$apply(function() {
                        $scope.currentPage = page;
                         //get components from page
                        if ($scope.currentPage && $scope.currentPage.components) {
                            $scope.components = $scope.currentPage.components;
                        } else {
                            $scope.components = [];
                        }
                        $scope.originalCurrentPage = angular.copy($scope.currentPage);
                    })
                }
               
            }

            window.checkIfSinglePost = function(post) {
                if (post)
                    $scope.singlePost = true;
            }

            window.setLoading = function(value) {
                $scope.saveLoading = value;
            }

            window.deletePricingTable = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.tables.splice(index, 1);
                $scope.saveCustomComponent();
            }

            window.addPricingTable = function(componentId, newTable, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.tables.splice(index, 0, newTable);
                $scope.saveCustomComponent();
            }

             window.deletePricingTableFeature = function(componentId, index, parentIndex) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.tables[parentIndex].features.splice(index, 1);
                $scope.saveCustomComponent();
            }

            window.addPricingTableFeature = function(componentId, newTable, index, parentIndex) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.tables[parentIndex].features.splice(index, 0, newTable);
                $scope.saveCustomComponent();
            }
            window.addTeamMember = function(componentId, newTeam, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.teamMembers.splice(index, 0, newTeam);
                $scope.saveCustomComponent();
            }
            window.updateComponent = function(componentId) {
                //update single component               
               return $scope.updateSingleComponent(componentId);
            };

        }
    ]);
});
