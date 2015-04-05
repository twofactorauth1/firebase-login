define(['app', 'userService'], function(app) {
    app.register.controller('InterimCtrl', ['$scope', 'UserService', function($scope, UserService) {
    	$('.interim').parent().parent().parent().parent().find('#leftnav').hide();
    	$('.interim').parent().parent().parent().parent().find('.headerbar').hide();
    	$('.interim').parent().parent().parent().parent().find('.headerbg').hide();
    	$('.mainpanel').css('margin-left', 0);
    	$('.body-wrap').css('background', '#e7e7e7')
  }]);
});
