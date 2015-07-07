/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('paymentFormComponent', ['$filter', '$q', 'productService', 'paymentService', 'userService', 'ipCookie', function ($filter, $q, ProductService, PaymentService, UserService, ipCookie) {
  return {
    require: [],
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.planStatus = {};
      var productId = scope.component.productId;
      console.log('productId ', productId);
      ProductService.getProduct(productId, function (product) {
        console.log('product ', product);
        scope.paymentFormProduct = product;
        var promises = [];
        scope.subscriptionPlans = [];
        if ('stripePlans' in scope.paymentFormProduct.product_attributes) {
          scope.paymentFormProduct.product_attributes.stripePlans.forEach(function (value, index) {
            if (value.active)
              scope.planStatus[value.id] = value;
            promises.push(PaymentService.getPlanPromise(value.id));
          });
          $q.all(promises)
            .then(function (data) {
              data.forEach(function (value, index) {
                scope.subscriptionPlans.push(value.data);
                if (scope.subscriptionPlans.length === 1) {
                  var plan = scope.subscriptionPlans[0];
                  scope.selectSubscriptionPlanFn(plan.id, plan.amount, plan.interval, scope.planStatus[plan.id].signup_fee);
                }
              });
            })
            .catch(function (err) {
              console.error(err);
            });
        }
      });

      scope.bindThumbnailSlider = function (width, is_mobile, thumbnailId) {
        var number_of_arr = 4;
        if (width <= 750 || is_mobile) {
          number_of_arr = 1;
        }
        scope.imagesPerPage = number_of_arr;

        var matching = _.find(scope.thumbnailSlider, function (item) {
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
        (function (a, b) {
          if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
      };

      scope.isAdmin = function () {
        return scope.isAdmin;
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


      scope.selectSubscriptionPlanFn = function (planId, amount, interval, cost) {
        scope.newAccount.membership = planId;
        scope.subscriptionPlanAmount = amount;
        scope.subscriptionPlanInterval = interval;
        scope.subscriptionPlanOneTimeFee = parseInt(cost);
      };
      scope.monthly_sub_cost = 49.95;
      scope.yearly_sub_cost = 32.91;
      scope.selected_sub_cost = scope.monthly_sub_cost;

      scope.createUser = function (user, component) {
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
          UserService.addContact(formatted, function (data, err) {
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
              component.fields.forEach(function (value) {
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

              setTimeout(function () {
                scope.$apply(function () {
                  user.success = false;
                });
              }, 3000);
            }

          });
        }

        //redirect to signup with details
        //window.location.href = "http://app.indigenous.local:3000/signup";
      };

      scope.createContactwithFormActivity = function (contact, component) {
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

        var fingerprint = new Fingerprint().get();
        var sessionId = ipCookie("session_cookie")["id"];

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
            fingerprint: fingerprint,
            sessionId: sessionId,
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


          UserService.addContact(contact_info, function (data, err) {
            if (err && err.code === 409) {
              // angular.element("#input-company-name").val('');
              angular.element("#contact_email_" + component._id + " .error").html("Email already exists");
              angular.element("#contact_email_" + component._id).addClass('has-error');
              angular.element("#contact_email_" + component._id + " .glyphicon").addClass('glyphicon-remove');

            } else if (data) {
              angular.element("#contact_email_" + component._id + " .error").html("");
              angular.element("#contact_email_" + component._id).removeClass('has-error');
              angular.element("#contact_email_" + component._id + " .glyphicon").removeClass('glyphicon-remove');
              contact.success = true;
              setTimeout(function () {
                scope.$apply(function () {
                  contact.success = false;
                  angular.forEach(contact, function (value, key) {
                    delete contact[key];
                  });
                });
              }, 3000);
            }

          });
        }


        //create contact


        //redirect to signup with details
        //window.location.href = "http://app.indigenous.local:3000/signup";
      };

      scope.removeAccount = function (type) {
        scope.newAccount.businessName = null;
        scope.newAccount.profilePhoto = null;
        scope.newAccount.tempUserId = null;
        scope.newAccount.email = null;
        scope.tmpAccount.tempUser = null;
        scope.newAccount.hidePassword = false;
      };

      scope.makeSocailAccount = function (socialType) {
        if (socialType) {
          window.location.href = "/signup/" + socialType + "?redirectTo=/signup";
          return;
        }
      };

      UserService.getTmpAccount(function (data) {
        scope.tmpAccount = data;
      });

      scope.showFooter = function (status) {
        if (status)
          angular.element("#footer").show();
        else
          angular.element("#footer").hide();
      };

      scope.createAccount = function (newAccount) {
        //validate
        //email
        scope.isFormValid = false;
        scope.showFooter(true);
        if (!scope.newAccount.email) {
          scope.checkEmailExists(newAccount);
          return;
        }

        //pass
        if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {
          scope.checkPasswordLength(newAccount);
          return;
        }

        //url
        if (!scope.newAccount.businessName) {
          scope.checkDomainExists(newAccount);
          return;
        }

        //membership selection
        if (!scope.newAccount.membership) {
          scope.checkMembership(newAccount);
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
          scope.checkCardNumber();
          scope.checkCardExpiry();
          scope.checkCardCvv();
          return;
        }
        scope.checkCoupon();
        if (!scope.couponIsValid) {
          return;
        }
        //end validate
        scope.isFormValid = true;
        scope.showFooter(false);
        var tmpAccount = scope.tmpAccount;
        tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
        UserService.saveOrUpdateTmpAccount(tmpAccount, function (data) {
          var newUser = {
            username: newAccount.email,
            password: newAccount.password,
            email: newAccount.email,
            accountToken: data.token,
            coupon: newAccount.coupon
          };
          //get the token
          PaymentService.getStripeCardToken(newAccount.card, function (token, error) {
            if (error) {
              console.info(error);
              scope.$apply(function () {
                scope.isFormValid = false;
                scope.showFooter(true);
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
              newUser.plan = scope.newAccount.membership;
              newUser.anonymousId = window.analytics.user().anonymousId();
              newUser.permanent_cookie = ipCookie("permanent_cookie");
              newUser.fingerprint = new Fingerprint().get();
              if (scope.subscriptionPlanOneTimeFee) {
                newUser.setupFee = scope.subscriptionPlanOneTimeFee * 100;
              }
              UserService.initializeUser(newUser, function (err, data) {
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
                  scope.isFormValid = false;
                  if (err.message === 'card_declined') {
                    angular.element("#card_number .error").html('There was an error charging your card.');
                    angular.element("#card_number").addClass('has-error');
                    angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                  }
                  scope.showFooter(true);
                }
              });
            }

          });

        });
      };

      scope.newAccount = {};

      scope.checkDomainExists = function (newAccount) {
        if (!newAccount.businessName) {
          angular.element("#business-name .error").html("Url Required");
          angular.element("#business-name").addClass('has-error');
          angular.element("#business-name .glyphicon").addClass('glyphicon-remove');
        } else {
          var name = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
          UserService.checkDomainExists(name, function (data) {
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

      scope.checkEmailExists = function (newAccount) {
        scope.newAccount.email = newAccount.email;
        if (!newAccount.email) {
          angular.element("#email .error").html("Email Required");
          angular.element("#email").addClass('has-error');
          angular.element("#email .glyphicon").addClass('glyphicon-remove');
        } else {
          UserService.checkEmailExists(newAccount.email, function (data) {
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

      scope.checkPasswordLength = function (newAccount) {
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

      scope.checkMembership = function (newAccount) {
        if (!newAccount.membership) {
          console.log('membership not selected');
        } else {
          console.log('membership has been selected');
        }
      };

      scope.checkCardNumber = function () {
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

      scope.checkCardExpiry = function () {
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

      scope.checkCardCvv = function () {
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

      scope.checkCoupon = function () {
        console.log('>> checkCoupon');
        var coupon = scope.newAccount.coupon
          //console.dir(coupon);
          //console.log(scope.newAccount.coupon);
        if (coupon) {
          PaymentService.validateCoupon(coupon, function (data) {
            if (data.id && data.id === coupon) {
              console.log('valid');
              angular.element("#coupon-name .error").html("");
              angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
              angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
              scope.couponIsValid = true;
            } else {
              console.log('invalid');
              angular.element("#coupon-name .error").html("Invalid Coupon");
              angular.element("#coupon-name").addClass('has-error');
              angular.element("#coupon-name .glyphicon").addClass('glyphicon-remove');
              scope.couponIsValid = false;
            }
          });
        } else {
          angular.element("#coupon-name .error").html("");
          angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
          angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
          scope.couponIsValid = true;
        }
      };

      scope.checkCardName = function () {
        var name = $('#card_name #name').val();
        if (name) {
          $("#card_name .error").html("");
          $("#card_name").removeClass('has-error').addClass('has-success');
          $("#card_name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
        }
      };
    }
  };
}]);
