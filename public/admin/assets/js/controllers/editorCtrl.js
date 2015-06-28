'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $rootScope, $interval, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        scope: $scope
      });
    };

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    $scope.retrievePage = function (_handle) {
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.page = data;
        $scope.components = $scope.page.components;
      });
    };

    window.calculateWindowHeight = function () {
      var scrollTop = $(document).scrollTop();
      return scrollTop;
    };


    if ($location.search().pagehandle) {
      $scope.retrievePage($location.search().pagehandle);
    }

    $scope.savePage = function () {
      $scope.saveLoading = true;
      WebsiteService.updatePage($scope.page, function (data) {
        $scope.saveLoading = false;
        toaster.pop('success', "Page Saved", "The " + $scope.page.handle + " page was saved successfully.");
      });
    };

    $scope.sortableOptions = {
      parentElement: "#component-loader",
      containerPositioning: 'relative',
      dragStart: function (e, ui) {
        // $scope.parentScope.resizeIframe();
        // $scope.isPageDirty = true;
        // $scope.first = false;
        // angular.element(".ui-sortable .delete-component,.ui-sortable .duplicate,.ui-sortable .settings").addClass("hide");
        // //angular.element(".ui-sortable").addClass("active");
        // $scope.componentId = e.source.itemScope.modelValue._id;
        // //e.source.itemScope.modelValue = $scope.parentScope.updateComponent(componentId);
        // //e.source.itemScope.element.addClass(" dragging");
        // clearTimeout($scope.wait);
      },
      dragMove: function (e, ui) {
        console.log('sorting update');
      },
      dragEnd: function (e, ui) {
        //e.dest.sortableScope.element.removeClass("dragging");
        // $scope.wait = setTimeout(function () {
        //   //$scope.activateCKEditor();
        //   angular.element(".ui-sortable").removeClass("active");
        //   $scope.parentScope.resizeIframe($scope.componentId);
        //   $scope.first = true;
        //   angular.element(".ui-sortable .delete-component,.ui-sortable .duplicate,.ui-sortable .settings").removeClass("hide");
        //   for (var i = 0; i < $scope.currentpage.components.length; i++) {
        //     if ($scope.currentpage.components[i].type == 'masthead') {
        //       if (i != 0 && $scope.currentpage.components[i - 1].type == "navigation") {
        //         $scope.allowUndernav = true;
        //         if ($scope.currentpage.components[i].bg && $scope.currentpage.components[i].bg.img && $scope.currentpage.components[i].bg.img.undernav)
        //           $scope.addUndernavClasses = true
        //         else
        //           $scope.addUndernavClasses = false;
        //       } else {
        //         $scope.allowUndernav = false;
        //         $scope.addUndernavClasses = false;
        //       }
        //     }
        //   };
        // }, 1500);



      }
    };

    $scope.deleteComponent = function (index) {
      $scope.components.splice(index, 1);
    };

    $scope.addComponent = function (addedType) {
      var componentType = null;
      if (addedType.type === 'footer' || addedType.type === 'navigation' || addedType.type === 'single-post' || addedType.type === 'blog-teaser' || addedType.type === 'blog') {
        componentType = _.findWhere($scope.components, {
          type: addedType.type
        });
        if (componentType) {
          toaster.pop('error', componentType.type + " component already exists");
          return;
        }
      }

      WebsiteService.getComponent(addedType, addedType.version || 1, function (newComponent) {

        if (newComponent) {
          $scope.closeModal();
          toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
        }
      });
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
    _.each($scope.componentFilters, function (element, index) {
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

    $scope.setFilterType = function (label) {
      $scope.typefilter = label;
    };

  }]);
}(angular));
