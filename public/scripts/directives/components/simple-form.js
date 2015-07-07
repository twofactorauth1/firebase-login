app.directive('simpleFormComponent',["ipCookie", '$window', function (ipCookie, $window) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, userService) {
	    $scope.createUser = function (user, component) {
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
	        userService.addContact(formatted, function (data, err) {
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
	                user.success = false;
	            }, 3000);
	          }
	        });
	      }
	    };
	    $scope.createContactwithFormActivity = function (contact, component) {
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
		        userService.addContact(contact_info, function (data, err) {
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
		              $scope.$apply(function () {
		                contact.success = false;
		                angular.forEach(contact, function(value, key) {
		                    delete contact[key];
		                });
		              });
		            }, 3000);
		          }

		        });
	      	}
    	};
    }
  }
}]);