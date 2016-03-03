'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/

app.controller('SSBComponentSettingsModalCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$q', '$compile', '$filter', 'WebsiteService', 'CustomerService', 'ProductService', 'GeocodeService', 'toaster', 'hoursConstant', 'CampaignService', 'SimpleSiteBuilderService', 'SweetAlert', function ($scope, $rootScope, $http, $timeout, $q, $compile, $filter, WebsiteService, CustomerService, ProductService, GeocodeService, toaster, hoursConstant, CampaignService, SimpleSiteBuilderService, SweetAlert) {

  $scope.blog = {};

  $scope.$parent.$watchGroup(['vm.uiState.activeSectionIndex', 'vm.uiState.activeComponentIndex'], function() {
    var section = $scope.$parent.vm.state.page.sections[$scope.$parent.vm.uiState.activeSectionIndex];
    if (section && section.components && section.components[$scope.$parent.vm.uiState.activeComponentIndex]) {
        $scope.components = section.components;
        $scope.component = section.components[$scope.$parent.vm.uiState.activeComponentIndex];
    }
  }, true);

  $scope.website = $scope.$parent.vm.state.website;
  $scope.originalWebsite = angular.copy($scope.website);
  // $scope.blog.post = blog;
  $scope.isDirty = {};
  // $scope.isSinglePost = isSinglePost;
  // $scope.showInsert = showInsert;
  // $scope.originalBlog = angular.copy($scope.blog.post);
  $scope.emailLoaded = false;

  $scope.availableProductTags = [];

  $scope.barConfig = {
    animation: 0,
    handle: '.reorder',
    draggable: '.fragment',
    ghostClass: "sortable-ghost",
    scroll: true,
    scrollSensitivity: 200,
    scrollSpeed: 20, // px
    onSort: function (evt) {
      // $scope.scrollToComponent(evt.newIndex); TOOD: reimplement
    },
    onStart: function (evt) {
      $scope.dragging = true;
    },
    onEnd: function (evt) {
      $scope.dragging = false;
    }
  };

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

  $scope.revertComponent = function () {
    if ($scope.component.type === 'navigation') {
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
        ["#f47998", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
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
  },
  {
    title: 'Footer',
    type: 'footer',
    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/footer.png',
    filter: 'misc',
    description: 'Use this component to show footer on your page.',
    enabled: false
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
    if ($scope.component && $scope.component.bg && $scope.component.bg.img) {
      if (($scope.component.bg.img.show === false && remove === true) || remove === false) {
        if (remove === false) {
          $scope.component.bg.img.url = null;
        }
        $scope.component.bg.img.blur = false;
        $scope.component.bg.img.parallax = false;
        $scope.component.bg.img.overlay = false;
        $scope.component.bg.img.undernav = false;
        $scope.component.bg.img.fullscreen = false;
      }

    }
  };

  $scope.closeModal = function () {
    $timeout(function () {
      $scope.$apply(function () {
        if ($scope.component.type === "contact-us") {
          $scope.validateGeoAddress(function () {
            if ($scope.errorMapData) {
              $scope.component.location = $scope.originalComponent.location;
            }
            if ($scope.contactHoursInvalid) {
              $scope.component.hours = $scope.originalComponent.hours;
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
      $scope.currentPage = _.find($scope.filteredPages, function (page) {
        return page.handle === newValue;
      });
    }
  });

  function getPageComponents(page) {
    var components = [];
    if (page.components && page.components.length && !page.sections.length) {
        components = page.components;
    }
    else{
        _.each(page.sections, function (section) {
            if (section && section.components) {
              _.each(section.components, function (component) {              
                if (component) {
                  if(section.components.length > 1){
                    component.sectionTitle = section.name;
                  }
                  else if(section.components.length === 1){
                    if(section.name && component.type && section.name.toLowerCase() !== component.type.toLowerCase()){
                      component.sectionTitle = section.name;  
                    }
                  }
                  components.push(component)
                }
              })
            }
        })
    }    
    return components;
  }

  $scope.initializeEditLinks = function (link, status) {
    if (link.page) {
      if (status) {
        link.data = null;
      }
      $scope.linkPage = link.page;
      $scope.currentPage = _.find($scope.filteredPages, function (page) {
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
    var title = value.replace("-", " ");
    var sectionTitle = $scope.currentPage.components[index].sectionTitle;
    var newArray = _.first(angular.copy($scope.currentPage.components), [index + 1]);
    var hash = _.filter(newArray, function (obj) {
      return obj.type === value;
    });
    
    if(sectionTitle){
      title = sectionTitle + " - " + title;
    }
    if (hash.length > 1) {  
      if(sectionTitle){
        var headerSection = _.filter(hash, function (obj) {
          return obj.sectionTitle === sectionTitle;      
        });
        if(headerSection.length > 1){
          title = sectionTitle + " - " + (hash.length - 1) + " - " + title;
        }
      }
      else{
        title = title + "-" + (hash.length - 1);
      } 
    }
    return title;
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

  $scope.deleteLinkFromNav = function (index, links) {
    SweetAlert.swal({
      title: "Are you sure?",
      text: "Do you want to remove this link from main menu",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, remove this link!",
      cancelButtonText: "No, do not remove this link!",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        var link = links[index];
        updateParentPageSettings(link.linkTo.type, link.linkTo.data, false);
        links.splice(index, 1); 
      }
    });
       
  };

  /*
   * @updateParentPageSettings
   * -
   */

   function updateParentPageSettings(linkType, linkUrl, status, oldUrl) {
    if(linkType === 'page' && !$scope.customnav && linkUrl === $scope.$parent.vm.state.page.handle){      
      $scope.$parent.vm.state.page.mainmenu = status;
    }
    // case when current page is updated to another page.
    if(linkType === 'page' && !$scope.customnav && oldUrl && oldUrl === $scope.$parent.vm.state.page.handle){
       $scope.$parent.vm.state.page.mainmenu = false;
    }
  };


  /*
   * @addLinkToNav
   * -
   */

  $scope.addLinkToNav = function () {

    if ($scope.newLink && $scope.newLink.linkTitle && $scope.newLink.linkUrl) {
      if ($scope.component.customnav) {
        if (!$scope.component.linkLists || !$scope.component.linkLists.length) {
          $scope.component.linkLists = [];
          $scope.component.linkLists.push({
            name: "Head Menu",
            handle: "head-menu",
            links: []
          });
        }
        $scope.component.linkLists.forEach(function (value, index) {
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
            updateParentPageSettings($scope.newLink.linkType, $scope.newLink.linkUrl, true);
            $scope.initializeLinks(false);            

          }
        });
      }

    }
  };

  /*
   * @setPageLinkTitle
   * -
   */
  $scope.setPageLinkTitle = function (url, update, link, oldUrl) {
    if(!$scope.component.customnav){
        var _label = null;
        var _page = _.findWhere($scope.filteredPages, {
            handle: url
          });
        if(_page){
          _label =  _page.menuTitle || _page.title; 
        }

        if(update){
          link.label = _label;
          updateParentPageSettings(link.linkTo.type, url, true, oldUrl);
        }
        else{
          $scope.newLink.linkTitle = _label
        }
        
      }
  };


  $scope.refreshSlider = function () {
    console.log('refresh slider');
    $timeout(function () {
      $rootScope.$broadcast('rzSliderForceRender');
    }, 0);
  };

  $scope.saveComponentVersion = function () {
    $scope.$parent.vm.pendingChanges = true;
    $scope.isDirty.dirty = true;
    $timeout(function () {
      $(window).trigger('resize');
    }, 0);
  };

  $scope.saveComponent = function () {
    $scope.$parent.vm.pendingChanges = true;
    $scope.isDirty.dirty = true;
    $timeout(function () {
      $(window).trigger('resize');
    }, 0);
  };

  $scope.saveContactComponent = function (is_address) {
    if(is_address){
      $scope.contactMap.refreshMap();
      $scope.place.address = GeocodeService.stringifyAddress($scope.component.location);
    }
    else{
      $scope.contactMap.refreshHours();
    }
    $scope.$parent.vm.pendingChanges = true;
    $scope.isDirty.dirty = true;
  };

  $scope.saveTestimonialComponent = function () {
    $scope.$parent.vm.pendingChanges = true;
    $scope.isDirty.dirty = true;
    $scope.testimonialSlider.refreshSlider();
  };

  $scope.saveComponentChanges = function () {
    $scope.$parent.vm.pendingChanges = true;
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

    if ($scope.component) {

      var componentType;
      
      if(!$scope.component.bg)
        $scope.component.bg = {};
      if($scope.component.bg && !angular.isDefined($scope.component.bg.opacity))
        $scope.component.bg.opacity = 1;

      if($scope.component.bg && $scope.component.bg.img && !angular.isDefined($scope.component.bg.img.overlayopacity))
        $scope.component.bg.img.overlayopacity = 1;


      if ($scope.component.type === 'navigation') {
        componentType = _.findWhere($scope.componentTypes, {
          type: $scope.component.type,
          version: parseInt($scope.component.version, 10)
        });        
      } else {
        componentType = _.findWhere($scope.componentTypes, {
          type: $scope.component.type
        });
      }

      if (componentType && componentType.icon) {
        $scope.component.icon = componentType.icon;
      }
      if (componentType && componentType.title) {
        $scope.component.header_title = componentType.title;
      }

      if ($scope.component.type === "simple-form") {
        if (!$scope.component.fields.length) {
          $scope.component.fields.push({
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

        if (!$scope.component.redirectType) {
          $scope.component.redirectType = 'page';
        }
        $scope.fieldsCount = [];
        
        var i = 0;
        for (i; i <= $scope.component.fields.length; i++) {
          $scope.fieldsCount.push(i + 1);
        }

        $scope.alignmentOptions = [
          'left', 'center', 'right'
        ]

        $scope.fontSizeOptions = [
          8,9,10,11,12,14,18,24,30,36,48,60,72,96
        ]

        $scope.fontFamilyOptions = {
          "Helvetica Neue, Helvetica, Arial, sans-serif": "Helvetica Neue",
          "Arial,Helvetica,sans-serif":"Arial",
          "Georgia,serif":"Georgia",
          "Impact,Charcoal,sans-serif":"Impact",
          "Tahoma,Geneva,sans-serif":"Tahoma",
          "'Times New Roman',Times,serif":"Times New Roman",
          "Verdana,Geneva,sans-serif":"Verdana",
          "Roboto,sans-serif": 'Roboto',
          "Oswald,sans-serif": 'Oswald',
          "Montserrat,sans-serif": 'Montserrat',
          "'Open Sans Condensed',sans-serif": 'Open Sans Condensed'
        }

        

      }

      if ($scope.component.type === "contact-us") {
        $scope.hours = hoursConstant;
        if(!angular.isDefined($scope.component.boxOpacity)){
          $scope.component.boxOpacity = 1;
        }

        $scope.place.address = GeocodeService.stringifyAddress($scope.component.location);
        $scope.originalContactMap = angular.copy($scope.component.location);
        if ($scope.component.hours) {
          _.each($scope.component.hours, function (element, index) {
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
    }

    $scope.contactHoursInvalid = false;
    $scope.contactHours = [];
    var i = 0;
    for (i; i <= 6; i++) {
      $scope.contactHours.push({
        "valid": true
      });
    }

    if ($scope.component) {
      WebsiteService.getComponentVersions($scope.component.type, function (versions) {
        $scope.componentVersions = versions;
        if ($scope.component && $scope.component.version) {
          $scope.component.version = $scope.component.version.toString();
          $scope.versionSelected = $scope.component.version;
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


    // $modalInstance.opened.then(function(){
      $timeout(function () {
        $rootScope.$broadcast('rzSliderForceRender');
        $scope.originalComponent = angular.copy($scope.component);
      }, 1000);
    // });
  };

  var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'short_name',
    country: 'short_name'
  };
  $scope.setDefaultAddress = function () {
    $scope.component.location.address = "";
    $scope.component.location.address2 = "";
    $scope.component.location.city = "";
    $scope.component.location.state = "";
    $scope.component.location.zip = "";
    $scope.component.location.country = "";
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
          $scope.component.location.address = val;
        } else if (addressType === 'route') {
          $scope.component.location.address2 = val;
        } else if (addressType === 'locality') {
          $scope.component.location.city = val;
        } else if (addressType === 'administrative_area_level_1') {
          $scope.component.location.state = val;
        } else if (addressType === 'postal_code') {
          $scope.component.location.zip = val;
        } else if (addressType === 'country') {
          $scope.component.location.country = val;
        }
      }
    }
    $scope.component.location.lat = place.geometry.location.lat();
    $scope.component.location.lon = place.geometry.location.lng();
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


  $scope.slugifyAnchor = function (url) {
    if (url) {
      $scope.component.anchor = $filter('slugify')(url);
    }
  };

  $scope.init = function() {

      /*
       * @getPages
       * -
       */
      
        SimpleSiteBuilderService.getPagesWithSections().then(function(pages){
          var allPages = pages.data;
          var account = SimpleSiteBuilderService.account;
          if (!account.showhide.blog) {
            var _blogPage = _.findWhere(allPages, {
              handle: 'blog'
            });
            if (_blogPage) {
              var _index = _.indexOf(allPages, _blogPage);
              allPages.splice(_index, 1);
            }
          }
          $scope.allPages = angular.copy(allPages);        
          $scope.filteredPages = $filter('orderBy')(allPages, "title", false);
          _.each($scope.filteredPages, function (page) {
              page.components = getPageComponents(page);
          })
          if($scope.linkPage)
            $scope.currentPage = _.find($scope.filteredPages, function (page) {
              return page.handle === $scope.linkPage;
            });
        })

      WebsiteService.getEmails(true, function (emails) {
        $timeout(function () {
          $scope.emailLoaded = true;
        }, 0);
        console.log("Emails loaded");

        $scope.emails = emails;

        //select the default email for simple form as welcome-aboard
        if ($scope.component && $scope.component.type === 'simple-form' && !$scope.component.emailId) {
          var _welcomeEmail = _.find(emails, function (_email) {
            return _email.handle === 'welcome-aboard';
          });

          if (_welcomeEmail) {
            $scope.component.emailId = _welcomeEmail._id;
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

      ProductService.getProducts(function (data) {
        $scope.products = data;
        _.each(data, function (product) {
          if (product.status === 'active' && product.tags && product.tags.length > 0) {
            _.each(product.tags, function (tag) {
              if ($scope.availableProductTags.indexOf(tag) === -1) {
                $scope.availableProductTags.push(tag);
              }
            });
          }
        });
        $scope.availableProductTagsString = $scope.availableProductTags.join(",");
      });

      CustomerService.getCustomerTags(function(tags){
        $scope.customerTags = tags;
      });

      $scope.editComponent();


  };

  $timeout($scope.init, 500);

}]);
