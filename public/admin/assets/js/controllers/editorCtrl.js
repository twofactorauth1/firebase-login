'use strict';
/**
 * controller for editor
 */
(function(angular) {
    app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService","postConstant", function($scope, $rootScope, $interval, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

        var that;
        var user, account, components, currentPageContents, previousComponentOrder, allPages, originalCurrentPageComponents = that = this;
        
        /*
         * @globalvariables
         * -
         */
        $scope.post_statuses = postConstant.post_status.dp;
        var iFrame = document.getElementById("iframe-website");
        var subdomainCharLimit = 4;
        $scope.primaryFontStack = '';
        $scope.secondaryFontStack = '';
        $scope.iframeData = {};
        $scope.allPages = [];
        $scope.filterdPages = [];
        $scope.backup = {};
        $scope.components = [];
        $scope.isEditing = true;
        $scope.isMobile = false;
        $scope.tabs = {};
        $scope.addLink = false;

        $scope.saveLoading = false;
        $scope.hours = hoursConstant;
        $scope.typefilter = 'all';
        $scope.timeInterval = 1200000;
        $scope.redirect = false;
        $scope.single_post = false;
        $scope.contactHoursInvalid = false;
        var stopInterval;
        $scope.newPage = {};
        $scope.newPost = {};
        
        $scope.slugifyHandle = function (title) {
          if (title) {
            $scope.newPage.handle = $filter('slugify')(title);
          }
        };
        $scope.$watch('currentPage.handle', function(newValue, oldValue) {
            if (newValue) {
                $scope.currentPage.handle = $filter('slugify')(newValue);
            }
        });
        $scope.breadcrumbTitle = $location.$$search['pagehandle'] || $location.$$search['posthandle'];

        /*
         * @location:pagehandle
         * - get the pagehandle and replace iframe src
         */

        if ($location.$$search['pagehandle']) {
            document.getElementById("iframe-website").setAttribute("src", '/page/' + $location.$$search['pagehandle'] + '?editor=true');
        }

        /*
         * @location:templatehandle
         * - get the templatehandle, replace iframe src and set templateActive to true
         */

        if ($location.$$search['templatehandle']) {
            $scope.templateActive = true;
            document.getElementById("iframe-website").setAttribute("src", '/page/' + $location.$$search['templatehandle'] + '?editor=true');
            WebsiteService.getTemplates(function(templates) {
                $scope.template = _.find(templates, function(tmpl) {
                    return tmpl.handle == $location.$$search['templatehandle'];
                });
            });
        }

        /*
         * @getWebsite
         * - get website obj, settings, and website variables
         */

        WebsiteService.getWebsite(function(website) {

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

        /*
         * @location:posthandle
         * - get the posthandle and replace iframe src
         */

        if ($location.$$search['posthandle']) {
            console.log('post handle >>>', $location.$$search['posthandle']);
            $scope.single_post = true;
            document.getElementById("iframe-website").setAttribute("src", '/page/blog/' + $location.$$search['posthandle'] + '?editor=true');
        }

        /*
         * @getUrl
         * get the url for the view page/post button
         */

         AccountService.getAccount(function(account) {
            $scope.account = account;
         });

        $scope.getUrl = function(handle, is_post) {
            if (is_post)
                handle = "blog/" + handle;
            var _url = 'http://' + window.location.host + '/' + handle;
            if ($scope.account.domain) {
                _url = $scope.account.domain + '/' + handle;
            }

            window.open(_url, '_blank');
        };

        /*
         * @closeModal
         * -
         */

        $scope.closeModal = function() {
            $scope.modalInstance.close();
            if($scope.componentEditing && $scope.componentEditing.type === 'contact-us' && $scope.contactHoursInvalid)
            {
                $scope.componentEditing.hours = $scope.originalComponent.hours;
                $scope.updateContactUsAddress();
            }
            $scope.contactHoursInvalid = false;
        };

        /*
         * @openModal
         * -
         */

        $scope.openModal = function(modal) {
            $scope.modalInstance = $modal.open({
                templateUrl: modal,
                scope: $scope
            });
            $scope.modalInstance.result.then(function() {}, function() {
                console.log('call 2 ', $scope.spectrum);
                angular.element('.sp-container').addClass('sp-hidden');
            });
        };

        /*
         * @openSettingsModal
         * -
         */

        $scope.openSettingsModal = function() {
            if ($scope.single_post)
                $scope.openModal("post-settings-modal")
            else
                $scope.openModal("page-settings-modal")
        };

        /*
         * @openDuplicateModal
         * -
         */

        $scope.openDuplicateModal = function() { 
             if ($scope.single_post)
                $scope.openModal("post-duplicate-modal")
            else
                $scope.openModal("page-duplicate-modal")
        };

        /*
         * @window height
        */

        $scope.calculateWindowHeight = function()
        { 
           var scrollTop = $(document).scrollTop();
           return scrollTop;
        }

        /*
         * @set top of editor and maintoolbar
        */

        $scope.setToolbarsTop = function()
        {
            var editorToolbar = angular.element("#iframe-website").contents().find("#editor-toolbar");
            var mainToolbar = angular.element("#page-actions");
            var scrollTop = $(document).scrollTop();
            var navbarCollapse = angular.element('header').outerHeight();
            var pageActions = angular.element('#page-actions').outerHeight();
            var offsetHeight = angular.element('#page-title').outerHeight();
            var doc_width = $(document).width();
            if (scrollTop > offsetHeight) {

                editorToolbar.css({
                    'top': scrollTop - 30
                });
                if(doc_width <= 1183) {
                     editorToolbar.css({
                            'top': scrollTop + 25
                        });
                }
                if(doc_width <= 974) {                    
                    scrollTop = scrollTop + 65;

                   
                }
                if(doc_width < 760) {
                    editorToolbar.css({
                        'top': scrollTop - 25
                    });
                }
                 
                mainToolbar.css({
                    'top': scrollTop,
                    'position': 'absolute',
                    'width': '100%',
                    'margin-left': '0px'
                });
            } else {
                editorToolbar.css({
                    'top': 0
                });
                mainToolbar.css({
                    'top': 0,
                    'position': 'relative'
                });
            }
                var postSettingsModal = angular.element("#iframe-website").contents().find("#component-setting-modal");
                //var scrollTop = $(document).scrollTop(); 
                //var editorToolbar = angular.element("#iframe-website").contents().find("#editor-toolbar");       
                //var toolBarTop = editorToolbar.offset().top;
                if(postSettingsModal.length)
                    postSettingsModal.css({
                        'top': editorToolbar.offset().top + editorToolbar.height()
                    });
        }

        /*
         * @window:scroll
         * - when the window is scrolled in the admin, ud
         */

        angular.element(window).scroll(function() {
            $scope.setToolbarsTop();
        });




        /*
         * @components.sort
         * -
         */

        $scope.components.sort(function(a, b) {
            return a.i > b.i;
        });

        /*
         * @status
         * -
         */

        $scope.status = {
            isopen: false
        };

        /*
         * @spectrum
         * - variables for the spectrum color picker in the settings modal
         */

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
                appendTo: angular.element("#component-setting-modal"),
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
        };

        /*
         * @componentTypes
         * - an array of component types and icons for the add component modal
         */

        $scope.componentTypes = [{
            title: 'Blog',
            type: 'blog',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
            filter: 'blog',
            description: 'Use this component for your main blog pages which displays all your posts with a sidebar of categories, tags, recent posts, and posts by author.',
            enabled: true
        }, {
            title: 'Blog Teaser',
            type: 'blog-teaser',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog-teaser.png',
            filter: 'blog',
            description: 'The Blog Teaser is perfect to showcase a few of your posts with a link to you full blog page.',
            enabled: true
        }, {
            title: 'Masthead',
            type: 'masthead',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/masthead.jpg',
            filter: 'misc',
            description: 'Introduce your business with this component on the top of your home page.',
            enabled: true
        }, {
            title: 'Feature List',
            type: 'feature-list',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-list.jpg',
            filter: 'features',
            description: 'Showcase what your business offers with a feature list.',
            enabled: true
        }, {
            title: 'Contact Us',
            type: 'contact-us',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/contact-us.jpg',
            filter: 'contact',
            description: 'Let your visitors where your located, how to contact you, and what your business hours are.',
            enabled: true
        }, {
            title: 'Coming Soon',
            type: 'coming-soon',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/coming-soon.jpg',
            filter: 'misc',
            description: 'Even if your site isn\'t ready you can use this component to let your visitors know you will be availiable soon.',
            enabled: true
        }, {
            title: 'Feature block',
            type: 'feature-block',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-block.jpg',
            filter: 'features',
            description: 'Use this component to show one important feature or maybe a quote.',
            enabled: true
        }, {
            title: 'Image Gallery',
            type: 'image-gallery',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/gallery.jpg',
            filter: 'images',
            description: 'Display your images in this image gallery component with fullscreen large view.',
            enabled: true
        }, {
            title: 'Image Text',
            version: 1,
            type: 'image-text',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/image-text.jpg',
            filter: 'images',
            description: 'Show an image next to a block of text on the right or the left.',
            enabled: true
        }, {
            title: 'Meet Team',
            type: 'meet-team',
            icon: 'fa fa-users',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/meet-team.png',
            filter: 'team',
            description: 'Let your visitors know about the team behind your business. Show profile image, position, bio, and social links for each member.',
            enabled: true
        }, {
            title: 'Navigation 1',
            type: 'navigation',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/navbar-v1.jpg',
            filter: 'navigation',
            description: 'A simple navigation bar with the logo on the left and nav links on the right. Perfect for horizontal logos.',
            version: 1,
            enabled: true
        }, {
            title: 'Navigation 2',
            type: 'navigation',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v2-preview.png',
            filter: 'navigation',
            description: 'If your logo is horizontal or square, this navigation will showcase your logo perfectly with addtional space for more links.',
            version: 2,
            enabled: true
        }, {
            title: 'Navigation 3',
            type: 'navigation',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v3-preview.png',
            filter: 'navigation',
            description: 'This navigation features a large block navigation links for a modern feel.',
            version: 3,
            enabled: true
        }, {
            title: 'Products',
            type: 'products',
            icon: 'fa fa-money',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/products.png',
            filter: 'products',
            description: 'Use this as the main products page to start selling. It comes together with a cart and checkout built in.',
            enabled: true
        }, {
            title: 'Pricing Tables',
            type: 'pricing-tables',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/pricing-tables.png',
            filter: 'products',
            description: 'Subscription product types with multiple options are best when shown in a pricing table to help the visitor decide which one is best for them.',
            enabled: true
        }, {
            title: 'Simple form',
            type: 'simple-form',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/simple-form.jpg',
            filter: 'forms',
            description: 'Automatically create contacts in the backend when a visitor submits this form. Add first name, last name, email, or phone number fields.',
            enabled: true
        }, {
            title: 'Single Post',
            type: 'single-post',
            icon: 'custom single-post',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/45274f46-0a21-11e5-83dc-0aee4119203c.png',
            filter: 'blog',
            description: 'Used for single post design. This is a mandatory page used to show single posts. This will apply to all posts.',
            enabled: false
        }, {
            title: 'Social',
            type: 'social-link',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/social-links.jpg',
            filter: 'social',
            description: 'Let your visitors know where else to find you on your social networks. Choose from 18 different networks.',
            enabled: true
        }, {
            title: 'Video',
            type: 'video',
            icon: 'fa fa-video',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/video.png',
            filter: 'video',
            description: 'Showcase a video from Youtube, Vimeo, or an uploaded one. You can simply add the url your video is currently located.',
            enabled: true
        }, {
            title: 'Text Block',
            type: 'text-only',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/text-block.jpg',
            filter: 'text',
            description: 'A full width component for a large volume of text. You can also add images within the text.',
            enabled: true
        }, {
            title: 'Thumbnail Slider',
            type: 'thumbnail-slider',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/thumbnail.png',
            filter: 'images',
            description: 'Perfect for sponsor or client logos you have worked with in the past. Works best with logos that have a transparent background. ',
            enabled: true
        }, {
            title: 'Top Bar',
            type: 'top-bar',
            icon: 'fa fa-info',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/top-bar.png',
            filter: 'contact',
            description: 'Show your social networks, phone number, business hours, or email right on top that provides visitors important info quickly.',
            enabled: true
        }, {
            title: 'Testimonials',
            type: 'testimonials',
            icon: 'fa fa-info',
            preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/45263570-0a21-11e5-87dd-b37fd2717aeb.png',
            filter: 'text',
            description: 'A component to showcase your testimonials.',
            enabled: true
        }];

        /*
         * @componentLabel, enabledComponentTypes
         * -
         */

        var componentLabel,
            enabledComponentTypes = _.where($scope.componentTypes, {
                enabled: true
            });

        /************************************************************************************************************
         * Takes the componentTypes object and gets the value for the filter property from any that are enabled.
         * It then makes that list unique, sorts the results alphabetically, and and removes the misc value if
         * it exists. (The misc value is added back on to the end of the list later)
         ************************************************************************************************************/
        $scope.componentFilters = _.without(_.uniq(_.pluck(_.sortBy(enabledComponentTypes, 'filter'), 'filter')), 'misc');

        // Iterates through the array of filters and replaces each one with an object containing an
        // upper and lowercase version
        _.each($scope.componentFilters, function(element, index) {
            componentLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
            $scope.componentFilters[index] = {
                'capitalized': componentLabel,
                'lowercase': element
            };
            componentLabel = null;
        });

        // Manually add the All option to the begining of the list
        $scope.componentFilters.unshift({
            'capitalized': 'All',
            'lowercase': 'all'
        });

        // Manually add the Misc section back on to the end of the list
        $scope.componentFilters.push({
            'capitalized': 'Misc',
            'lowercase': 'misc'
        });

        $scope.setFilterType = function(label) {
            $scope.typefilter = label;
        };

        /*
         * @iframe.onload
         * -
         */

        $scope.activated = false;
        $scope.afteriframeLoaded = function(page) {
            $scope.iframeLoaded = true;
            $scope.childScope = document.getElementById("iframe-website").contentWindow.angular.element("#childScope").scope();
            $scope.editPage();
            $scope.currentPage = page;
            $scope.updatePage($scope.currentPage.handle);
            if($scope.childScope.getAllBlogs)
                $scope.originalBlogPosts  = angular.copy($scope.childScope.getAllBlogs());
            $scope.resizeIframe();
        };

        /*
         * @removeImage
         * -
         */

        $scope.removeImage = function(remove) {
            if ($scope.componentEditing && $scope.componentEditing.bg && $scope.componentEditing.bg.img) {
                if (($scope.componentEditing.bg.img.show == false && remove == true) || remove == false) {
                    if (remove == false)
                        $scope.componentEditing.bg.img.url = null;
                    $scope.componentEditing.bg.img.blur = false;
                    $scope.componentEditing.bg.img.parallax = false;
                    $scope.componentEditing.bg.img.overlay = false;
                }

            }
        };

        /*
         * @bindEvents
         * -
         */

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
                //unbind all click handler
                angular.element("#iframe-website").contents().find('body').off("click", ".componentActions .duplicate");

                //Disable all links in edit
                angular.element("#iframe-website").contents().find('body').on("click", ".component a", function(e) {
                    if (!angular.element(this).hasClass("clickable-link")) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                //remove click handler before binding click
                angular.element("#iframe-website").contents().find('body').off("click", ".componentActions .settings, .map-wrap .settings");
                //add click events for all the settings buttons
                angular.element("#iframe-website").contents().find('body').on("click", ".componentActions .settings, .map-wrap .settings", function(e) {
                    if (e.currentTarget.attributes['tab-active'] && e.currentTarget.attributes['tab-active'].value === "address")
                        $scope.tabs.address = true;
                    $scope.editComponent(e.currentTarget.attributes['data-id'].value);
                    if ($(e.currentTarget).hasClass("single-post-settings"))                       
                     {
                        //$("#iframe-website").contents().find('#component-setting-modal').modal('show');
                        var postSettingsModal = angular.element("#iframe-website").contents().find("#component-setting-modal");
                        var scrollTop = $(document).scrollTop(); 
                        var editorToolbar = angular.element("#iframe-website").contents().find("#editor-toolbar");       
                        
                        postSettingsModal.css({
                            'top': editorToolbar.offset().top + editorToolbar.height()
                        });
                        postSettingsModal.modal('show');
                    }
                    //iFrame.co .openModal('single-post-settings-modal');
                    else {
                        $scope.openModal('component-settings-modal');
                    }
                });

                //add click events for all the copy component buttons
                angular.element("#iframe-website").contents().find('body').on("click", ".componentActions .duplicate", function(e) {
                    $scope.editComponentIndex = e.currentTarget.attributes['data-index'].value;
                    $scope.editComponent(e.currentTarget.attributes['data-id'].value);
                    $scope.saveComponent();
                    var matchingComponent = _.findWhere($scope.currentPage.components, {
                        _id: e.currentTarget.attributes['data-id'].value
                    });


                    var newComponent = angular.copy(matchingComponent);
                    var temp = Math.uuid();
                    newComponent._id = temp;
                    newComponent.anchor = temp;
                    var indexToadd = $scope.editComponentIndex ? $scope.editComponentIndex : 1
                    $scope.currentPage.components.splice(indexToadd, 0, newComponent);
                    $scope.components = $scope.currentPage.components;
                    $scope.updateIframeComponents();
                    if (newComponent.type === 'contact-us')
                        $scope.childScope.updateContactComponent($scope.currentPage.components);
                    //TODO: get updateIframeComponents callback
                    setTimeout(function() {
                        $scope.activateCKEditor();
                    }, 1000)
                    toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");

                });
                //remove click handler before binding click
                angular.element("#iframe-website").contents().find('body').off("click", ".add-component");
                //add click events for all the add component buttons.
                angular.element("#iframe-website").contents().find('body').on("click", ".add-component", function(e) {
                    $scope.editComponentIndex = e.currentTarget.attributes['data-index'].value;
                    $scope.openModal('add-component-modal');
                });
                angular.element("#iframe-website").contents().find('body').off("click", ".delete-component");
                //add click events for all the delete component buttons.
                angular.element("#iframe-website").contents().find('body').on("click", ".delete-component", function(e) {
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
                                setTimeout(function() {
                                    $scope.deleteComponent(e.currentTarget.attributes['data-id'].value);
                                }, 200)
                            };
                        });
                });
                angular.element("#iframe-website").contents().find('body').off("click", ".goback");
                //add click events for all the delete component buttons.
                angular.element("#iframe-website").contents().find('body').on("click", ".goback", function(e) {
                    SweetAlert.swal("Info!", "This link is disabled in the editor, this would go back on the frontend.", "warning");
                });
                // angular.element("#iframe-website").contents().find('body').on("DOMNodeInserted", ".editable", function(e) {
                //     if (!$scope.activated) {
                //       $scope.activated = true;
                //       setTimeout(function() {
                //         $scope.childScope.activateCKEditor();
                //       }, 1000)
                //     }
                // });
                angular.element("#iframe-website").contents().find('body').off("click", ".btn-social-link");
                // Social components
                angular.element("#iframe-website").contents().find('body').on("click", ".btn-social-link", function(e) {
                    $scope.componentEditing = _.findWhere($scope.components, {
                        _id: angular.element(e.currentTarget).closest('.component').data('id')
                    });
                    var network = [];
                    var editIndex = e.currentTarget.attributes["data-index"] ? e.currentTarget.attributes["data-index"].value : null;
                    var parent_index = e.currentTarget.attributes["parent-data-index"] ? e.currentTarget.attributes["parent-data-index"].value : null;
                    var nested = parent_index ? true : false;
                    if (nested)
                        network = editIndex ? $scope.componentEditing.teamMembers[parent_index].networks[editIndex] : null;
                    else
                        network = editIndex ? $scope.componentEditing.networks[editIndex] : null;

                    var update = editIndex ? true : false;
                    $scope.openModal('social-links-modal');
                    // angular.element("#socialComponentModal").modal('show');

                    $scope.setSelectedSocialLink(network, $scope.componentEditing._id, update, nested, parent_index);

                });

                // remove click handler
                angular.element("#iframe-website").contents().find('body').off("click", ".image-gallery, .image-thumbnail, .meet-team-image");
                //add media modal click events to all images in image gallery

                angular.element("#iframe-website").contents().find('body').on("click", ".image-gallery, .image-thumbnail, .meet-team-image", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    angular.element("#media-manager-modal").modal('show');
                    $scope.showInsert = true;
                    $scope.imageChange = true;
                    $scope.componentArrTarget = e.currentTarget;
                    $scope.componentImageIndex = e.currentTarget.attributes["data-index"].value;
                    if (e.currentTarget.attributes["parent-index"] && e.currentTarget.attributes["number-per-page"]) {
                        $scope.componentImageIndex = (parseInt(e.currentTarget.attributes["parent-index"].value) * parseInt(e.currentTarget.attributes["number-per-page"].value)) + parseInt(e.currentTarget.attributes["data-index"].value);
                    }
                    $scope.componentEditing = _.findWhere($scope.components, {
                        _id: angular.element(e.currentTarget).closest('.component').data('id')
                    });
                });
            };

            if (iframeDoc.getElementById('body')) {
                elementBindingFn();
            }
        };

        /*
         * @resizeIframe
         * -
         */

        var w = angular.element(window);

        w.bind('resize', function() {
            $scope.resizeIframe();
            $scope.setToolbarsTop();
        });

        $scope.resizeIframe = function() {
            var iframe = document.getElementById("iframe-website");
            if (iframe) {
                //var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                //var offsetHeight = angular.element('#page-title').height() + angular.element('#page-actions').height();
                setTimeout(function() {
                    $scope.$apply(function() {
                        var editorToolbar = angular.element("#iframe-website").contents().find("#editor-toolbar");
                        var incrementHeight = 0;
                        
                        if(editorToolbar)
                            incrementHeight = incrementHeight + editorToolbar.height();
                        $scope.iframeHeight = ($("#iframe-website").contents().find("body").height() + 70 + incrementHeight) + "px";
                        
                    });
                }, 100);
            }
        };

        /*
         * @saveSocialLink
         * -
         */

        $scope.saveSocialLink = function(social, id, mode) {
            angular.element("#social-link-name .error").html("");
            angular.element("#social-link-name").removeClass('has-error');
            angular.element("#social-link-url .error").html("");
            angular.element("#social-link-url").removeClass('has-error');
            var old_value = _.findWhere($scope.networks, {
                name: $scope.social.selectedLink
            });
            var selectedName;
            switch (mode) {
                case "add":
                    if (social && social.name) {
                        if (!social.url || social.url == "") {
                            angular.element("#social-link-url .error").html("Link url can not be blank.");
                            angular.element("#social-link-url").addClass('has-error');
                            return;
                        }

                        if (social.url) {
                            var urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                            if (urlRegex.test(social.url) == false) {
                                angular.element("#social-link-url .error").html("Link url incorrect format");
                                angular.element("#social-link-url").addClass('has-error');
                                return;
                            }
                        }
                        selectedName = _.findWhere($scope.networks, {
                            name: social.name
                        });
                        if (selectedName) {
                            angular.element("#social-link-name .error").html("Link icon already exists");
                            angular.element("#social-link-name").addClass('has-error');
                            return;
                        }
                        var selectedUrl = _.findWhere($scope.networks, {
                            url: social.url
                        });
                        if (selectedUrl) {
                            angular.element("#social-link-url .error").html("Link url already exists");
                            angular.element("#social-link-url").addClass('has-error');
                            return;
                        }
                    } else {
                        angular.element("#social-link-url .error").html("Please enter link url.");
                        angular.element("#social-link-url").addClass('has-error');
                        angular.element("#social-link-name .error").html("Please select link icon.");
                        angular.element("#social-link-name").addClass('has-error');
                        return;
                    }
                    angular.element("#social-link-name .error").html("");
                    angular.element("#social-link-name").removeClass('has-error');
                    angular.element("#social-link-url .error").html("");
                    angular.element("#social-link-url").removeClass('has-error');
                    break;
                case "update":
                    if (social && social.name && social.url) {
                        var networks = angular.copy($scope.networks);

                        selectedName = _.findWhere(networks, {
                            name: old_value.name
                        });
                        selectedName.name = social.name;
                        selectedName.url = social.url;
                        selectedName.icon = social.icon;


                        var existingName = _.where(networks, {
                            name: social.name
                        });
                        var existingUrl = _.where(networks, {
                            url: social.url
                        });
                        if (existingName.length > 1) {
                            angular.element("#social-link-name .error").html("Link icon already exists");
                            angular.element("#social-link-name").addClass('has-error');
                            return;
                        } else if (existingUrl.length > 1) {
                            angular.element("#social-link-url .error").html("Link url already exists");
                            angular.element("#social-link-url").addClass('has-error');
                            return;
                        }
                    }
                    break;
            }
            if ($scope.meetTeamIndex !== null)
                $scope.updateTeamNetworks(old_value, mode, social, $scope.meetTeamIndex);
            else
                $scope.updateSocialNetworks(old_value, mode, social);
            $scope.social = {};
            $scope.meetTeamIndex = null;
            $scope.closeModal();
        };

        /*
         * @setSelectedLink
         * -
         */

        $scope.setSelectedLink = function(social_link) {
            $scope.social.name = social_link.name;
            $scope.social.icon = social_link.icon;
            $scope.social.url = social_link.url;
        };

        /*
         * @setSelectedSocialLink
         * -
         */

        $scope.setSelectedSocialLink = function(link, id, update, nested, index) {
            if (!$scope.social)
                $scope.social = {};
            if (nested)
                $scope.meetTeamIndex = index;
            else
                $scope.meetTeamIndex = null;
            if (update) {
                $scope.social.selectedLink = link.name;
                $scope.social.name = link.name;
                $scope.social.icon = link.icon;
                $scope.social.url = link.url;
            } else {
                $scope.social = {};
            }
            angular.element("#social-link-name .error").html("");
            angular.element("#social-link-name").removeClass('has-error');
            angular.element("#social-link-url .error").html("");
            angular.element("#social-link-url").removeClass('has-error');
            $scope.$apply(function() {
                $scope.networks = $scope.getSocialNetworks(nested, index);
            });
        };

        /*
         * @social_links
         * -
         */

        $scope.social_links = [{
            name: "adn",
            icon: "adn",
            tooltip: "Adn",
            url: "http://www.adn.com"
        }, {
            name: "bitbucket",
            icon: "bitbucket",
            tooltip: "BitBucket",
            url: "https://bitbucket.org"
        }, {
            name: "dropbox",
            icon: "dropbox",
            tooltip: "Dropbox",
            url: "https://www.dropbox.com"
        }, {
            name: "facebook",
            icon: "facebook",
            tooltip: "Facebook",
            url: "https://www.facebook.com"
        }, {
            name: "flickr",
            icon: "flickr",
            tooltip: "Flickr",
            url: "https://www.flickr.com"
        }, {
            name: "foursquare",
            icon: "foursquare",
            tooltip: "Four Square",
            url: "https://foursquare.com"
        }, {
            name: "github",
            icon: "github",
            tooltip: "Github",
            url: "https://github.com"
        }, {
            name: "google-plus",
            icon: "google-plus",
            tooltip: "Google Plus",
            url: "https://www.gmail.com"
        }, {
            name: "instagram",
            icon: "instagram",
            tooltip: "Instagram",
            url: "https://instagram.com"
        }, {
            name: "linkedin",
            icon: "linkedin",
            tooltip: "Linkedin",
            url: "https://www.linkedin.com"
        }, {
            name: "microsoft",
            icon: "windows",
            tooltip: "Microsoft",
            url: "http://www.microsoft.com"
        }, {
            name: "openid",
            icon: "openid",
            tooltip: "Open Id",
            url: "http://openid.com"
        }, {
            name: "pinterest",
            icon: "pinterest",
            tooltip: "Pinterest",
            url: "https://www.pinterest.com"
        }, {
            name: "reddit",
            icon: "reddit",
            tooltip: "Reddit",
            url: "http://www.reddit.com"
        }, {
            name: "comment-o",
            icon: "comment-o",
            tooltip: "Snapchat",
            url: "https://www.snapchat.com"
        }, {
            name: "soundcloud",
            icon: "soundcloud",
            tooltip: "Sound Cloud",
            url: "https://soundcloud.com"
        }, {
            name: "tumblr",
            icon: "tumblr",
            tooltip: "Tumblr",
            url: "https://www.tumblr.com"
        }, {
            name: "twitter",
            icon: "twitter",
            tooltip: "Twitter",
            url: "https://twitter.com"
        }, {
            name: "vimeo",
            icon: "vimeo-square",
            tooltip: "Vimeo",
            url: "https://vimeo.com"
        }, {
            name: "vine",
            icon: "vine",
            tooltip: "Vine",
            url: "http://www.vinemarket.com"
        }, {
            name: "vk",
            icon: "vk",
            tooltip: "Vk",
            url: "http://vk.com"
        }, {
            name: "desktop",
            icon: "desktop",
            tooltip: "Website",
            url: "http://www.website.com"
        }, {
            name: "yahoo",
            icon: "yahoo",
            tooltip: "Yahoo",
            url: "https://yahoo.com"
        }, {
            name: "youtube",
            icon: "youtube",
            tooltip: "Youtube",
            url: "https://www.youtube.com"
        }, {
            name: "yelp",
            icon: "yelp",
            tooltip: "Yelp",
            url: "http://www.yelp.com"
        }];

        /*
         * @toggleDropdown
         * -
         */

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };


        /*
         * @checkForDuplicatePage
         * - Check for duplicate page
         */

        $scope.checkForDuplicatePage = function()
        {
            
            WebsiteService.getSinglePage($scope.currentPage.websiteId, $scope.currentPage.handle, function(data) {
            if(data && data._id)
                {
                    
                    if(data._id !== $scope.currentPage._id)
                    {
                        toaster.pop('error', "Page URL " + $scope.currentPage.handle, "Already exists");
                    }
                }
            })
        }

        /*
         * @editPage
         * -
         */

        $scope.editPage = function() {
            $scope.isEditing = true;
            $scope.childScope.triggerEditMode();
            if ($scope.single_post) {
                $scope.childScope.copyPostMode();
                $scope.post_data = $scope.childScope.getPostData();
            }           
            setTimeout(function() {
                $scope.bindEvents();
            }, 1000)
            $scope.backup['website'] = angular.copy($scope['website']);
        };

        /*
         * @cancelPage
         * -
         */

        $scope.cancelPage = function() {
            $scope.checkForSaveBeforeLeave();
        };

        /*
         * @validateEditPage
         * -
         */

        $scope.editPageValidated = false;

        $scope.validateEditPage = function(page) {

            if (page.handle == '') {
                $scope.handleError = true;
                angular.element('#edit-page-url').parents('div.form-group').addClass('has-error');
            } else {
                $scope.handleError = false;
                angular.element('#edit-page-url').parents('div.form-group').removeClass('has-error');
            }
            if (page.title == '') {
                $scope.titleError = true;
                angular.element('#edit-page-title').parents('div.form-group').addClass('has-error');
            } else {
                $scope.titleError = false;
                angular.element('#edit-page-title').parents('div.form-group').removeClass('has-error');
            }
            if (page && page.title && page.title != '' && page.handle && page.handle != '') {
                $scope.editPageValidated = true;
            } else
                $scope.editPageValidated = false;
        };


        /*
         * @validateNewPage
         * -
         */

        $scope.newPageValidated = false;

        $scope.validateNewPage = function(page) {            
            if (!page.handle || page.handle == '') {
                angular.element('#new-page-url').parents('div.form-group').addClass('has-error');
            } else {
                angular.element('#new-page-url').parents('div.form-group').removeClass('has-error');
            }
            if (!page.title || page.title == '') {
                angular.element('#new-page-title').parents('div.form-group').addClass('has-error');
            } else {
                angular.element('#new-page-title').parents('div.form-group').removeClass('has-error');
            }
            if (page && page.title && page.title != '' && page.handle && page.handle != '') {
                $scope.newPageValidated = true;
            } else
                $scope.newPageValidated = false;
        };


        /*
         * @validateEditPost
         * -
         */

        $scope.editPostValidated = false;

        $scope.validateEditPost = function(post, update) {
            if (post.post_url == '') {
                $scope.handleError = true;
                angular.element('#edit-post-url').parents('div.form-group').addClass('has-error');
            } else {
                $scope.handleError = false;
                angular.element('#edit-post-url').parents('div.form-group').removeClass('has-error');
            }
            if (post.post_title == '') {
                $scope.titleError = true;
                angular.element('#edit-post-title').parents('div.form-group').addClass('has-error');
            } else {
                $scope.titleError = false;
                angular.element('#edit-post-title').parents('div.form-group').removeClass('has-error');
            }
            if (post && post.post_title && post.post_title != '' && post.post_url && post.post_url != '') {
                $scope.editPostValidated = true;
            } else
                $scope.editPostValidated = false;
            if(update)
                $scope.updateBlogPost(post);    
        };

        /*
         * @validateNewPost
         * -
         */

        $scope.newPostValidated = false;

        $scope.validateNewPost = function(post) {
            if (!post.post_url || post.post_url == '') {
                $scope.handleError = true;
                angular.element('#new-post-url').parents('div.form-group').addClass('has-error');
            } else {
                $scope.handleError = false;
                angular.element('#new-post-url').parents('div.form-group').removeClass('has-error');
            }
            if (!post.post_title || post.post_title == '') {
                $scope.titleError = true;
                angular.element('#new-post-title').parents('div.form-group').addClass('has-error');
            } else {
                $scope.titleError = false;
                angular.element('#new-post-title').parents('div.form-group').removeClass('has-error');
            }
            if (post && post.post_title && post.post_title != '' && post.post_url && post.post_url != '') {
                $scope.newPostValidated = true;
            } else
                $scope.newPostValidated = false;
        };


        /*
         * @savePage
         * -
         */

        $scope.savePage = function(autoSave) {
            $scope.saveLoading = true;
            $scope.isDirty = false;
            var msg = "Post Saved";
            if (autoSave)
                msg = "Auto Saved";
           
            $scope.childScope.checkOrSetPageDirty(true);

            if ($location.$$search['posthandle']) {
                $scope.single_post = true;
                $scope.validateEditPost($scope.post_data);

                if (!$scope.editPostValidated) {
                    $scope.saveLoading = false;
                    toaster.pop('error', "Post Title or URL can not be blank.");
                    return false;
                }
                $scope.childScope.savePostMode(toaster, msg);
                $scope.isEditing = true;                
                
            } else {
                $scope.validateEditPage($scope.currentPage);

                if (!$scope.editPageValidated) {
                    $scope.saveLoading = false;
                    toaster.pop('error', "Page Title or URL can not be blank.");
                    return false;
                }
                
                var iFrame = document.getElementById("iframe-website");
                if(!$scope.redirect)
                    $scope.updatePageComponents();
                
                WebsiteService.getSinglePage($scope.currentPage.websiteId, $scope.currentPage.handle, function(data) {
                    //TODO: Make this check on change of page title or url in the page settings modal
                    //TODO: Better way to handle this there should be check on server side itself while saving the page
                    if(data && data._id)
                    {
                        if(data._id !== $scope.currentPage._id)
                        {
                            toaster.pop('error', "Page URL " + $scope.currentPage.handle, "Already exists");
                            return false;
                        }
                    }
                    if ($scope.templateActive) {
                        $scope.template.config.components = $scope.currentPage.components;
                        WebsiteService.updateTemplate($scope.template._id, $scope.template, function() {
                            console.log('success');
                            toaster.pop('success', "Template Saved", "The " + $scope.currentPage.handle + " template was saved successfully.");
                        });
                    }
                                      

                    WebsiteService.updatePage($scope.currentPage.websiteId, $scope.currentPage._id, $scope.currentPage, function(data) {
                        $scope.isEditing = true;                        
                        $scope.saveBlogData();
                        if($scope.childScope.getAllBlogs)
                            $scope.originalBlogPosts  = angular.copy($scope.childScope.getAllBlogs());
                        WebsiteService.setEditedPageHandle($scope.currentPage.handle);
                        if (!$scope.redirect)
                            $scope.autoSavePage();
                        else
                            $scope.stopAutoSavePage();
                        if(!$scope.redirect)
                            if (autoSave)
                                toaster.pop('success', "Auto Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                            else
                                toaster.pop('success', "Page Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                        $scope.saveLoading = false;
                        $scope.redirect = false;
                        if($scope.originalCurrentPage.handle !== $scope.currentPage.handle)
                        {
                            window.location = '/admin/#/website/pages/?pagehandle=' + $scope.currentPage.handle;
                        }
                        //Update linked list                        
                        $scope.website.linkLists.forEach(function(value, index) {
                          if(value.handle === "head-menu") {
                            WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function(data) {
                                console.log('Updated linked list');    
                            });
                          }
                        }); 
                        // setTimeout(function() {
                        //     if(iFrame && iFrame.contentWindow)
                        //         $scope.activateCKEditor();
                        // }, 1000)
                    });
                    var data = {
                        _id: $scope.website._id,
                        accountId: $scope.website.accountId,
                        settings: $scope.website.settings
                    };
                });


            }
        };

        $scope.updatePageComponents = function(){
                var iFrame = document.getElementById("iframe-website");
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
                            //Hack for link plugin popup functionality
                            componentVarContents = componentVarContents.replace("data-cke-pa-onclick", "onclick");

                            var regex = /^<(\"[^\"]*\"|'[^']*'|[^'\">])*>/;
                            if (regex.test(componentVarContents)) {
                                var jHtmlObject = angular.element(componentVarContents);
                                var editor = jQuery("<p>").append(jHtmlObject);
                                editor.find(".cke_reset").remove();
                                editor.find(".cke_image_resizer").remove();
                                var img_anchors = editor.find("img[data-cke-real-element-type='anchor']");
                                img_anchors.each(function() {
                                  var data =  angular.element(this).attr('data-cke-realelement');
                                  var data_element = decodeURIComponent(data);
                                  $(this).replaceWith( $(data_element));
                                })
                                var newHtml = editor.html();
                                componentVarContents = newHtml;
                            }


                            var setterKey, pa;
                            //if contains an array of variables
                            if (componentVar.indexOf('.item') > 0 && componentEditable[i2].attributes['data-index'] && !componentEditable[i2].attributes['parent-data-index']) {
                                //get index in array
                                if (!angular.element(componentEditable[i2]).parents().hasClass("slick-cloned")) {
                                    var first = componentVar.split(".")[0];
                                    var second = componentEditable[i2].attributes['data-index'].value;
                                    var third = componentVar.split(".")[2];
                                    matchingComponent[first][second][third] = componentVarContents;
                                }
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
                    if(matchedComponent.type === "single-post")
                    {
                        var post_tags = angular.copy($scope.childScope.blog.post.post_tags);
                        if(post_tags)
                        {
                           post_tags.forEach(function(v, i) {
                            if (v.text)
                                post_tags[i] = v.text;
                            });
                            matchedComponent.post_tags = post_tags;
                        }
                        matchedComponent.publish_date = $scope.childScope.blog.post.publish_date;                        
                    }
                    newComponentOrder.push(matchedComponent);
                };
                $scope.currentPage.components = newComponentOrder;
        }
        $scope.saveBlogData = function() {
            if(!$scope.redirect)
                $scope.childScope.updateBlogPageData(iFrame);                            
            $scope.blogposts = $scope.childScope.getAllBlogs();
            $scope.blogposts.forEach(function(value, index) {
                var matching_post = _.find($scope.originalBlogPosts, function(item) {
                    return item._id === value._id
                })
                if(!angular.equals(matching_post, value))
                    WebsiteService.updatePost($scope.currentPage._id, value._id, value, function(data) {});
            })
        }


        $scope.updateBlogPost = function(post_data)
        {
            $scope.childScope.updateBlogPost(post_data);
        }

        /*
         * @updatePage
         * - update the current page to a different one
         */

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
                $scope.single_post = true;
                route = '/page/' + sPage + '/' + $location.$$search['posthandle'] + '?editor=true';
                //document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');
            }

            //TODO - replace with sending route through scope to update without iframe refresh
            //document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');
            if ($location.$$search['custid']) {
                current_src = document.getElementById("iframe-website").getAttribute("src");
                document.getElementById("iframe-website").setAttribute("src", current_src + '&custid=' + $location.$$search['custid']);
            }

            //get components from page
            if ($scope.currentPage && $scope.currentPage.components) {
                $scope.components = $scope.currentPage.components;
            } else {
                $scope.components = [];
            }

            that.originalCurrentPageComponents = $scope.currentPage.components;
            $scope.originalCurrentPage = angular.copy($scope.currentPage);
            
            WebsiteService.getPages(function(pages) {
                var currentPage = $scope.pageSelected;
                var parsed = angular.fromJson(pages);
                var arr = [];

                for (var x in parsed) {
                    arr.push(parsed[x]);
                }
                $scope.allPages = arr;
                $scope.filterdedPages = $filter('orderBy')($scope.allPages, "title", false);
                that.allPages = arr;
                WebsiteService.getPageVersions($scope.currentPage._id, function(pageVersions) {
                    $scope.pageVersions = pageVersions;
                });

            });
        };

        /*
         * @addTeamMember
         * -
         */

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
        };

        /*
         * @addFeatureList
         * -
         */

        $scope.addFeatureList = function() {
            $scope.componentEditing.features.push({
                "top": "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:#0061a7;font-size:96px;\"></span></div>",
                "content": "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
            });
            $scope.saveComponent();
        };

        /*
         * @stringifyAddress
         * -
         */

        $scope.stringifyAddress = function(address) {
            if (address) {
                return _.filter([address.address, address.city, address.state, address.zip], function(str) {
                    return str !== "";
                }).join(", ")
            }
        };

        /*
         * @updateContactUsAddress
         * -
         */

        $scope.updateContactUsAddress = function(location) {

            if ($scope.componentEditing.location.city) {
                angular.element('#location-city').parents('.form-group').find('.error').html('');
                angular.element('#location-city').parents('.form-group').removeClass('has-error');
            } else {
                angular.element('#location-city').parents('.form-group').addClass('has-error');
                angular.element('#location-city').parents('.form-group').find('.error').html('City is required');
            }

            if ($scope.componentEditing.location.state) {
                angular.element('#location-state').parents('.form-group').find('.error').html('');
                angular.element('#location-state').parents('.form-group').removeClass('has-error');
            } else {
                angular.element('#location-state').parents('.form-group').addClass('has-error');
                angular.element('#location-state').parents('.form-group').find('.error').html('State is required');
            }

            GeocodeService.getGeoSearchAddress($scope.stringifyAddress($scope.componentEditing.location), function(data) {
                if (data.lat && data.lon) {
                    $scope.componentEditing.location.lat = data.lat;
                    $scope.componentEditing.location.lon = data.lon;
                    $scope.saveContactComponent();
                }
            });
        };

        /*
         * @saveContactComponent
         * -
         */

        $scope.saveContactComponent = function() {
            var currentComponentId = $scope.componentEditing._id;
            $scope.updateSingleComponent(currentComponentId);
            $scope.childScope.updateContactComponent($scope.currentPage.components);
        };

        /*
         * @addComponent
         * -
         */

        $scope.addComponent = function(addedType) {
            var pageId = $scope.currentPage._id;
            var componentType = null;
            if (addedType.type === 'footer' || addedType.type === 'navigation' || addedType.type === 'single-post'
                || addedType.type === 'blog-teaser' || addedType.type === 'blog') {
                componentType = _.findWhere($scope.currentPage.components, {
                    type: addedType.type
                });
                if (componentType) {
                    toaster.pop('error', componentType.type + " component already exists");
                    return;
                }
            }
            
            $scope.components = $scope.currentPage.components;

            var cmpVersion = addedType.version;

            WebsiteService.saveComponent(addedType, cmpVersion || 1, function(data) {

                if (data) {
                    var newComponent = data;
                    var indexToadd = $scope.editComponentIndex ? $scope.editComponentIndex : 1
                    $scope.currentPage.components.splice(indexToadd, 0, newComponent);
                    //$scope.currentPage.components.push(newComponent);
                    //$scope.components.push(newComponent);
                    $scope.components = $scope.currentPage.components;
                    $scope.updateIframeComponents();
                    // Update contact component
                    if (addedType.type === 'contact-us')
                        $scope.childScope.updateContactComponent($scope.currentPage.components);
                    //TODO: get updateIframeComponents callback
                    setTimeout(function() {
                            $scope.activateCKEditor();
                        }, 1000)
                        //$scope.scrollToIframeComponent(newComponent.anchor);
                    $scope.closeModal();
                    toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    //$scope.resizeIframe();
                }
            });
        };

        /*
         * @deleteComponent
         * -
         */

        $scope.deleteComponent = function(componentId) {
            var pageId = $scope.currentPage._id;
            var deletedType;
            for (var i = 0; i < $scope.components.length; i++) {
                if ($scope.components[i]._id == componentId) {
                    deletedType = $scope.components[i].type;
                    $scope.components.splice(i, 1);
                    break;
                }
            }
            $scope.updateIframeComponents();
            $scope.componentEditing = null;
            setTimeout(function() {
                $scope.resizeIframe();
            }, 1000)

            $scope.$apply(function() {
                toaster.pop('success', "Component Deleted", "The " + deletedType + " component was deleted successfully.");
            });
        };

        /*
         * @updateIframeComponents
         * -
         */

        $scope.updateIframeComponents = function(fn) {
            $scope.childScope.updateComponents($scope.components);
            if (fn) {
                fn();
            }
        };

        /*
         * @scrollToIframeComponent
         * -
         */

        $scope.scrollToIframeComponent = function(section) {
            iFrame && iFrame.contentWindow && iFrame.contentWindow.scrollTo && iFrame.contentWindow.scrollTo(section)
        };

        /*
         * @activateCKEditor
         * -
         */

        $scope.activateCKEditor = function() {
            $scope.bindEvents();
            $scope.childScope.activateCKEditor()
        };

        /*
         * @deactivateCKEditor
         * -
         */

        $scope.deactivateCKEditor = function() {
            $scope.childScope.deactivateCKEditor()
        };

        /*
         * @editComponent
         * -
         */

        $scope.editComponent = function(componentId) {
            if ($scope.single_post) {
                $scope.childScope.refreshPost();
                return;
            }
            $scope.$apply(function() {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });

                if ($scope.componentEditing) {
                    $scope.componentEditing.icon = _.findWhere($scope.componentTypes, {
                        type: $scope.componentEditing.type
                    }).icon;
                    $scope.componentEditing.header_title = _.findWhere($scope.componentTypes, {
                        type: $scope.componentEditing.type
                    }).title;
                }

                if ($scope.componentEditing.type === "simple-form" && !$scope.componentEditing.fields.length) {
                    $scope.componentEditing.fields.push({
                        "display": "First Name",
                        "value": false,
                        "name": "first"
                    }, {
                        "display": "Last Name",
                        "value": false,
                        "name": "last"
                    }, {
                        "display": "Phone Number",
                        "value": false,
                        "name": "phone"
                    })
                }

                if ($scope.componentEditing.type === "contact-us") {
                    if($scope.componentEditing.hours) {
                        _.each($scope.componentEditing.hours, function(element, index) {
                            if(element.day == "Sat" || element.day == "Sun") {
                                if (element.start == "")
                                    element.start = "9:00 am";
                                if (element.end == "")
                                    element.end = "5:00 pm";
                                if (!element.start2 || element.start2 == "")
                                    element.start2 = "9:00 am";
                                if (!element.end2 || element.end2 == "")
                                    element.end2 = "9:00 am";
                            }
                     });
                    }
                }

            });
            $scope.originalComponent = angular.copy($scope.componentEditing);
            $scope.contactHoursInvalid = false;
            $scope.contactHours = [];
            
            for(var i=0; i<=6; i++)
            {
                $scope.contactHours.push({ "valid" : true});
            }

            if ($scope.componentEditing) {
                WebsiteService.getComponentVersions($scope.componentEditing.type, function(versions) {
                    $scope.componentEditingVersions = versions;
                    if ($scope.componentEditing && $scope.componentEditing.version) {
                        $scope.componentEditing.version = $scope.componentEditing.version.toString();
                        $scope.versionSelected = $scope.componentEditing.version;
                    }
                    $scope.originalCurrentPage = angular.copy($scope.currentPage);
                });
            }
            angular.element('#feature-convert').iconpicker({
                iconset: 'fontawesome',
                icon: 'fa-credit-card',
                rows: 5,
                cols: 5,
                placement: 'right',
            });

            angular.element('#feature-convert').on('change', function(e) {
                if (!$scope.featureIcon) {
                    $scope.featureIcon = {};
                }
                if ($scope.featureIcon) {
                    $scope.featureIcon.icon = e.icon;
                }
            });
        };

        /*
         * @revertComponent
         * -
         */

        $scope.revertComponent = function() {
            var componentId = $scope.componentEditing._id;
            for (var i = 0; i < $scope.components.length; i++) {
                if ($scope.components[i]._id === componentId) {
                    $scope.components[i] = $scope.originalComponent
                }
            }
            $scope.currentPage.components = $scope.components;
            if($scope.componentEditing.type === 'navigation')
            {
            $scope.website.linkLists = $scope.backup["website"].linkLists;
            if ($scope.componentEditing.customnav) {
                $scope.website.linkLists.forEach(function(value, index) {
                if (value.handle === "head-menu") {
                    $scope.saveCustomComponent();
                }
                });
            } else {
                $scope.website.linkLists.forEach(function(value, index) {
                if (value.handle === "head-menu") {
                    $scope.childScope.updateWebsite($scope.website);
                }
                });
            }
            }
            
            $scope.updateIframeComponents();
            setTimeout(function() {
                $scope.activateCKEditor();
            }, 1000)
            $scope.closeModal();
        };

        /*
         * @saveComponent
         * -
         */

        $scope.saveComponent = function(update) {

            var componentId = $scope.componentEditing._id;
            //if (!update)
                ////$scope.updateSingleComponent(componentId);

            var componentIndex;
            for (var i = 0; i < $scope.components.length; i++) {
                if ($scope.components[i]._id === componentId) {
                    $scope.components[i] = $scope.componentEditing
                }
            }
            $scope.currentPage.components = $scope.components;
            $scope.updateIframeComponents();
            $scope.isEditing = true;
            $scope.isDirty = true;
            setTimeout(function() {
                $scope.activateCKEditor();
            }, 1000)
        };


        /*
         * @updateComponentWithEditor
         * -
         */

        $scope.updateComponentWithEditor = function() {
            $scope.saveComponent();
            setTimeout(function() {
                $scope.activateCKEditor();
            }, 1000)
        };

        /*
         * @updateSingleComponent
         * -
         */

        $scope.updateSingleComponent = function(componentId) {
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

                        var regex = /^<(\"[^\"]*\"|'[^']*'|[^'\">])*>/;
                        if (regex.test(componentVarContents)) {
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
                            if (!angular.element(componentEditable[i2]).parents().hasClass("slick-cloned")) {
                                var first = componentVar.split(".")[0];
                                var second = componentEditable[i2].attributes['data-index'].value;
                                var third = componentVar.split(".")[2];
                                if (matchingComponent[first][second])
                                    matchingComponent[first][second][third] = componentVarContents;
                            }

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
                            if (matchingComponent[first][second][third][fourth])
                                matchingComponent[first][second][third][fourth][last] = componentVarContents;
                        }
                        //if needs to traverse a single
                        if (componentVar.indexOf('-') > 0) {
                            var first = componentVar.split("-")[0];
                            var second = componentVar.split("-")[1];
                            if (matchingComponent[first])
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
        };

        /*
         * @saveCustomComponent
         * -
         */

        $scope.saveCustomComponent = function(networks) {
            $scope.childScope.updateCustomComponent($scope.currentPage.components, networks ? networks : $scope.componentEditing.networks)
                //iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent($scope.currentPage.components, networks ? networks : $scope.componentEditing.networks);
        };

        /*
         * @deletePage
         * -
         */

        $scope.deletePage = function() {
            $scope.childScope.checkOrSetPageDirty(true);
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Do you want to delete this page",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete page!",
                    cancelButtonText: "No, do not delete page!",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        SweetAlert.swal("Saved!", "Page is deleted.", "success");
                        var pageId = $scope.currentPage._id;
                        var websiteId = $scope.currentPage.websiteId;
                        var title = $scope.currentPage.title;

                        WebsiteService.deletePage(pageId, websiteId, title, function(data) {
                            toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
                            $scope.closeModal();
                            $location.path("/website/pages");
                        });
                    } else {
                        SweetAlert.swal("Cancelled", "Page not deleted.", "error");
                    }
                });
        };

        /*
         * @deletePost
         * -
         */

        $scope.deletePost = function(post_data) {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Do you want to delete this page",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete post!",
                    cancelButtonText: "No, do not delete post!",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        SweetAlert.swal("Saved!", "Post is deleted.", "success");
                        $scope.closeModal();
                        $scope.childScope.deletePost(post_data, toaster);
                    } else {
                        SweetAlert.swal("Cancelled", "Post not deleted.", "error");
                    }
                });
        };

        /*
         * @deletePost
         * - selected component when choosing from modal
         */

        $scope.selectComponent = function(type) {
            if (type.enabled) {
                $scope.selectedComponent = type;
            }
        };

        /*
         * @insertMedia
         * - insertmedia into various components
         */

        $scope.insertMedia = function(asset) {
            if ($scope.imageChange) {
                $scope.imageChange = false;
                var type = $scope.componentEditing.type;
                //if image/text component
                if (type == 'image-text') {
                    $scope.componentEditing.imgurl = asset.url;
                } else if (type == 'feature-list') {
                    var targetIndex = angular.element($scope.componentArrTarget).closest('.single-feature').data('index');
                    $scope.componentEditing.features[targetIndex].imgurl = asset.url;
                } else if (type == 'simple-form') {
                    $scope.componentEditing.imgurl = asset.url;
                } else if (type == 'image-gallery') {
                    $scope.componentEditing.images[$scope.componentImageIndex].url = asset.url;
                } else if (type == 'thumbnail-slider') {
                    $scope.componentEditing.thumbnailCollection[$scope.componentImageIndex].url = asset.url;
                } else if (type == 'meet-team') {
                    $scope.componentEditing.teamMembers[$scope.componentImageIndex].profilepic = asset.url;
                } else {
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
                $scope.childScope.addCKEditorImage(asset.url, $scope.inlineInput, $scope.isEditMode);
                return;
            } else if ($scope.logoImage && $scope.componentEditing) {
                $scope.logoImage = false;
                $scope.componentEditing.logourl = asset.url;
            } else if ($scope.changeblobImage) {
                $scope.changeblobImage = false;
                $scope.blog_post.featured_image = asset.url;
                var iFrame = document.getElementById("iframe-website");
                $scope.childScope.setBlogImage(asset.url);
                iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent();
                return;
            } else if ($scope.imgGallery && $scope.componentEditing) {
                $scope.imgGallery = false;
                $scope.componentEditing.images.splice($scope.imgGalleryIndex + 1, 0, {
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

        /*
         * @checkIfSubdomaddCKEditorImageInputainExists
         * - when changing the subdomain associated with the account, check to make sure it exisits
         */

        $scope.checkIfSubdomaddCKEditorImageInputainExists = function() {
            var parent_div = angular.element('div.form-group.subdomain');
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

        /*
         * @locationChangeStart
         * - Before user leaves editor, ask if they want to save changes
         */

        $scope.changesConfirmed = false;
        $scope.isDirty = false;

        var offFn = $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
            var isDirty = false;
            var iFrame = document.getElementById("iframe-website");
            if ($scope.childScope && $scope.childScope.checkOrSetPageDirty) {
                var isDirty = $scope.childScope.checkOrSetPageDirty() || $scope.isDirty;                
            }

            if (isDirty && !$scope.changesConfirmed  && !$scope.duplicate) {
                event.preventDefault();
                $scope.updatePageComponents();
                if($scope.childScope.updateBlogPageData)
                    $scope.childScope.updateBlogPageData(iFrame);
                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "You have unsaved data that will be lost",
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
                            $scope.redirect = true;                            
                            $scope.savePage();
                        } else {
                            SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
                        }
                        $scope.changesConfirmed = true;
                        $scope.isDirty = false;
                        //set window location
                        window.location = newUrl;
                        offFn();
                    });
            } else if ($scope.changesConfirmed) {
                $scope.stopAutoSavePage();
            } else {
                $scope.stopAutoSavePage();
            }
        });

        /*
         * @initializeLinks
         * -
         */

        $scope.initializeLinks = function(status) {
            $scope.addLink = status;
            $scope.newLink = {
                linkUrl: null,
                linkTitle: null,
                linkType: null
            };
        };

        /*
         * @setLinkUrl
         * -
         */

        $scope.setLinkUrl = function() {
            $scope.newLink.linkTitle = angular.element("#linkSection option:selected").html();
        };

        /*
         * @setLinkTitle
         * -
         */

        $scope.setLinkTitle = function(value, index, newLink) {
            var newArray = _.first(angular.copy($scope.currentPage.components), [index + 1]);
            var hash = _.filter(newArray, function(obj) {
                return obj.type === value;
            })
            if (hash.length > 1)
                return value.replace("-", " ") + "-" + (hash.length - 1);
            else
                return value.replace("-", " ");
        };

        /*
         * @deleteLinkFromNav
         * -
         */

        $scope.deleteLinkFromNav = function(index) {
            if ($scope.componentEditing.customnav) {
                $scope.componentEditing.linkLists.forEach(function(value) {
                    if (value.handle === "head-menu") {
                        value.links.splice(index, 1);
                        setTimeout(function() {
                            $scope.updateLinkList();
                        }, 1000)
                    }
                });
            } else {
                $scope.website.linkLists.forEach(function(value) {
                    if (value.handle === "head-menu") {
                        value.links.splice(index, 1);
                        setTimeout(function() {
                            $scope.updateLinkList();
                        }, 1000)
                    }
                });
            }
        };

        /*
         * @addLinkToNav
         * -
         */

        $scope.addLinkToNav = function() {

            if ($scope.newLink && $scope.newLink.linkTitle && $scope.newLink.linkUrl) {
                if ($scope.componentEditing.customnav) {
                    if (!$scope.componentEditing.linkLists) {
                        $scope.componentEditing.linkLists = [];
                        $scope.componentEditing.linkLists.push({
                            name: "Head Menu",
                            handle: "head-menu",
                            links: []
                        })
                    }
                    $scope.componentEditing.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            value.links.push({
                                label: $scope.newLink.linkTitle,
                                type: "link",
                                linkTo: {
                                    data: $scope.newLink.linkUrl,
                                    type: $scope.newLink.linkType
                                }
                            });
                            $scope.initializeLinks(false);
                        }
                    });
                } else {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            value.links.push({
                                label: $scope.newLink.linkTitle,
                                type: "link",
                                linkTo: {
                                    data: $scope.newLink.linkUrl,
                                    type: $scope.newLink.linkType
                                }
                            });
                            $scope.initializeLinks(false);
                        }
                    });
                }

            }
            setTimeout(function() {
                $scope.updateLinkList();
            }, 1000)
        };

        /*
         * @updateLinkList
         * - when the navigation is reordered, update the linklist in the website object
         */

        $scope.updateLinkList = function(index) {
            var linkLabelsArr = [];
            var editedLinksLists = angular.element('.head-menu-links');
            // if(index)
            // editedLinksLists.splice(index,1);
            for (var i = 0; i < editedLinksLists.length; i++) {
                var linkLabel = editedLinksLists[i].attributes['data-label'].value;
                if (linkLabel)
                    linkLabelsArr.push(linkLabel);
            }
            if (linkLabelsArr.length) {
                if ($scope.componentEditing.customnav) {
                    $scope.componentEditing.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            var newLinkListOrder = [];
                            for (var i = 0; i < editedLinksLists.length; i++) {
                                if (value) {
                                    var matchedLinkList = _.findWhere(value.links, {
                                        label: linkLabelsArr[i]
                                    });
                                    newLinkListOrder.push(matchedLinkList);
                                }
                            };
                            if (newLinkListOrder.length) {
                                $scope.componentEditing.linkLists[index].links = newLinkListOrder;
                                $scope.saveCustomComponent();
                            }
                        }
                    });
                } else {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            var newLinkListOrder = [];
                            for (var i = 0; i < editedLinksLists.length; i++) {
                                if (value) {
                                    var matchedLinkList = _.findWhere(value.links, {
                                        label: linkLabelsArr[i]
                                    });
                                    newLinkListOrder.push(matchedLinkList);
                                }
                            };
                            if (newLinkListOrder.length) {
                                $scope.website.linkLists[index].links = newLinkListOrder;
                                $scope.childScope.updateWebsite($scope.website);
                            }

                        }
                    });
                }

            } else {

                if ($scope.componentEditing.customnav) {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            $scope.componentEditing.linkLists[index].links = [];
                            $scope.saveCustomComponent();
                        }
                    });
                } else {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            $scope.website.linkLists[index].links = [];
                            $scope.childScope.updateWebsite($scope.website);
                        }
                    });
                }

            }
        };

        /*
         * @sortableOptions
         * -
         */

        $scope.sortableOptions = {
            orderChanged: function(event) {
                $scope.updateLinkList();
            },
            parentElement: "#component-setting-modal .tab-content",
            scrollableContainer: 'reorderNavBarContainer'
        };

        /*
         * @updateSocialNetworks
         * -
         */

        $scope.updateSocialNetworks = function(old_value, mode, new_value) {
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
        };

        /*
         * @updateTeamNetworks
         * -
         */

        $scope.updateTeamNetworks = function(old_value, mode, new_value, parent_index) {
            var selectedName;
            switch (mode) {
                case "add":
                    if (new_value && new_value.name && new_value.url) {
                        if (!$scope.componentEditing.teamMembers[parent_index].networks)
                            $scope.componentEditing.teamMembers[parent_index].networks = [];
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
        };

        /*
         * @getSocialNetworks
         * -
         */

        $scope.getSocialNetworks = function(nested, parent_index) {
            if (nested)
                return $scope.componentEditing.teamMembers[parent_index].networks;
            else
                return $scope.componentEditing.networks;
        };

        /*
         * @autoSavePage
         * -
         */

        $scope.autoSavePage = function() {
            $scope.stopAutoSavePage();
            stopInterval = $interval(function() {
                $scope.savePage(true);
            }, $scope.timeInterval);
        };

        /*
         * @stopAutoSavePage
         * -
         */

        $scope.stopAutoSavePage = function() {
            if (angular.isDefined(stopInterval)) {
                $interval.cancel(stopInterval);
                stopInterval = undefined;
            }
        };


        /********** LISTENERS ***********/

        /*
         * @deleteFeatureList
         * -
         */

        $scope.deleteFeatureList = function(componentId, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.features.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @addNewFeatureList
         * -
         */

        $scope.addNewFeatureList = function(componentId, index, newFeature) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            //$scope.updateSingleComponent(componentId);
            $scope.componentEditing.features.splice(index + 1, 0, newFeature)
            $scope.saveCustomComponent();
        };

        /*
         * @clickImageButton
         * -
         */

        $scope.clickImageButton = function(editor, edit) {
            $scope.insertMediaImage = true;
            $scope.inlineInput = editor;
            $scope.isEditMode = edit;
            //$scope.openModal('mediamodal');
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @changeBlogImage
         * -
         */

        $scope.changeBlogImage = function(blog) {
            $scope.changeblobImage = true;
            $scope.blog_post = blog;
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @setPostImage
         * -
         */

        $scope.setPostImage = function(componentId) {
            $scope.postImage = true;
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @addImageToGallery
         * -
         */

        $scope.addImageToGallery = function(componentId, index) {
            $scope.imgGallery = true;
            $scope.imgGalleryIndex = index;
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @deleteImageFromGallery
         * -
         */

        $scope.deleteImageFromGallery = function(componentId, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.images.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @addImageToThumbnail
         * -
         */

        $scope.addImageToThumbnail = function(componentId) {
            $scope.imgThumbnail = true;
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @deleteImageFromThumbnail
         * -
         */

        $scope.deleteImageFromThumbnail = function(componentId, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.thumbnailCollection.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @changeProfilePhoto
         * -
         */

        $scope.changeProfilePhoto = function(componentId, customer) {
            $scope.profilepic = true;
            $scope.customerAccount = customer;
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @changeLogoImage
         * -
         */

        $scope.changeLogoImage = function(componentId) {
            $scope.logoImage = true;
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @getPostImageUrl
         * -
         */

        $scope.getPostImageUrl = function() {
            return $scope.postImageUrl;
        };

        /*
         * @deleteTeamMember
         * -
         */

        $scope.deleteTeamMember = function(componentId, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.teamMembers.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @deleteTestimonial
         * -
         */

        $scope.deleteTestimonial = function(componentId, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.testimonials.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @updateAdminPageScope
         * -
         */

        $scope.updateAdminPageScope = function(page) {
            $scope.singlePost = false;
            if (!$scope.$$phase) {
                $scope.$apply(function() {
                    //editBlockUI.stop();
                    $scope.iframeLoaded = true;
                    $scope.autoSavePage();
                })
            }

            if (page) {
                if (!$scope.currentPage && !$scope.$$phase) {
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
        };

        /*
         * @checkIfSinglePost
         * -
         */

        $scope.checkIfSinglePost = function(post) {
            if (post) {
                $scope.singlePost = true;
                $scope.childScope.copyPostMode();
                $scope.post_data = post;
            }
        };

        /*
         * @showToaster
         * -
         */

        $scope.showToaster = function(value, toast, msg, post, redirect) {            
            if (toast)
                $scope.$apply(function() {
                    toaster.pop('success', msg);
                    if(post)
                    {
                        $scope.saveLoading = false;
                        $scope.post_data = $scope.childScope.getPostData();
                        if($scope.post_data.post_url && $location.$$search['posthandle'] !== $scope.post_data.post_url)
                            window.location = '/admin/#/website/posts/?posthandle=' + $scope.post_data.post_url;
                    }
                    
                    if (redirect)
                        $location.path("/website/posts");
                    else if(post)
                       $scope.post_data = post;
                })
        };

        /*
         * @deletePricingTable
         * -
         */

        $scope.deletePricingTable = function(componentId, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.tables.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @addPricingTable
         * -
         */

        $scope.addPricingTable = function(componentId, newTable, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.tables.splice(index + 1, 0, newTable);
            $scope.saveCustomComponent();
        };

        /*
         * @deletePricingTableFeature
         * -
         */

        $scope.deletePricingTableFeature = function(componentId, index, parentIndex) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.tables[parentIndex].features.splice(index, 1);
            $scope.saveCustomComponent();
        };

        /*
         * @addPricingTableFeature
         * -
         */

        $scope.addPricingTableFeature = function(componentId, newTable, index, parentIndex) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.tables[parentIndex].features.splice(index + 1, 0, newTable);
            $scope.saveCustomComponent();
        };

        /*
         * @addTeamMember
         * -
         */

        $scope.addTeamMember = function(componentId, newTeam, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.teamMembers.splice(index + 1, 0, newTeam);
            $scope.saveCustomComponent();
        };

        /*
         * @addTestimonial
         * -
         */

        $scope.addTestimonial = function(componentId, newTestimonial, index) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.testimonials.splice(index + 1, 0, newTestimonial);
            $scope.saveCustomComponent();
        };

        /*
         * @updateComponent
         * -
         */

        $scope.updateComponent = function(componentId) {
            //update single component
            return $scope.updateSingleComponent(componentId);
        };

        /*
         * @Media button click
         * -
         */

        $scope.insertMediaOnClick = function(componentId) {
            var editor = $scope.childScope.getActiveEditor();
            $scope.clickImageButton(editor, false);
        };

       
        /*
         * @getProducts
         * - get a list of products
         */

         $scope.availableProductTags = [];

         ProductService.getProducts(function (products) {
            _.each(products, function(product) {
                if (product.tags && product.tags.length > 0) {
                    _.each(product.tags, function(tag) {
                        if($scope.availableProductTags.indexOf(tag) === -1)
                            $scope.availableProductTags.push(tag);
                    });
                }
            });
          $scope.availableProductTagsString = $scope.availableProductTags.join(","); 
          $scope.products = products;
        });

        /*
         * @validateHours
         * 
         */

        $scope.validateHours = function(hours, index)
        {
            $scope.contactHours[index].valid = true;
            if(!hours.closed)
            {
                var startTime = hours.start;
                var endTime = hours.end;
                if(startTime && endTime)
                {
                    startTime = startTime.split(" ")[1] == 'pm' && startTime.split(":")[0] != '12' ? parseInt(startTime.split(":")[0]) + 12 : parseInt(startTime.split(":")[0])
                    endTime = endTime.split(" ")[1] == 'pm' && endTime.split(":")[0] != '12' ? parseInt(endTime.split(":")[0]) + 12 : parseInt(endTime.split(":")[0])
                    startTime = parseInt(hours.start.split(":")[1]) == 30 ? startTime + 0.5 : startTime;
                    endTime = parseInt(hours.end.split(":")[1]) == 30 ? endTime + 0.5 : endTime;    
                }
                
                if(hours.split && $scope.componentEditing.splitHours)
                {
                    angular.element("#business_hours_start_"+index).removeClass('has-error');
                    angular.element("#business_hours_start2_"+index).removeClass('has-error');
                    angular.element("#business_hours_end_"+index).removeClass('has-error');
                    var startTime2 = hours.start2;
                    var endTime2 = hours.end2;
                    if(startTime2 && endTime2)
                    {
                        startTime2 = startTime2.split(" ")[1] == 'pm' && startTime2.split(":")[0] != '12' ? parseInt(startTime2.split(":")[0]) + 12 : parseInt(startTime2.split(":")[0])
                        endTime2 = endTime2.split(" ")[1] == 'pm' && endTime2.split(":")[0] != '12' ? parseInt(endTime2.split(":")[0]) + 12 : parseInt(endTime2.split(":")[0])
                        startTime2 = parseInt(hours.start2.split(":")[1]) == 30 ? startTime2 + 0.5 : startTime2;
                        endTime2 = parseInt(hours.end2.split(":")[1]) == 30 ? endTime2 + 0.5 : endTime2;    
                    }
                    
                    
                    var msg = ""
                    if(startTime > endTime || startTime > startTime2 || startTime > endTime2)
                    {
                        if(startTime > endTime)
                        { 
                            angular.element("#business_hours_start_"+index).addClass('has-error');
                        }
                        else if(startTime > startTime2)
                        {
                            angular.element("#business_hours_start_"+index).addClass('has-error');
                        }
                        else if(startTime > endTime2)
                        {
                            angular.element("#business_hours_start_"+index).addClass('has-error');
                        }
                        $scope.contactHours[index].valid = false;
                    }
                    if(endTime > startTime2 || endTime > endTime2)
                    {
                        
                        if(endTime > startTime2)
                        {
                            angular.element("#business_hours_end_"+index).addClass('has-error');
                        }
                        else if(endTime > endTime2)
                        {
                            angular.element("#business_hours_end_"+index).addClass('has-error');
                        }
                        $scope.contactHours[index].valid = false;
                    }                        
                    if(startTime2 > endTime2)
                    {
                        angular.element("#business_hours_start2_"+index).addClass('has-error');
                        $scope.contactHours[index].valid = false;
                    }
                    
                }
                else if(!hours.wholeday)
                {        
                    angular.element("#business_hours_start_"+index).removeClass('has-error');            
                    if(startTime > endTime)
                    {
                        angular.element("#business_hours_start_"+index).addClass('has-error');
                        $scope.contactHours[index].valid = false;
                    }
                }
            }

            var validate = _.where($scope.contactHours, {
                valid: false
            });
            if(validate && validate.length)
                $scope.contactHoursInvalid = true;
            else
                $scope.contactHoursInvalid = false;

        }

        /*
         * @numberOfProductOptions
         * - list of product options for the dropdown in component settings
         */

        $scope.numberOfProductOptions = [
          {
            name: 'All',
            value: 'Infinity'
          }, {
            name: '1',
            value: 1
          }, {
            name: '2',
            value: 2
          }, {
            name: '3',
            value: 3
          }, {
            name: '4',
            value: 5
          }, {
            name: '5',
            value: 5
          }, {
            name: '10',
            value: 10
          }, {
            name: '15',
            value: 15
          }, {
            name: '20',
            value: 20
          }
        ];

        $scope.checkForSaveBeforeLeave = function(url, reload)
        {
            $scope.isDirty = false;
            var isDirty = false;
            var iFrame = document.getElementById("iframe-website");
            if ($scope.childScope.checkOrSetPageDirty) {
                var isDirty = $scope.childScope.checkOrSetPageDirty() || $scope.isDirty;
            }
            $scope.childScope.checkOrSetPageDirty(true);
            var redirectUrl = url; 
            if(!redirectUrl)
                redirectUrl = $location.$$search['posthandle'] ? "/admin/#/website/posts" : "/admin/#/website/pages";
            if (isDirty) {
                event.preventDefault();
                $scope.updatePageComponents();
                if($scope.childScope.updateBlogPageData)
                    $scope.childScope.updateBlogPageData(iFrame);
                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "You have unsaved data that will be lost",
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
                            $scope.redirect = true;
                            $scope.savePage();
                            window.location = redirectUrl;
                            if(reload)
                                window.location.reload();
                        } else {
                            SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
                            window.location = redirectUrl;
                            if(reload)
                                window.location.reload();
                        }                        
                    });
            } else {
                window.location = redirectUrl;
                if(reload)
                    window.location.reload();
            }
        }
        $scope.createDuplicatePage =function(newPage)
        {
            $scope.validateNewPage(newPage);
            if (!$scope.newPageValidated) {
                toaster.pop('error', "Page Title or URL can not be blank.");
                return false;
            }
            WebsiteService.getSinglePage($scope.currentPage.websiteId, newPage.handle, function(data) {
                if(data && data._id)
                {
                    toaster.pop('error', "Page URL " + newPage.handle, "Already exists");
                    return false;
                }
                newPage.components = $scope.currentPage.components;
                WebsiteService.createDuplicatePage($scope.currentPage.websiteId, newPage, function(data) {
                    $scope.duplicate = true;
                    console.log("Duplicate Page Created");
                    $scope.checkForSaveBeforeLeave('/admin/#/website/pages/?pagehandle=' + newPage.handle, true);                    
                })
            })
        }

        $scope.createDuplicatePost =function(newPost)
        {
            $scope.validateNewPost(newPost);
            if (!$scope.newPostValidated) {
                toaster.pop('error', "Post Title or URL can not be blank.");
                return false;
            }
            WebsiteService.getSinglePost($scope.currentPage.websiteId, newPost.post_url, function(data) {
                if(data && data._id)
                {
                    toaster.pop('error', "Post URL " + newPost.post_url, "Already exists");
                    return false;
                }

                var post_data = $scope.childScope.getBlogPost();
                newPost.post_content = post_data.post_content;
                newPost.post_tags = post_data.post_tags;
                newPost.post_author = post_data.post_author;
                newPost.post_category = post_data.post_category;
                newPost.post_excerpt = post_data.post_excerpt;
                newPost.featured_image = post_data.featured_image;
                newPost.publish_date = post_data.publish_date;
                WebsiteService.createPost(-1, newPost, function(data) {
                    $scope.duplicate = true;
                     console.log("Duplicate Post Created");
                     window.location = '/admin/#/website/posts/?posthandle=' + newPost.post_url;
                     window.location.reload();
                })
            })
        }
    }]);
})(angular);
