'use strict';
/**
 * controller for editor
 */
(function(angular) {
    app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", function($scope, $rootScope, $interval, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant) {
        var that;
        var user, account, components, currentPageContents, previousComponentOrder, allPages, originalCurrentPageComponents = that = this;

        $scope.timeInterval = 1200000;
        $scope.redirect = false;
        var stopInterval;
        $scope.breadcrumbTitle = $location.$$search['pagehandle'] || $location.$$search['posthandle'];

        /*
         * @getUrl
         * get the url for the view page/post button
         */

        $scope.getUrl = function(handle) {
            console.log('get url ', handle);
            return 'http://' + window.location.host + '/' + handle;
        };

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
         * @closeModal
         * -
         */

        $scope.closeModal = function() {
            $scope.modalInstance.close();
        };

        /*
         * @openModal
         * -
         */

        $scope.openModal = function(modal) {
            $scope.modalInstance = $modal.open({
                templateUrl: modal + '.html',
                scope: $scope
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
         * @location:pagehandle
         * - get the pagehandle and replace iframe src
         */

        if ($location.$$search['pagehandle']) {
            document.getElementById("iframe-website").setAttribute("src", '/page/' + $location.$$search['pagehandle'] + '?editor=true');
        }

        /*
         * @location:posthandle
         * - get the posthandle and replace iframe src
         */

        if ($location.$$search['posthandle']) {
            $scope.single_post = true;
            document.getElementById("iframe-website").setAttribute("src", '/page/blog/' + $location.$$search['posthandle'] + '?editor=true');
        }

        /*
         * @window:scroll
         * - when the window is scrolled in the admin, ud
         */

        angular.element(window).scroll(function() {
            var editorToolbar = angular.element("#iframe-website").contents().find("#editor-toolbar");
            var scrollTop = $(document).scrollTop();
            var offsetHeight = angular.element('#page-title').outerHeight() + angular.element('#page-actions').outerHeight() + angular.element('.navbar').outerHeight();
            if (scrollTop > offsetHeight) {
                editorToolbar.css({
                    'top': scrollTop - offsetHeight
                });
            } else {
                editorToolbar.css({
                    'top': 0
                });
            }
        });

        /*
         * @globalvariables
         * -
         */

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

        $scope.componentTypes = [
            {
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
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/testimonials.png',
                filter: 'text',
                description: 'A component to showcase your testimonials.',
                enabled: true
            }
        ];

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
        document.getElementById("iframe-website").onload = function() {

            $scope.updatePage($location.$$search['pagehandle'], true);
            //TODO: need to check when iframe content is loaded properly
            if ($scope.isEditing) {
                if (angular.element("#iframe-website").contents().find("body").length) {
                    setTimeout(function() {
                        $scope.editPage();
                        if ($location.$$search.onboarding) {
                            $scope.showOnboarding = true;
                        }
                    }, 1000)
                }
            }
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
                        $("#iframe-website").contents().find('#component-setting-modal').modal('show');
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
                        iFrame && iFrame.contentWindow && iFrame.contentWindow.updateContactComponent && iFrame.contentWindow.updateContactComponent($scope.currentPage.components);
                    //TODO: get updateIframeComponents callback
                    setTimeout(function() {
                        $scope.activateAloha();
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

                angular.element("#iframe-website").contents().find('body').on("DOMNodeInserted", ".editable", function(e) {
                    if (!$scope.activated) {
                        $scope.activated = true;
                        setTimeout(function() {
                            iFrame.contentWindow.activateAloha && iFrame.contentWindow.activateAloha();
                        }, 1000)
                    }
                });
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
                $scope.resizeIframe();
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
        });

        $scope.resizeIframe = function() {
            var iframe = document.getElementById("iframe-website");
            if (iframe) {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                var offsetHeight = angular.element('#page-title').height() + angular.element('#page-actions').height();
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.iframeHeight = iframeDoc.body.scrollHeight + "px";
                    });
                }, 1000);
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

        $scope.social_links = [
            {
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
            }
        ];

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
         * @editPage
         * -
         */

        $scope.editPage = function() {
            $scope.isEditing = true;

            var iframe = document.getElementById("iframe-website");
            if (iframe.contentWindow.triggerEditMode)
                iframe.contentWindow.triggerEditMode();

            if (iframe.contentWindow.copyPostMode) {
                iframe.contentWindow.copyPostMode();
                $scope.post_data = iframe.contentWindow.getPostData();
            }
            $scope.activateAloha();
            $scope.backup['website'] = angular.copy($scope['website']);
        };

        /*
         * @cancelPage
         * -
         */

        $scope.cancelPage = function() {
            $scope.isDirty = false;
            var isDirty = false;
            var iFrame = document.getElementById("iframe-website");
            if (iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty) {
                var isDirty = iFrame.contentWindow.checkOrSetPageDirty() || $scope.isDirty;
            }
            iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty && iFrame.contentWindow.checkOrSetPageDirty(true);
            var redirectUrl = $location.$$search['posthandle'] ? "/website/posts" : "/website/pages";
            if (isDirty) {
                event.preventDefault();
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
                        $location.path(redirectUrl);
                    });
            } else {
                $location.path(redirectUrl);
            }
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
            }
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
            var iFrame = document.getElementById("iframe-website");
            if (iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty) {
                iFrame.contentWindow.checkOrSetPageDirty(true);
            }
            if ($location.$$search['posthandle']) {
                $scope.single_post = true;
                iFrame && iFrame.contentWindow && iFrame.contentWindow.savePostMode && iFrame.contentWindow.savePostMode(toaster, msg);
                $scope.isEditing = true;
            } else {
                $scope.validateEditPage($scope.currentPage);

                if (!$scope.editPageValidated) {
                    $scope.saveLoading = false;
                    toaster.pop('error', "Page Title or URL can not be blank.");
                    return false;
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
                            //Hack for link plugin popup functionality
                            componentVarContents = componentVarContents.replace("data-cke-pa-onclick", "onclick");
                            var regex = /^<(\"[^\"]*\"|'[^']*'|[^'\">])*>/;
                            if (regex.test(componentVarContents)) {
                                var jHtmlObject = angular.element(componentVarContents);
                                var editor = jQuery("<p>").append(jHtmlObject);
                                editor.find(".cke_reset").remove();
                                editor.find(".cke_image_resizer").remove();
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
                    newComponentOrder.push(matchedComponent);
                };


                $scope.currentPage.components = newComponentOrder;

                WebsiteService.getSinglePage($scope.currentPage.websiteId, $scope.currentPage.handle, function(data) {
                    //TODO: Make this check on change of page title or url in the page settings modal
                    // if(data && data._id)
                    // {
                    //     if(data._id !== $scope.currentPage._id)
                    //     {
                    //         toaster.pop('error', "Page URL " + $scope.currentPage.handle, "Already exists");
                    //         return false;
                    //     }
                    // }
                    WebsiteService.updatePage($scope.currentPage.websiteId, $scope.currentPage._id, $scope.currentPage, function(data) {
                        $scope.isEditing = true;
                        WebsiteService.setEditedPageHandle($scope.currentPage.handle);
                        if (!$scope.redirect)
                            $scope.autoSavePage();
                        else
                            $scope.stopAutoSavePage();
                        $scope.redirect = false;
                        if (autoSave)
                            toaster.pop('success', "Auto Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                        else
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
                })

            }
        };

        /*
         * @updatePage
         * -
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
                $scope.currentPage = _.findWhere(that.allPages, {
                    handle: currentPage
                });

                WebsiteService.getPageVersions($scope.currentPage._id, function(pageVersions) {
                    $scope.pageVersions = pageVersions;
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
                "top": "<div style='text-align:center'><span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span></div>",
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
            iFrame && iFrame.contentWindow && iFrame.contentWindow.updateContactComponent && iFrame.contentWindow.updateContactComponent($scope.currentPage.components);
        };

        /*
         * @addComponent
         * -
         */

        $scope.addComponent = function(addedType) {
            //$scope.deactivateAloha();
            var pageId = $scope.currentPage._id;
            if (addedType.type === 'footer') {
                var footerType = _.findWhere($scope.currentPage.components, {
                    type: addedType
                });
                if (footerType) {
                    toaster.pop('error', "Footer component already exists");
                    return;
                }
            }
            if (addedType.type === 'navigation') {
                var navigationType = _.findWhere($scope.currentPage.components, {
                    type: addedType
                });
                if (navigationType) {
                    toaster.pop('error', "Navbar header already exists");
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
                        iFrame && iFrame.contentWindow && iFrame.contentWindow.updateContactComponent && iFrame.contentWindow.updateContactComponent($scope.currentPage.components);
                    //TODO: get updateIframeComponents callback
                    setTimeout(function() {
                            $scope.activateAloha();
                        }, 1000)
                        //$scope.scrollToIframeComponent(newComponent.anchor);
                    toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    $scope.resizeIframe();
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
            $scope.activateAloha();
            $scope.resizeIframe();
            $scope.$apply(function() {
                toaster.pop('success', "Component Deleted", "The " + deletedType + " component was deleted successfully.");
            });
        };

        /*
         * @updateIframeComponents
         * -
         */

        $scope.updateIframeComponents = function(fn) {
            iFrame && iFrame.contentWindow && iFrame.contentWindow.updateComponents && iFrame.contentWindow.updateComponents($scope.components);
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
         * @activateAloha
         * -
         */

        $scope.activateAloha = function() {
            $scope.bindEvents();
            iFrame && iFrame.contentWindow && iFrame.contentWindow.activateAloha && iFrame.contentWindow.activateAloha()
        };

        /*
         * @deactivateAloha
         * -
         */

        $scope.deactivateAloha = function() {
            iFrame && iFrame.contentWindow && iFrame.contentWindow.deactivateAloha && iFrame.contentWindow.deactivateAloha()
        };

        /*
         * @editComponent
         * -
         */

        $scope.editComponent = function(componentId) {
            if ($scope.single_post) {
                iFrame.contentWindow && iFrame.contentWindow.refreshPost && iFrame.contentWindow.refreshPost();
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


            });
            $scope.originalComponent = angular.copy($scope.componentEditing);

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
            $scope.updateIframeComponents();
            $scope.activateAloha();
        };

        /*
         * @saveComponent
         * -
         */

        $scope.saveComponent = function(update) {

            var componentId = $scope.componentEditing._id;
            if (!update)
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
            $scope.isDirty = true;
            setTimeout(function() {
                $scope.activateAloha();
            }, 500)
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
            iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent($scope.currentPage.components, networks ? networks : $scope.componentEditing.networks);
        };

        /*
         * @deletePage
         * -
         */

        $scope.deletePage = function() {
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
                        iFrame && iFrame.contentWindow.deletePost && iFrame.contentWindow.deletePost(post_data, toaster);
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
                var iFrame = document.getElementById("iframe-website");
                iFrame && iFrame.contentWindow && iFrame.contentWindow.addCKEditorImage && iFrame.contentWindow.addCKEditorImage(asset.url);
                return;
            } else if ($scope.logoImage && $scope.componentEditing) {
                $scope.logoImage = false;
                $scope.componentEditing.logourl = asset.url;
            } else if ($scope.changeblobImage) {
                $scope.changeblobImage = false;
                $scope.blog_post.featured_image = asset.url;
                var iFrame = document.getElementById("iframe-website");
                iFrame && iFrame.contentWindow && iFrame.contentWindow.setBlogImage && iFrame.contentWindow.setBlogImage(asset.url);
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
            if (iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty) {
                var isDirty = iFrame.contentWindow.checkOrSetPageDirty() || $scope.isDirty;
            }

            if (isDirty && !$scope.changesConfirmed) {
                event.preventDefault();
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
                            var pageId = $scope.currentPage._id;
                            WebsiteService.getPageComponents(pageId, function(components) {
                                $scope.components = components;
                                $scope.currentPage.components = components;
                                $scope.savePage();
                            });

                        } else {
                            SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
                        }
                        $scope.changesConfirmed = true;
                        $scope.isDirty = false;
                        $location.path(newUrl);
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
                                WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function(data) {
                                    iFrame && iFrame.contentWindow.updateWebsite && iFrame.contentWindow.updateWebsite($scope.website);
                                    //toaster.pop('success', "Navigation updated successfully.");
                                });
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
                            WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function(data) {
                                iFrame && iFrame.contentWindow.updateWebsite && iFrame.contentWindow.updateWebsite($scope.website);
                                //toaster.pop('success', "Navigation updated successfully.");
                            });
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

        window.deleteFeatureList = function(componentId, index) {
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

        window.addNewFeatureList = function(componentId, index, newFeature) {
            $scope.componentEditing = _.findWhere($scope.components, {
                _id: componentId
            });
            $scope.updateSingleComponent(componentId);
            $scope.componentEditing.features.splice(index + 1, 0, newFeature)
            $scope.saveCustomComponent();
        };

        /*
         * @clickImageButton
         * -
         */

        window.clickImageButton = function() {
            $scope.insertMediaImage = true;
            //$scope.openModal('mediamodal');
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @changeBlogImage
         * -
         */

        window.changeBlogImage = function(blog) {
            $scope.changeblobImage = true;
            $scope.blog_post = blog;
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @setPostImage
         * -
         */

        window.setPostImage = function(componentId) {
            $scope.postImage = true;
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @addImageToGallery
         * -
         */

        window.addImageToGallery = function(componentId, index) {
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

        window.deleteImageFromGallery = function(componentId, index) {
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

        window.addImageToThumbnail = function(componentId) {
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

        window.deleteImageFromThumbnail = function(componentId, index) {
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

        window.changeProfilePhoto = function(componentId, customer) {
            $scope.profilepic = true;
            $scope.customerAccount = customer;
            angular.element("#media-manager-modal").modal('show');
            $scope.showInsert = true;
        };

        /*
         * @changeLogoImage
         * -
         */

        window.changeLogoImage = function(componentId) {
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

        window.getPostImageUrl = function() {
            return $scope.postImageUrl;
        };

        /*
         * @deleteTeamMember
         * -
         */

        window.deleteTeamMember = function(componentId, index) {
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

        window.deleteTestimonial = function(componentId, index) {
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

        window.updateAdminPageScope = function(page) {
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

        window.checkIfSinglePost = function(post) {
            if (post)
            {
                $scope.singlePost = true;
                if (iFrame.contentWindow.copyPostMode) {
                    iFrame.contentWindow.copyPostMode();
                    $scope.post_data = post;
                }
            }
        };

        /*
         * @showToaster
         * -
         */

        window.showToaster = function(value, toast, msg, redirect) {
            $scope.saveLoading = value;
            if(toast)
                $scope.$apply(function() {
                    toaster.pop('success', msg);
                    if(redirect)
                        $location.path("/website/posts"); 
                })
        };

        /*
         * @deletePricingTable
         * -
         */

        window.deletePricingTable = function(componentId, index) {
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

        window.addPricingTable = function(componentId, newTable, index) {
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

        window.deletePricingTableFeature = function(componentId, index, parentIndex) {
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

        window.addPricingTableFeature = function(componentId, newTable, index, parentIndex) {
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

        window.addTeamMember = function(componentId, newTeam, index) {
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

        window.addTestimonial = function(componentId, newTestimonial, index) {
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

        window.updateComponent = function(componentId) {
            //update single component
            return $scope.updateSingleComponent(componentId);
        };

    }]);
})(angular);
