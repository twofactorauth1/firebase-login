define(['app', 'productService', 'paymentService', 'headroom', 'ngHeadroom', 'ngProgress', 'userService', 'navigationService', 'ngOnboarding'], function(app) {
  app.register.controller('CommerceCtrl', ['$scope', 'ProductService', 'PaymentService', 'ngProgress', 'UserService', 'NavigationService', '$location', function($scope, ProductService, PaymentService, ngProgress, UserService, NavigationService, $location) {
    ngProgress.start();
    NavigationService.updateNavigation();
    $scope.addProductFn = function() {
      ProductService.postProduct($scope.newProduct, function(product) {
        $scope.products.unshift(product);
        $('#commerce-add-product').modal('hide');
      });
    };
    $scope.showOnboarding = false;
    $scope.stepIndex = 0;
    $scope.onboardingSteps = [{
      overlay: false
    }];

    $scope.beginOnboarding = function(type) {
      console.log('begin onboarding');
      if (type == 'add-product') {
        $scope.stepIndex = 0;
        $scope.onboardingSteps = [{
          overlay: true,
          title: 'Task: Add Product',
          description: "Add your first product to begin selling.",
          position: 'centered',
          width: 400
        }];
      }
    };

    $scope.finishOnboarding = function() {
      console.log('finsish onboarding');
      $scope.userPreferences.tasks.add_product = true;
      UserService.updateUserPreferences($scope.userPreferences, false, function() {});
    };

    if ($location.$$search['onboarding']) {
      console.log('search onboarding');
      $scope.beginOnboarding($location.$$search['onboarding']);
    }

    $scope.productStarredFn = function(product, starred) {
      product.starred = starred;
      ProductService.saveProduct(product, function(product) {
        console.log(product);
      });
    };

    $scope.toggleProductThumb = true;

    $scope.$watch('toggleProductThumb', function(value) {
      if (angular.isDefined(value)) {
        $scope.commerceSettings.showProductThumb = value;
      }
    });

    $scope.toggleSku = true;

    $scope.$watch('toggleSku', function(value) {
      if (angular.isDefined(value)) {
        $scope.commerceSettings.showSku = value;
      }
    });

    $scope.togglePrice = true;

    $scope.$watch('togglePrice', function(value) {
      if (angular.isDefined(value)) {
        $scope.commerceSettings.showPrice = value;
      }
    });

    $scope.toggleProductType = true;

    $scope.$watch('toggleProductType', function(value) {
      if (angular.isDefined(value)) {
        $scope.commerceSettings.showProductType = value;
      }
    });

    $scope.toggleProductStatus = true;

    $scope.$watch('toggleProductStatus', function(value) {
      if (angular.isDefined(value)) {
        $scope.commerceSettings.showProductStatus = value;
      }
    });

    $scope.toggleProductCost = true;

    $scope.$watch('toggleProductCost', function(value) {
      if (angular.isDefined(value)) {
        $scope.commerceSettings.showProductCost = value;
      }
    });

    $scope.commerceSettings = {
      showProductThumb: true,
      showSku: true,
      showPrice: true,
      showProductType: true,
      showProductStatus: true,
      showProductCost: true,
      gridViewDisplay: true
    };

    $scope.$watch('sortOrder', function(newValue, oldValue) {
      newValue = parseInt(newValue);
      if (newValue === 0) {
        $scope.productOrder = 'created.date';
        $scope.productSortReverse = true;
      } else if (newValue == 1) {
        $scope.productOrder = 'name';
        $scope.productSortReverse = false;
      } else if (newValue == 2) {
        $scope.productOrder = 'name';
        $scope.productSortReverse = true;
      } else if (newValue == 3) {
        $scope.productOrder = 'created.date';
        $scope.productSortReverse = true;
      }
      //else if (newValue == 4) {
      //  $scope.productOrder = 'last';
      // $scope.productSortReverse = false;
      //}
      //else if (newValue == 5) {
      //  $scope.productOrder = 'lastActivity';
      //$scope.productSortReverse = true;
      //}
      else if (newValue == 4) {
        $scope.productOrder = 'total_sales';
        $scope.productSortReverse = false;
      } else if (newValue == 5) {
        $scope.productOrder = 'regular_price';
        $scope.productSortReverse = false;
      } else if (newValue == 6) {
        $scope.productOrder = 'regular_price';
        $scope.productSortReverse = true;
      } else if (newValue == 7) {
        $scope.productOrder = 'starred';
        $scope.productSortReverse = true;
      }
    });
    var initializeSortOrder = 0;
    $scope.$watch('sortOrderSettings', function(newValue, oldValue) {
      if (initializeSortOrder >= 2) {
        newValue = parseInt(newValue);
        $scope.sortOrder = newValue;
        if (newValue === 0) {
          $scope.productOrder = 'name';
          $scope.productSortReverse = false;
        } else if (newValue == 1) {
          $scope.productOrder = 'name';
          $scope.productSortReverse = false;
        } else if (newValue == 2) {
          $scope.productOrder = 'name';
          $scope.productSortReverse = true;
        } else if (newValue == 3) {
          $scope.productOrder = 'created.date';
          $scope.productSortReverse = false;
        } else if (newValue == 4) {
          $scope.productOrder = 'total_sales';
          $scope.productSortReverse = false;
        } else if (newValue == 5) {
          $scope.productOrder = 'regular_price';
          $scope.productSortReverse = false;
        } else if (newValue == 6) {
          $scope.productOrder = 'regular_price';
          $scope.productSortReverse = true;
        } else if (newValue == 7) {
          $scope.productOrder = 'starred';
          $scope.productSortReverse = true;
        }
        if (newValue && $scope.userPreferences && $scope.userPreferences.commerceSettings) {
          $scope.userPreferences.commerceSettings.productOrder = $scope.productOrder;
          $scope.userPreferences.commerceSettings.productSortReverse = $scope.productSortReverse;
          $scope.savePreferencesFn();
        }
      }
      initializeSortOrder += 1;


    });

    $scope.savePreferencesFn = function() {
      UserService.updateUserPreferences($scope.userPreferences, true, function() {});
    };
    $scope.setDefaultView = function(value) {
      $scope.commerceSettings.gridViewDisplay = value;
    };

    $scope.max_value = function(hash) {
      if (hash) {
        var price = {};
        if (hash[0] && hash[0].price) {
          price = _.max(hash, function(p) {
            return p.price;
          });
          return _.filter([(price.price / 100).toFixed(2), '(', price.signup_fee, ')'], function(str) {
            return (str !== "");
          }).join(" ");
        }
      }
    }

    $scope.min_value = function(hash) {
      if (hash) {
        var price = {};
        if (hash[0] && hash[0].price) {
          price = _.min(hash, function(p) {
            return p.price;
          });

          return _.filter([(price.price / 100).toFixed(2), '(', price.signup_fee, ')'], function(str) {
            return (str !== "");
          }).join(" ");
        }
      }
    }

    ProductService.getProducts(function(products) {
      $scope.products = products;
      ngProgress.complete();
      setTimeout(function() {
        if ($location.$$search.onboarding) {
          $scope.showOnboarding = true;
        }
      }, 2000);
    });
    UserService.getUserPreferences(function(preferences) {
      $scope.userPreferences = preferences;
      if ($scope.userPreferences.tasks) {
        if ($scope.showOnboarding = false && $scope.userPreferences.tasks.add_product == undefined || $scope.userPreferences.tasks.add_product == false) {
          $scope.finishOnboarding();
        }
      }
      var commerceSettings = $scope.userPreferences.commerceSettings;
      if (commerceSettings) {
        $scope.userPreferences.commerceSettings = commerceSettings;
        $scope.productOrder = $scope.userPreferences.commerceSettings.productOrder;
        $scope.productSortReverse = $scope.userPreferences.commerceSettings.productSortReverse;


        var productOrder = $scope.productOrder;
        var productSortReverse = $scope.productSortReverse;
        var orderNum;
        if (productOrder === 'name') {
          if (productSortReverse)
            orderNum = 2;
          else
            orderNum = 1;
        } else if (productOrder === 'created.date') {
          orderNum = 3;
        } else if (productOrder === 'total_sales') {
          orderNum = 4;
        } else if (productOrder === 'regular_price') {
          if (productSortReverse)
            orderNum = 6;
          else
            orderNum = 5;
        } else if (productOrder === 'starred') {
          orderNum = 7;
        }
        $scope.sortOrder = orderNum;
        $scope.sortOrderSettings = orderNum;
      } else {
        $scope.userPreferences.commerceSettings = {
          productOrder: 'name',
          productSortReverse: false
        };
        $scope.sortOrder = 1;
        $scope.sortOrderSettings = 1;
      }
    });

  }]);
});
