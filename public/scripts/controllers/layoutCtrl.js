'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'userService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll', '$sce', 'postService', 'paymentService', 'productService', 'courseService', 'ipCookie', '$q', 'customerService', 'pageService', 'analyticsService',
  function($scope, pagesService, websiteService, postsService, userService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll, $sce, PostService, PaymentService, ProductService, CourseService, ipCookie, $q, customerService, pageService, analyticsService) {
    var account, theme, website, pages, teaserposts, route, postname, products, courses, setNavigation, that = this;

    route = $location.$$path;
    window.oldScope;
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    $scope.$url = $location.$$url;
    $scope.tagCloud = [];
    $scope.isPageDirty = false;

    //displays the year dynamically for the footer
    var d = new Date();
    $scope.copyrightYear = d.getFullYear();

    $scope.$watch('blog.postTags || control.postTags', function(newValue, oldValue) {
      if (newValue !== undefined && newValue.length) {
        newValue.forEach(function(value, index) {
          $scope.tagCloud.push({
            text: value,
            weight: Math.floor((Math.random() * newValue.length) + 1),
            link: '/tag/' + value
          })
        });
      }
    });

    //var config = angular.module('config');
    //that.segmentIOWriteKey = ENV.segmentKey;
    //$window.segmentIOWriteKey = ENV.segmentKey;
    //that.themeUrl = $scope.themeUrl;

    CourseService.getAllCourses(function(data) {
      that.courses = data;
    });

    // setNavigation = function (data) {
    //     var tempPageComponents, indexNavComponents, page, pageNavComponents, setting;
    //     $scope.indexPage = $scope.indexPage || data['index'];
    //     tempPageComponents = $scope.indexPage.components;
    //     indexNavComponents = angular.copy( $filter(  'getByType'  )(  tempPageComponents,  'navigation'  ) );
    //     if (  indexNavComponents.length > 0  ) {
    //         [ '_id', 'anchor', 'visibility' ].forEach(function (  v  ) {
    //             indexNavComponents[  0  ][  v  ] = null;
    //         });

    //         for (  page in data  ) {
    //             if ( data.hasOwnProperty(  page  ) && page !== 'index' ) {
    //                 tempPageComponents = data[page].components;
    //                 //pageNavComponents = $filter( 'getByType' )( tempPageComponents, 'navigation' );
    //                 pageNavComponents = [];
    //                 for (var i = 0; i < tempPageComponents.length; i++) {
    //                     if(tempPageComponents[i].type === 'navigation') {
    //                         pageNavComponents.push(tempPageComponents[i]);
    //                     }
    //                 };
    //             }
    //             if (!pageNavComponents) {pageNavComponents = []};

    //             pageNavComponents.forEach(function (pageNavComponent) {
    //                 for ( setting in indexNavComponents[  0  ] ) {
    //                     if ( indexNavComponents[  0  ][  setting  ] !== null ) {
    //                         pageNavComponent[  setting  ] = indexNavComponents[  0  ][  setting  ];
    //                     }
    //                 }
    //             });
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
        // setNavigation(data);
        if ($scope.$location.$$path === '/' || $scope.$location.$$path === '') {
          route = 'index';
          route = route.replace('/', '');
          if (!angular.isDefined(data[route])) {
            route = 'coming-soon';
            if (!angular.isDefined(data[route])) {
              var pageData = {
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
            }
          }
          if (angular.isDefined(data[route]))
            that.pages = data[route];
        } else {
          route = $scope.$location.$$path.replace('/page/', '');
          route = route.replace('/', '');
          that.pages = data[route];
        }
        if ($scope.$location.$$path === '/signup') {
          userService.getTmpAccount(function(data) {
            var tmpAccount = data;
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

        var iframe = window.parent.document.getElementById("iframe-website")
        $scope.isAdmin = iframe;
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

    ProductService.getAllProducts(function(data) {
      that.products = data;
    });

    $scope.stringifyAddress = function(address) {
      if (address){
        return _.filter([address.address, address.address2, address.city, address.state, address.zip], function(str) {
            return str !== "";
        }).join(", ")
        }
    };

    $scope.showEdit = function(type) {
      if (type == "billing")
        that.billingChange = that.billingChange ? false : true;
      else
        that.shippingChange = that.shippingChange ? false : true;
    }

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }

    $scope.flvVideoUrl = function(iframeUrl, url) {
        var parsedUrl = urlParser.parse(url);
        var retUrl = "";
        if(parsedUrl)
          retUrl = iframeUrl + parsedUrl.id;
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

   

    /********** PRODUCT RELATED **********/
    $scope.checkoutModalState = 1;
    $scope.newContact = {
      isAuthenticated: true,
      details: [
        {
          phones: [{type: 'w', default: false, number: ''}],
          addresses: [{}]
        }
      ]
    };

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

      if ($scope.newContact.first !== undefined) {
        userService.postContact($scope.newContact, function(data, err) {
        });
      }

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

    /********** BLOG PAGE PAGINATION RELATED **********/
    $scope.curPage = 0;
    $scope.pageSize = 10;
    $scope.numberOfPages = function() {
      if(that.blogposts)
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
            $scope.contactPhone = component.contact.phone;
            $scope.geo_address_string = $scope.stringifyAddress(component.location);
            if ($scope.geo_address_string == "" && that.account.business.addresses.length){
              if(that.account.business.addresses[0].address || that.account.business.addresses[0].address2)
                $scope.geo_address_string = $scope.stringifyAddress(that.account.business.addresses[0]);
            }
            if(!component.contact.phone && that.account.business.phones.length)
              $scope.contactPhone = that.account.business.phones[0].number;
            if($scope.geo_address_string){
              analyticsService.getGeoSearchAddress($scope.geo_address_string, function(data) {
                    if (data.error === undefined) {
                      angular.extend($scope, {
                          mapLocation: {
                              lat: parseFloat(data.lat),
                              lng: parseFloat(data.lon),
                              zoom: 10
                          },
                          markers: {
                              mainMarker: {
                                  lat: parseFloat(data.lat),
                                  lng: parseFloat(data.lon),
                                  focus: true,
                                  message: $scope.geo_address_string,
                                  draggable: false
                              }
                          }
                    });
                  }
              });
            }
      }
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
    }

    $scope.setPostImage = function(componentId, blogpost) {
      window.parent.setPostImage(componentId);
      blogpost.featured_image = window.parent.postImageUrl;
    }

    $scope.setProfileImage = function(componentId, customer) {
      window.parent.changeProfilePhoto(componentId, customer);
    }

    $scope.changeBlogImage = function(blogpost) {
      window.parent.changeBlogImage(blogpost);
    }

    $scope.changeLogoImage = function(componentId) {
      window.parent.changeLogoImage(componentId);
    }

    $scope.saveCustomerAccount = function(customer) {
      if (customer && customer.accountId)
        customerService.putCustomer(customer, function(data) {
          that.customer = data;
        });
    }



    $scope.social_links = [{
      name: "adn",
      icon: "adn"
    }, {
      name: "bitbucket",
      icon: "bitbucket"
    }, {
      name: "dropbox",
      icon: "dropbox"
    }, {
      name: "facebook",
      icon: "facebook"
    }, {
      name: "flickr",
      icon: "flickr"
    }, {
      name: "foursquare",
      icon: "foursquare"
    }, {
      name: "github",
      icon: "github"
    }, {
      name: "google-plus",
      icon: "google-plus"
    }, {
      name: "microsoft",
      icon: "windows"
    }, {
      name: "openid",
      icon: "openid"
    }, {
      name: "pinterest",
      icon: "pinterest"
    }, {
      name: "reddit",
      icon: "reddit"
    }, {
      name: "soundcloud",
      icon: "soundcloud"
    }, {
      name: "twitter",
      icon: "twitter"
    }, {
      name: "vimeo",
      icon: "vimeo-square"
    }, {
      name: "vk",
      icon: "vk"
    }, {
      name: "yahoo",
      icon: "yahoo"
    }]

    $scope.setSelectedSocialLink = function(link, id, update, nested, index) {
      if (!$scope.social)
        $scope.social = {};
      if(nested)
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
      $("#social-link-name .error").html("");
      $("#social-link-name").removeClass('has-error');
      $("#social-link-url .error").html("");
      $("#social-link-url").removeClass('has-error');
      $scope.networks = window.parent.getSocialNetworks(id, nested, index);
    }
    $scope.setSelectedLink = function(social_link) {
      $scope.social.name = social_link.name;
      $scope.social.icon = social_link.icon;
    }
    $scope.saveSocialLink = function(social, id, mode) {
      var old_value = _.findWhere($scope.networks, {
        name: $scope.social.selectedLink
      });
      var selectedName;
      switch (mode) {
        case "add":
          if (social && social.name) {
            if (!social.url || social.url == "") {
              $("#social-link-url .error").html("Link url can not be blank.");
              $("#social-link-url").addClass('has-error');
              return;
            }

            if (social.url) {
          var urlRegex = /(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
          if (urlRegex.test(social.url) == false) {
        $("#social-link-url .error").html("Link url incorrect format");
        $("#social-link-url").addClass('has-error');
        return;
          }
        }
            selectedName = _.findWhere($scope.networks, {
              name: social.name
            });
            if (selectedName) {
              $("#social-link-name .error").html("Link icon already exists");
              $("#social-link-name").addClass('has-error');
              return;
            }
            var selectedUrl = _.findWhere($scope.networks, {
              url: social.url
            });
            if (selectedUrl) {
              $("#social-link-url .error").html("Link url already exists");
              $("#social-link-url").addClass('has-error');
              return;
            }
          } else {
            $("#social-link-url .error").html("Please enter link url.");
            $("#social-link-url").addClass('has-error');
            $("#social-link-name .error").html("Please select link icon.");
            $("#social-link-name").addClass('has-error');
            return;
          }
          $("#social-link-name .error").html("");
          $("#social-link-name").removeClass('has-error');
          $("#social-link-url .error").html("");
          $("#social-link-url").removeClass('has-error');
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
              $("#social-link-name .error").html("Link icon already exists");
              $("#social-link-name").addClass('has-error');
              return;
            } else if (existingUrl.length > 1) {
              $("#social-link-url .error").html("Link url already exists");
              $("#social-link-url").addClass('has-error');
              return;
            }
          }
          break;
      }
      if($scope.meetTeamIndex !== null)
        window.parent.updateTeamNetworks(old_value, mode, social,$scope.meetTeamIndex);
      else
        window.parent.updateSocialNetworks(old_value, mode, social);
      $scope.social = {};
      $scope.meetTeamIndex = null;
      if($("#meetteamSocialModal").length)
        $("#meetteamSocialModal").modal("hide");
      if($("#socialComponentModal").length)
        $("#socialComponentModal").modal("hide");
      if($("#topbarSocialComponentModal").length)
        $("#topbarSocialComponentModal").modal("hide");
      $(".modal-backdrop").remove();
    };
    $scope.deleteTeamMember = function(componentId, index) {
      window.parent.deleteTeamMember(componentId, index);
    }

    $scope.addTeamMember = function(componentId, index) {
      // to do: the information should fetch from component model
      var newTeam = {
        "name" : "<p>First Last</p>",
        "position" : "<p>Position of Person</p>",
        "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
        "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
        "networks": [
                        {
                            "name" : "linkedin",
                            "url" : "http://www.linkedin.com",
                            "icon" : "linkedin"
                        }
                    ]
      }
      window.parent.addTeamMember(componentId, newTeam, index);
    }

    $scope.deleteFeatureList = function(componentId, index) {
      window.parent.deleteFeatureList(componentId, index);
    }

    $scope.addFeatureList = function(componentId, index) {
      console.log('adding Feature >>>');
      window.parent.addNewFeatureList(componentId, index);
    }

    window.clickImageButton = function(btn) {
      $scope.urlInput = $(btn).closest('td').prev('td').find('input');
      window.parent.clickImageButton();
    }

    window.clickandInsertImageButton = function(editor) {
      $scope.inlineInput = editor;
      window.parent.clickImageButton();
    }

    $scope.deletePricingTable = function(componentId, index) {
      window.parent.deletePricingTable(componentId, index);
    }

    $scope.deletePricingTableFeature = function(componentId, index, parentIndex) {
      window.parent.deletePricingTableFeature(componentId, index, parentIndex);
    }


    $scope.addPricingTableFeature = function(componentId, index, parentIndex) {
      // to do: the information should fetch from component model
      var newFeature =
        {
            title : "<h4>This is the feature title</h4>",
            subtitle : "<b>This is the feature subtitle</b>",
        }
      window.parent.addPricingTableFeature(componentId, newFeature, index, parentIndex);
    }

    $scope.addPricingTable = function(componentId, index) {
      // to do: the information should fetch from component model
      var newTable = {
        title : "<h1>This is title</h1>",
        subtitle : "<h3>This is the subtitle.</h3>",
        text : 'This is text',
        price : '$9.99/per month',
        features: [
            {
                title : "<h4>This is the feature title</h4>",
                subtitle : "<b>This is the feature subtitle</b>",
            }
        ],
        btn : "<a class=\"btn btn-primary\" href=\"#\" data-cke-saved-href=\"#\">Get it now</a>"
      }

      window.parent.addPricingTable(componentId, newTable, index);
    }


    function toTitleCase(str)
    {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }


    window.activateAloha = function() {
      //if ($scope.activated == false) {
        $scope.isEditing = true;
        CKEDITOR.disableAutoInline = true;
        var elements = $('.editable');
        elements.each(function() {
          if(!$(this).parent().hasClass('edit-wrap')) {
            var dataClass = $(this).data('class').replace('.item.', ' ');
            $(this).wrapAll('<div class="edit-wrap"></div>').parent().append('<span class="editable-title">'+toTitleCase(dataClass)+'</span>');
          }
         // $scope.activated = true;
        if(!$(this).hasClass('cke_editable')) {
          CKEDITOR.inline(this, {
            on: {
              instanceReady: function(ev) {
                var editor = ev.editor;
                editor.setReadOnly(false);
                editor.on('change', function() {
                  $scope.isPageDirty = true;
                });
              }
            },
            sharedSpaces: {
              top: 'editor-toolbar'
            }
          });
        }
        });

        //CKEDITOR.setReadOnly(true);//TODO: getting undefined why?
      //}
    };

    window.deactivateAloha = function() {
      for(name in CKEDITOR.instances)
        {
            CKEDITOR.instances[name].destroy()
        }
      // $('.editable').mahalo();
      // if (aloha.editor && aloha.editor.selection) {
      // aloha.dom.setStyle(aloha.editor.selection.caret, 'display', 'none');
      // $('.aloha-caret.aloha-ephemera', document).css('visibility', 'collapse');
      // }
      // aloha.dom.query('.editable', document).forEach(aloha.mahalo);
    };

    window.checkOrSetPageDirty = function(status) {
      if (status)
        $scope.isPageDirty = false;
      else
        return $scope.isPageDirty;
    }

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

    $scope.deletePost = function(postId, blogpost) {
      PostService.deletePost($scope.currentpage._id, postId, function(data) {
       if(blogpost)
       {
        var index = that.blogposts.indexOf(blogpost);
        that.blogposts.splice(index, 1);
       }
      });
    };

    window.saveBlobData = function(iframe) {
      if (iframe) {
        var posts = iframe.body.querySelectorAll('.blog-entry');
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
            PostService.updatePost($scope.currentpage._id, blog_id, matching_post, function(data) {});
          }
        }
      }
    }

    $scope.resfeshIframe = function() {
      //document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
    };

    window.updateWebsite = function(data) {
      $scope.$apply(function() {
      if(data)
        that.website = data;
      });
    };


    window.updateComponents = function(data) {
      $scope.$apply(function() {
        // setNavigation({
        //     currentPage: {
        //         components: data
        //     }
        // });
        $scope.currentpage.components = data;
        for (var i = 0; i < $scope.currentpage.components.length; i++) {
          if ($scope.currentpage.components[i].type == 'navigation') {
            var body = document.getElementsByTagName('body')[0];
            body.className = body.className.replace('navbar-v', '');
            body.className = body.className + ' navbar-v' + $scope.currentpage.components[i].version;
          }
          if ($scope.currentpage.components[i].type == 'contact-us') {
            $scope.updateContactUsMap($scope.currentpage.components[i]);
          }
          if ($scope.currentpage.components[i].type ==='thumbnail-slider') {
            var w = angular.element($window);
            var check_if_mobile = mobilecheck();
            $scope.thumbnailSliderCollection = angular.copy($scope.currentpage.components[i].thumbnailCollection);
            var winWidth = w.width();
            $scope.bindThumbnailSlider(w.width(), check_if_mobile);
          }
        };
      });
    };
    window.updateCustomComponent = function(data, networks) {
      console.log('updateCustomComponent >>>');
      if (data) {
        $scope.currentpage.components = data;
        setTimeout(function() {
          $scope.$apply(function() {
              activateAloha();
          });
        });
      } else {
        $scope.$apply(function() {

        });
      }

      if (networks)
        $scope.networks = networks;

      for (var i = 0; i < $scope.currentpage.components.length; i++) {
          if ($scope.currentpage.components[i].type ==='thumbnail-slider') {
            var w = angular.element($window);
            var check_if_mobile = mobilecheck();
            $scope.thumbnailSliderCollection = angular.copy($scope.currentpage.components[i].thumbnailCollection);
            var winWidth = w.width();
            $scope.bindThumbnailSlider(w.width(), check_if_mobile);
          }
      };
    };

    window.addCKEditorImageInput = function(url) {
      console.log('addCKEditorImageInput ', url);
      if ($scope.urlInput) {
        $scope.urlInput.val(url);
      }
    };

    window.addCKEditorImage = function(url) {
      console.log('addCKEditorImage ', url);
      console.log('$scope.inlineInput ', $scope.inlineInput);
      if ($scope.inlineInput) {
        console.log('inserting html');
        $scope.inlineInput.insertHtml( '<img data-cke-saved-src="'+url+'" src="'+url+'"/>' );
      }
    };

    window.triggerEditMode = function() {
      console.log('edit mode engaged');
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
    $scope.planStatus = {};
    $scope.$watch('currentpage.components', function(newValue, oldValue) {
      if (newValue) {
        newValue.forEach(function(value, index) {
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
            console.log('value ', value);
            $scope.thumbnailSliderCollection = angular.copy(value.thumbnailCollection);
            var winWidth = w.width();
            $scope.bindThumbnailSlider(winWidth, check_if_mobile);
            w.bind('resize', function() {
              $scope.$apply(function() {
                $scope.bindThumbnailSlider(w.width(), check_if_mobile);
              });
            });
          }
          if (value &&  value.type == 'contact-us') {
              $scope.updateContactUsMap(value);
            }
        });
      }
    });

    $scope.bindThumbnailSlider = function(width, is_mobile) {
      console.log('width ', width);
      console.log('is_mobile ', is_mobile);
      var number_of_arr = 4;
      if (width <= 750 || is_mobile) {
        number_of_arr = 1;
      }
      $scope.imagesPerPage = number_of_arr;
      if($scope.thumbnailSliderCollection)
      {
        $scope.thumbnailCollection = partition($scope.thumbnailSliderCollection, number_of_arr);
        if($scope.thumbnailCollection.length > 1)
          $scope.displayThumbnailPaging = true;
        else
          $scope.displayThumbnailPaging = false;
      }
    }

    window.mobilecheck = function() {
      var check = false;
      (function(a, b) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    }

    window.isAdmin = function() {
      return $scope.isAdmin;
    }

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
    }


    $scope.selectSubscriptionPlanFn = function(planId, amount, interval, cost) {
      console.log('selectSubscriptionPlanFn >>>');
      $scope.newAccount.membership = planId;
      $scope.subscriptionPlanAmount = amount;
      $scope.subscriptionPlanInterval = interval;
      $scope.subscriptionPlanOneTimeFee = parseInt(cost);
    };
    $scope.monthly_sub_cost = 49.95;
    $scope.yearly_sub_cost = 32.91;
    $scope.selected_sub_cost = $scope.monthly_sub_cost;

    $scope.createUser = function(user, component) {
      console.log('user', user);
      var fingerprint = new Fingerprint().get();
      var sessionId = ipCookie("session_cookie")["id"];

      if (!user || !user.email) {
        $("#user_email .error").html("Email Required");
        $("#user_email").addClass('has-error');
        $("#user_email .glyphicon").addClass('glyphicon-remove');
        return;
      }
      if (user.email) {
        var regex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        var result = regex.test(user.email);
        if(!result)
        {
          $("#user_email .error").html("Valid Email Required");
          $("#user_email").addClass('has-error');
          $("#user_email .glyphicon").addClass('glyphicon-remove');
          return;
        }

        var skipWelcomeEmail;

        if (component.skipWelcomeEmail) {
          skipWelcomeEmail = true;
        }
        var formatted = {
          fingerprint: fingerprint,
          sessionId: sessionId,
          details: [{
            emails: []
          }],
          campaignId: component.campaignId,
          skipWelcomeEmail: skipWelcomeEmail
        };
        formatted.details[0].emails.push({
          email: user.email
        });
        //create contact
        console.log('formatted ', formatted);
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

            var name;

            if (user.first && user.last) {
              name = user.first + ' ' + user.last;
            } else {
              name = 'John Doe';
            }

              var hash = CryptoJS.HmacSHA256(user.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
            console.log('hash ', hash.toString(CryptoJS.enc.Hex));
            //send data to intercom
            $window.intercomSettings = {
              name: user.first + ' ' + user.last,
              email: user.email,
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

    $scope.createContactwithFormActivity = function(contact) {
      console.log('contact', contact);
      if (!contact || !contact.email) {
        $("#contact_email .error").html("Email Required");
        $("#contact_email").addClass('has-error');
        $("#contact_email .glyphicon").addClass('glyphicon-remove');
        return;
      }
      if (contact.email) {
        if(contact.full_name)
        {
          var full_name = contact.full_name.split(" ")
          contact.first_name = full_name[0];
          contact.last_name = full_name[1];
        }
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
              contact.first_name = '';
              contact.last_name = '';
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

    $scope.makeSocailAccount = function(socialType) {
      if (socialType) {
        window.location.href = "/signup/" + socialType + "?redirectTo=/signup";
        return;
      }
    };

    userService.getTmpAccount(function(data) {
      $scope.tmpAccount = data;
    });

    $scope.createAccount = function(newAccount) {
      //validate
      //email
      $scope.isFormValid = false;
      if (!$scope.newAccount.email) {
        $scope.checkEmailExists(newAccount);
        return;
      }

      //pass
      if (!$scope.newAccount.password && !$scope.newAccount.tempUserId) {
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
      var tmpAccount = $scope.tmpAccount;
      tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
      userService.saveOrUpdateTmpAccount(tmpAccount, function(data) {
        console.log('Saved the temp account.  Account token is: ' + data.token);
        var newUser = {
          username: newAccount.email,
          password: newAccount.password,
          email: newAccount.email,
          accountToken: data.token,
          coupon: newAccount.coupon
        };
        console.log('newUser.accountToken: ' + newUser.accountToken);
        //get the token
        PaymentService.getStripeCardToken(newAccount.card, function(token, error) {
          if (error) {
            console.info(error);
            $scope.$apply(function() {
              $scope.isFormValid = false;
            })
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
              }
            });
          }

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
    $scope.DeleteImageFromGallery = function(componentId, index) {
      window.parent.deleteImageFromGallery(componentId, index);
    };
    $scope.AddImageToGallery = function(componentId) {
      window.parent.addImageToGallery(componentId);
    }
    $scope.deleteImageFromThumbnail = function(componentId, index, parentIndex) {
      var imageIndex = parentIndex > 0 ? (parentIndex * $scope.imagesPerPage + index) : index;
      window.parent.deleteImageFromThumbnail(componentId, index);
    };
    $scope.addImageToThumbnail = function(componentId) {
      window.parent.addImageToThumbnail(componentId);
    }

$scope.inserted = false;
 if(!$scope.activated)
  $('body').on("DOMNodeInserted", ".feature-height", function (e)
  {
    if(!$scope.inserted)
    {
      setTimeout(function() {
      $scope.inserted = true;
      var maxHeight = Math.max.apply(null, $("div.feature-height").map(function ()
      {
          return $(this).height();
      }).get());
      $scope.maxHeight = maxHeight + 10 + "px";
      }, 500)
   }
  })
  }
]);
