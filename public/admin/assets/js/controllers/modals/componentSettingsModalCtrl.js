'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/

app.controller('ComponentSettingsModalCtrl', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', '$q', '$compile', '$filter', 'WebsiteService', 'CustomerService', 'ProductService', 'GeocodeService', 'toaster', 'hoursConstant', 'components', 'clickedIndex', 'contactMap', 'website', 'blog', 'isDirty', 'isSinglePost', 'openParentModal', 'showInsert', 'blogImage', 'accountShowHide', 'CampaignService', 'testimonialSlider', 'isEmail', function ($scope, $rootScope, $modalInstance, $http, $timeout, $q, $compile, $filter, WebsiteService, CustomerService, ProductService, GeocodeService, toaster, hoursConstant, components, clickedIndex, contactMap, website, blog, isDirty, isSinglePost, openParentModal, showInsert, blogImage, accountShowHide, CampaignService, testimonialSlider, isEmail) {

  $scope.blog = {};
  $scope.components = components;
  $scope.openParentModal = openParentModal;
  $scope.clickedIndex = clickedIndex;
  $scope.componentEditing = components[clickedIndex];
  $scope.contactMap = contactMap;
  $scope.website = website;
  $scope.blog.post = blog;
  $scope.isDirty = isDirty;
  $scope.isSinglePost = isSinglePost;
  $scope.showInsert = showInsert;
  $scope.originalBlog = angular.copy($scope.blog.post);
  $scope.place = {};
  $scope.place.address = null;
  $scope.errorMapData = false;
  $scope.checkIfAddess = false;
  $scope.blogImage = blogImage;
  $scope.isEmail = isEmail;
  $scope.testimonialSlider = testimonialSlider;
  $scope.emailLoaded = false;

  /*
   * @getPages
   * -
   */

  WebsiteService.getPages(function (pages) {
    var parsed = angular.fromJson(pages);
    var arr = [];
    _.each(parsed, function (page) {
      arr.push(page);
    });
    $scope.allPages = arr;
    if (!accountShowHide.blog) {
      var _blogPage = _.findWhere($scope.allPages, {
        handle: 'blog'
      });
      if (_blogPage) {
        var _index = _.indexOf($scope.allPages, _blogPage);
        $scope.allPages.splice(_index, 1);
      }
    }
    $scope.filterdedPages = $filter('orderBy')($scope.allPages, "title", false);
  });

  WebsiteService.getEmails(function (emails) {
    $timeout(function () {
      $scope.emailLoaded = true;
    }, 0);
    console.log("Emails loaded");
    $scope.emails = emails;

    //select the default email for simple form as welcome-aboard
    if ($scope.componentEditing.type === 'simple-form' && !$scope.componentEditing.emailId) {
      var _welcomeEmail = _.find(emails, function (_email) {
        return _email.handle === 'welcome-aboard';
      });

      if (_welcomeEmail) {
        $scope.componentEditing.emailId = _welcomeEmail._id;
      }
    }

  });

  CampaignService.getCampaigns(function (campaigns) {
    console.log('campaigns >>> ', campaigns);
    $scope.campaigns = campaigns;
  });

  /*
   * @getAllProducts
   * - get products for products and pricing table components
   */

  $scope.availableProductTags = [];

  ProductService.getProducts(function (data) {
    $scope.products = data;
    _.each(data, function (product) {
      if (product.tags && product.tags.length > 0) {
        _.each(product.tags, function (tag) {
          if ($scope.availableProductTags.indexOf(tag) === -1) {
            $scope.availableProductTags.push(tag);
          }
        });
      }
    });
    $scope.availableProductTagsString = $scope.availableProductTags.join(",");
  });

  $scope.customerTags = [{
    label: "Customer",
    data: "cu"
  }, {
    label: "Colleague",
    data: "co"
  }, {
    label: "Friend",
    data: "fr"
  }, {
    label: "Member",
    data: "mb"
  }, {
    label: "Family",
    data: "fa"
  }, {
    label: "Admin",
    data: "ad"
  }, {
    label: 'Lead',
    data: 'ld'
  }, {
    label: "Other",
    data: "ot"
  }];

  $scope.testOptions = {
    min: 5,
    max: 100,
    step: 5,
    precision: 2,
    orientation: 'horizontal', // vertical
    handle: 'round', //'square', 'triangle' or 'custom'
    tooltip: 'show', //'hide','always'
    tooltipseparator: ':',
    tooltipsplit: false,
    enabled: true,
    naturalarrowkeys: false,
    range: false,
    ngDisabled: false,
    reversed: false
  };

  $scope.sliderValue = 1;

  $scope.addBackground = function () {
    $scope.$parent.showInsert = true;
    $scope.openParentModal('media-modal', 'MediaModalCtrl', null, 'lg');
  };

  $scope.addFeaturedPost = function () {
    $scope.$parent.showInsert = true;
    $scope.blogImage.featured_image = true;
    $scope.openParentModal('media-modal', 'MediaModalCtrl', null, 'lg');
  };

  /*
   * @revertComponent
   * -
   */
  $scope.originalWebsite = angular.copy($scope.website);
  $scope.revertComponent = function () {
    if ($scope.componentEditing.type === 'navigation') {
      $scope.website.linkLists = $scope.originalWebsite.linkLists;
    }
    if ($scope.blog.post && $scope.originalBlog) {
      $scope.blog.post.featured_image = $scope.originalBlog.featured_image;
      $scope.blog.post.post_excerpt = $scope.originalBlog.post_excerpt;
    }
    $scope.components[clickedIndex] = $scope.originalComponent;
    $timeout(function () {
      $(window).trigger('resize');
    }, 0);
    $scope.closeModal();
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
      preferredFormat: 'hex',
      appendTo: 'body',
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

  $scope.componentOpacityValues = [{
    label: 10,
    value: 0.1
  }, {
    label: 20,
    value: 0.2
  }, {
    label: 30,
    value: 0.3
  }, {
    label: 40,
    value: 0.4
  }, {
    label: 50,
    value: 0.5
  }, {
    label: 60,
    value: 0.6
  }, {
    label: 70,
    value: 0.7
  }, {
    label: 80,
    value: 0.8
  }, {
    label: 90,
    value: 0.9
  }, {
    label: 100,
    value: 1
  }];

  /*
   * @removeImage
   * -
   */

  $scope.removeImage = function (remove) {
    if ($scope.componentEditing && $scope.componentEditing.bg && $scope.componentEditing.bg.img) {
      if (($scope.componentEditing.bg.img.show === false && remove === true) || remove === false) {
        if (remove === false) {
          $scope.componentEditing.bg.img.url = null;
        }
        $scope.componentEditing.bg.img.blur = false;
        $scope.componentEditing.bg.img.parallax = false;
        $scope.componentEditing.bg.img.overlay = false;
      }

    }
  };

  $scope.closeModal = function () {
    $timeout(function () {
      $scope.$apply(function () {
        if ($scope.componentEditing.type === "contact-us") {
          $scope.validateGeoAddress(function () {
            if ($scope.errorMapData) {
              $scope.componentEditing.location = $scope.originalComponent.location;
            }
            if ($scope.contactHoursInvalid) {
              $scope.componentEditing.hours = $scope.originalComponent.hours;
            }
            $modalInstance.close();
            angular.element('.modal-backdrop').remove();
          });
        } else {
          $modalInstance.close();
          angular.element('.modal-backdrop').remove();
        }
      });
    });
  };

  $scope.$watch('newLink.linkPage', function (newValue) {
    if (newValue) {
      $scope.currentPage = _.find($scope.filterdedPages, function (page) {
        return page.handle === newValue;
      });
    }
  });

  $scope.initializeEditLinks = function (link, status) {
    if (link.page) {
      if (status) {
        link.data = null;
      }
      $scope.currentPage = _.find($scope.filterdedPages, function (page) {
        return page.handle === link.page;
      });
    }
  };

  /*
   * @initializeLinks
   * -
   */

  $scope.initializeLinks = function (status) {
    $scope.addLink = status;
    $scope.newLink = {
      linkUrl: null,
      linkTitle: null,
      linkType: null,
      linkPage: null
    };
  };

  /*
   * @setLinkUrl
   * -
   */

  $scope.setLinkUrl = function () {
    $scope.newLink.linkTitle = angular.element("#linkSection option:selected").html();
  };

  /*
   * @setLinkTitle
   * -
   */

  $scope.setLinkTitle = function (value, index, newLink) {
    var newArray = _.first(angular.copy($scope.components), [index + 1]);
    var hash = _.filter(newArray, function (obj) {
      return obj.type === value;
    });
    if (hash.length > 1) {
      return value.replace("-", " ") + "-" + (hash.length - 1);
    }
    return value.replace("-", " ");
  };

  /*
   * @numberOfProductOptions
   * - list of product options for the dropdown in component settings
   */

  $scope.numberOfProductOptions = [{
    name: 'All',
    value: 0
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
    value: 4
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
  }];


  /*
   * @deleteLinkFromNav
   * -
   */

  $scope.deleteLinkFromNav = function (index) {
    if ($scope.componentEditing.customnav) {
      $scope.componentEditing.linkLists.forEach(function (value) {
        if (value.handle === "head-menu") {
          value.links.splice(index, 1);
          setTimeout(function () {
            $scope.updateLinkList();
          }, 1000);
        }
      });
    } else {
      $scope.website.linkLists.forEach(function (value) {
        if (value.handle === "head-menu") {
          value.links.splice(index, 1);
          setTimeout(function () {
            $scope.updateLinkList();
          }, 1000);
        }
      });
    }
  };

  /*
   * @addLinkToNav
   * -
   */

  $scope.addLinkToNav = function () {

    if ($scope.newLink && $scope.newLink.linkTitle && $scope.newLink.linkUrl) {
      if ($scope.componentEditing.customnav) {
        if (!$scope.componentEditing.linkLists) {
          $scope.componentEditing.linkLists = [];
          $scope.componentEditing.linkLists.push({
            name: "Head Menu",
            handle: "head-menu",
            links: []
          });
        }
        $scope.componentEditing.linkLists.forEach(function (value, index) {
          if (value.handle === "head-menu") {
            value.links.push({
              label: $scope.newLink.linkTitle,
              type: "link",
              linkTo: {
                data: $scope.newLink.linkUrl,
                type: $scope.newLink.linkType,
                page: $scope.newLink.linkPage
              }
            });
            $scope.initializeLinks(false);
          }
        });
      } else {
        $scope.website.linkLists.forEach(function (value, index) {
          if (value.handle === "head-menu") {
            value.links.push({
              label: $scope.newLink.linkTitle,
              type: "link",
              linkTo: {
                data: $scope.newLink.linkUrl,
                type: $scope.newLink.linkType,
                page: $scope.newLink.linkPage
              }
            });
            $scope.initializeLinks(false);
          }
        });
      }

    }
    setTimeout(function () {
      $scope.updateLinkList();
    }, 1000);
  };

  /*
   * @updateLinkList
   * - when the navigation is reordered, update the linklist in the website object
   */

  $scope.updateLinkList = function (index) {
    var linkLabelsArr = [];
    var editedLinksLists = angular.element('.head-menu-links');
    _.each(editedLinksLists, function (link) {
      var linkLabel = link.attributes['data-label'].value;
      if (linkLabel) {
        linkLabelsArr.push(linkLabel);
      }
    });
    if (linkLabelsArr.length) {
      if ($scope.componentEditing.customnav) {
        $scope.componentEditing.linkLists.forEach(function (value, index) {
          if (value.handle === "head-menu") {
            var newLinkListOrder = [];
            _.each(editedLinksLists, function (link, index) {
              if (value) {
                var matchedLinkList = _.findWhere(value.links, {
                  label: linkLabelsArr[index]
                });
                newLinkListOrder.push(matchedLinkList);
              }
            });
            if (newLinkListOrder.length) {
              $scope.componentEditing.linkLists[index].links = newLinkListOrder;
            }
          }
        });
      } else {
        $scope.website.linkLists.forEach(function (value, index) {
          if (value.handle === "head-menu") {
            var newLinkListOrder = [];
            _.each(editedLinksLists, function (link, index) {
              if (value) {
                var matchedLinkList = _.findWhere(value.links, {
                  label: linkLabelsArr[index]
                });
                newLinkListOrder.push(matchedLinkList);
              }
            });
            if (newLinkListOrder.length) {
              $scope.website.linkLists[index].links = newLinkListOrder;
            }

          }
        });
      }

    } else {

      if ($scope.componentEditing.customnav) {
        $scope.website.linkLists.forEach(function (value, index) {
          if (value.handle === "head-menu") {
            $scope.componentEditing.linkLists[index].links = [];
            //$scope.saveCustomComponent();
          }
        });
      } else {
        $scope.website.linkLists.forEach(function (value, index) {
          if (value.handle === "head-menu") {
            $scope.website.linkLists[index].links = [];
            //$scope.updateWebsite($scope.website);
          }
        });
      }

    }
  };

  $scope.refreshSlider = function () {
    console.log('refresh slider');
    $timeout(function () {
      $rootScope.$broadcast('rzSliderForceRender');
    }, 0);
  };

  $scope.setLatLon = function (lat, lon) {
    $scope.componentEditing.location.lat = lat;
    $scope.componentEditing.location.lon = lon;
  };

  $scope.updateContactUsAddress = function () {
    if (!angular.equals($scope.originalContactMap, $scope.componentEditing.location)) {
      $scope.locationAddress = null;
       $scope.setLatLon();
      $scope.validateGeoAddress();
    }
  };

  $scope.validateGeoAddress = function (fn) {   
    GeocodeService.validateAddress($scope.componentEditing.location, $scope.locationAddress, function (data, results) {
      if (data && results.length === 1) {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.setLatLon(results[0].geometry.location.G || results[0].geometry.location.H, results[0].geometry.location.K || results[0].geometry.location.L);
            $scope.errorMapData = false;
            angular.copy($scope.componentEditing.location, $scope.originalContactMap);
            $scope.contactMap.refreshMap();
          });
        }, 0);
      } else {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.errorMapData = true;
            angular.copy($scope.componentEditing.location, $scope.originalContactMap);
          });
        }, 0);
      }
      if (fn) {
        fn();
      }
    });
  };

  $scope.saveComponentVersion = function () {
    $scope.isDirty.dirty = true;
    $timeout(function () {
      $(window).trigger('resize');
    }, 0);
  };

  $scope.saveComponent = function () {
    $scope.isDirty.dirty = true;
  };

  $scope.saveContactComponent = function (is_address) {
    if(is_address){
      $scope.contactMap.refreshMap();
      $scope.place.address = GeocodeService.stringifyAddress($scope.componentEditing.location);
    }
    else{
      $scope.contactMap.refreshHours();
    }
    $scope.isDirty.dirty = true;
  };

  $scope.saveTestimonialComponent = function () {
    $scope.isDirty.dirty = true;
    $scope.testimonialSlider.refreshSlider();
  };

  $scope.saveComponentChanges = function () {
    $scope.isDirty.dirty = true;
    $timeout(function () {
      $(window).trigger('resize');
    }, 0);
  };

  $scope.spacingArr = [{
    name: 'Top',
    category: 'padding',
    value: 'paddingTop',
    icon: 'long-arrow-up'
  }, {
    name: 'Bottom',
    category: 'padding',
    value: 'paddingBottom',
    icon: 'long-arrow-down'
  }, {
    name: 'Right',
    category: 'padding',
    value: 'paddingRight',
    icon: 'long-arrow-right'
  }, {
    name: 'Left',
    category: 'padding',
    value: 'paddingLeft',
    icon: 'long-arrow-left'
  }, {
    name: 'Top',
    category: 'margin',
    value: 'marginTop',
    icon: 'long-arrow-up'
  }, {
    name: 'Bottom',
    category: 'margin',
    value: 'marginBottom',
    icon: 'long-arrow-down'
  }, {
    name: 'Right',
    category: 'margin',
    value: 'marginRight',
    icon: 'long-arrow-right'
  }, {
    name: 'Left',
    category: 'margin',
    value: 'marginLeft',
    icon: 'long-arrow-left'
  }];

  $scope.resolutions = [320, 360, 480, 720, 768, 1024, 1280, 1360, 1366, 1440, 1600, 1680, 1920, '100%'];

  /*
   * @editComponent
   * -
   */

  $scope.editComponent = function () {

    if ($scope.componentEditing) {

      var componentType;
      console.log('$scope.componentEditing.spacing', $scope.componentEditing.spacing);
      if (!$scope.componentEditing.spacing) {
        console.log('component editing doesnt have spacing');
        var pt, pb = 50;
        var mw = 1024;
        if($scope.componentEditing.type === "contact-us" || $scope.componentEditing.type === "navigation"){
          pt = pb = 0;
          mw = "100%";
        }
        $scope.componentEditing.spacing = {
          'pt': pt,
          'pb': pb,
          'pl': 0,
          'pr': 0,
          'mt': 0,
          'mb': 0,
          'mr': 'auto',
          'ml': 'auto',
          'mw': mw,
          'usePage': false
        };
      }

      if($scope.componentEditing.bg && !angular.isDefined($scope.componentEditing.bg.opacity))
        $scope.componentEditing.bg.opacity = 1;

      if($scope.componentEditing.bg && $scope.componentEditing.bg.img && !angular.isDefined($scope.componentEditing.bg.img.overlayopacity))
        $scope.componentEditing.bg.img.overlayopacity = 1;


      if ($scope.componentEditing.type === 'navigation') {
        componentType = _.findWhere($scope.componentTypes, {
          type: $scope.componentEditing.type,
          version: parseInt($scope.componentEditing.version, 10)
        });
      } else {
        componentType = _.findWhere($scope.componentTypes, {
          type: $scope.componentEditing.type
        });
      }

      if (componentType && componentType.icon) {
        $scope.componentEditing.icon = componentType.icon;
      }
      if (componentType && componentType.title) {
        $scope.componentEditing.header_title = componentType.title;
      }
    }
    if ($scope.componentEditing.type === "simple-form") {
      if (!$scope.componentEditing.fields.length) {
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
        });
      }

      if (!$scope.componentEditing.redirectType) {
        $scope.componentEditing.redirectType = 'page';
      }
    }

    if ($scope.componentEditing.type === "contact-us") {
      $scope.hours = hoursConstant;
      if(!angular.isDefined($scope.componentEditing.boxOpacity)){
        $scope.componentEditing.boxOpacity = 1;
      }     

      $scope.place.address = GeocodeService.stringifyAddress($scope.componentEditing.location);
      $scope.originalContactMap = angular.copy($scope.componentEditing.location);
      if ($scope.componentEditing.hours) {
        _.each($scope.componentEditing.hours, function (element, index) {
          if (element.day === "Sat" || element.day === "Sun") {
            if (element.start === "") {
              element.start = "9:00 am";
            }
            if (element.end === "") {
              element.end = "5:00 pm";
            }
            if (!element.start2 || element.start2 === "") {
              element.start2 = "9:00 am";
            }
            if (!element.end2 || element.end2 === "") {
              element.end2 = "9:00 am";
            }
          }
        });
      }
    }    
    $scope.contactHoursInvalid = false;
    $scope.contactHours = [];
    var i = 0;
    for (i; i <= 6; i++) {
      $scope.contactHours.push({
        "valid": true
      });
    }

    if ($scope.componentEditing) {
      WebsiteService.getComponentVersions($scope.componentEditing.type, function (versions) {
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

    angular.element('#feature-convert').on('change', function (e) {
      if (!$scope.featureIcon) {
        $scope.featureIcon = {};
      }
      if ($scope.featureIcon) {
        $scope.featureIcon.icon = e.icon;
      }
    });


    $modalInstance.opened.then(function(){     
      $timeout(function () {
        $rootScope.$broadcast('rzSliderForceRender');
        $scope.originalComponent = angular.copy($scope.componentEditing);
      }, 1000);
    });
  };


  $scope.editComponent();
  var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'short_name',
    country: 'short_name'
  };
  $scope.setDefaultAddress = function () {
    $scope.componentEditing.location.address = "";
    $scope.componentEditing.location.address2 = "";
    $scope.componentEditing.location.city = "";
    $scope.componentEditing.location.state = "";
    $scope.componentEditing.location.zip = "";
    $scope.componentEditing.location.country = "";
  };
  $scope.fillInAddress = function (place) {
    // Get each component of the address from the place details
    // and fill the corresponding field on the form. 
    $scope.setDefaultAddress();
    var i = 0;
    var addressType, val;
    for (i; i < place.address_components.length; i++) {
      addressType = place.address_components[i].types[0];
      if (componentForm[addressType]) {
        val = place.address_components[i][componentForm[addressType]];
        if (addressType === 'street_number') {
          $scope.componentEditing.location.address = val;
        } else if (addressType === 'route') {
          $scope.componentEditing.location.address2 = val;
        } else if (addressType === 'locality') {
          $scope.componentEditing.location.city = val;
        } else if (addressType === 'administrative_area_level_1') {
          $scope.componentEditing.location.state = val;
        } else if (addressType === 'postal_code') {
          $scope.componentEditing.location.zip = val;
        } else if (addressType === 'country') {
          $scope.componentEditing.location.country = val;
        }
      }
    }
    $scope.componentEditing.location.lat = place.geometry.location.lat();
    $scope.componentEditing.location.lon = place.geometry.location.lng();
  };
  $scope.$watch('place.address', function (newValue) {
    if (newValue) {
      if (angular.isObject(newValue)) {
        $scope.fillInAddress(newValue);
        $scope.locationAddress = newValue;
        $scope.setLatLon();
        $scope.validateGeoAddress();
      }
    }
  });

  /*
   * @validateHours
   * 
   */

  $scope.validateHours = function (hours, index) {
    $scope.contactHours[index].valid = true;
    if (!hours.closed) {
      var startTime = hours.start;
      var endTime = hours.end;
      if (startTime && endTime) {
        startTime = startTime.split(" ")[1] === 'pm' && startTime.split(":")[0] !== '12' ? parseInt(startTime.split(":")[0], 10) + 12 : parseInt(startTime.split(":")[0], 10);
        endTime = endTime.split(" ")[1] === 'pm' && endTime.split(":")[0] !== '12' ? parseInt(endTime.split(":")[0], 10) + 12 : parseInt(endTime.split(":")[0], 10);
        startTime = parseInt(hours.start.split(":")[1], 10) === 30 ? startTime + 0.5 : startTime;
        endTime = parseInt(hours.end.split(":")[1], 10) === 30 ? endTime + 0.5 : endTime;
      }
      if (hours.split && $scope.componentEditing.splitHours) {
        angular.element("#business_hours_start_" + index).removeClass('has-error');
        angular.element("#business_hours_start2_" + index).removeClass('has-error');
        angular.element("#business_hours_end_" + index).removeClass('has-error');
        var startTime2 = hours.start2;
        var endTime2 = hours.end2;
        if (startTime2 && endTime2) {
          startTime2 = startTime2.split(" ")[1] === 'pm' && startTime2.split(":")[0] !== '12' ? parseInt(startTime2.split(":")[0], 10) + 12 : parseInt(startTime2.split(":")[0], 10);
          endTime2 = endTime2.split(" ")[1] === 'pm' && endTime2.split(":")[0] !== '12' ? parseInt(endTime2.split(":")[0], 10) + 12 : parseInt(endTime2.split(":")[0], 10);
          startTime2 = parseInt(hours.start2.split(":")[1], 10) === 30 ? startTime2 + 0.5 : startTime2;
          endTime2 = parseInt(hours.end2.split(":")[1], 10) === 30 ? endTime2 + 0.5 : endTime2;
        }
        if (startTime > endTime || startTime > startTime2 || startTime > endTime2) {
          if (startTime > endTime) {
            angular.element("#business_hours_start_" + index).addClass('has-error');
          } else if (startTime > startTime2) {
            angular.element("#business_hours_start_" + index).addClass('has-error');
          } else if (startTime > endTime2) {
            angular.element("#business_hours_start_" + index).addClass('has-error');
          }
          $scope.contactHours[index].valid = false;
        }
        if (endTime > startTime2 || endTime > endTime2) {
          if (endTime > startTime2) {
            angular.element("#business_hours_end_" + index).addClass('has-error');
          } else if (endTime > endTime2) {
            angular.element("#business_hours_end_" + index).addClass('has-error');
          }
          $scope.contactHours[index].valid = false;
        }
        if (startTime2 > endTime2) {
          angular.element("#business_hours_start2_" + index).addClass('has-error');
          $scope.contactHours[index].valid = false;
        }
      } else if (!hours.wholeday) {
        angular.element("#business_hours_start_" + index).removeClass('has-error');
        if (startTime > endTime) {
          angular.element("#business_hours_start_" + index).addClass('has-error');
          $scope.contactHours[index].valid = false;
        }
      }
    }

    var validate = _.where($scope.contactHours, {
      valid: false
    });
    if (validate && validate.length) {
      $scope.contactHoursInvalid = true;
    } else {
      $scope.contactHoursInvalid = false;
    }

  };

  $scope.slugifyAnchor = function (url) {
    if (url) {
      $scope.componentEditing.anchor = $filter('slugify')(url);
    }
  };

}]);
