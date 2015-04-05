define(['angularAMD'], function(angularAMD) {'use strict';
	angularAMD.directive('intervalCountValidate', function() {
		return {
    	require: 'ngModel',
    	link: function(scope, el, attrs, ctrl) {
    		var parent_div = el.closest('div.form-group');	
      		scope.$watch(attrs.ngModel, function() {
					var type = scope.validationType;
						if($("#interval").val() != ""){
							var message = "";
							var result = true;
							if ($("#interval").val() == "year") {
								if(parseInt(el.val()) != 1) {
									var result = false;
									message = "For Yearly interval, maximum interval count is 1."
								}else
								result = true;
							} else if($("#interval").val() == "week"){
								if(parseInt(el.val()) > 52) {
									result = false;
									message = "For weekly interval, maximum interval count is 52."
								}else
								result = true;
							}
							else if($("#interval").val() == "month"){
								if(parseInt(el.val()) > 12) {
									result = false;
									message = "For monthly interval, maximum interval count is 12."
								}else
								result = true;
							}
							if (!result) {
								parent_div.find('small.error').remove();
								parent_div.append("<small class='error help-block'>"+message+"</small>")
								ctrl.$setValidity('maxInterval', false);
							} else {
								parent_div.removeClass('has-error');
								parent_div.find('small.error').remove();
								ctrl.$setValidity('maxInterval', true);
							}
						}
					
				});
			}
		}
	});

})