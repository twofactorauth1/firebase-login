(function () {
	"use strict";
	app.directive('liveStatus', function () {
		return {
            restrict: 'E',
            transclude: false,
            restrict: 'E',
			scope: {
				liveVisitorDetails: "=live",
                activeVisitorDetail: '=active',
                config:"="
			},
            templateUrl: '/admin/assets/views/partials/visitor.html',
			controller: ['$scope', '$injector', function ($scope, $injector) { 
                $scope.selectedVisitorIndex=0;
                $scope.convertUtcToLocal = function(_date){
                    if(_date){
                        return moment.utc(_date).local().format('YYYY-MM-DD HH:mm:ss')
                    }
                };
                $scope.setActiveVisitorIndex = function(index, reload){
                    if(reload && $scope.activeVisitorDetail){
                        var selectedVisitorDetail = _.findWhere($scope.liveVisitorDetails, {
                            _id: $scope.activeVisitorDetail._id
                        });
                        if(selectedVisitorDetail){
                            var selectedVisitorIndex = _.findIndex($scope.liveVisitorDetails, selectedVisitorDetail);
                            if(selectedVisitorIndex > -1){
                                $scope.selectedVisitorIndex = selectedVisitorIndex;
                                $scope.activeVisitorDetail = $scope.liveVisitorDetails[selectedVisitorIndex];
                            } else{
                                $scope.selectedVisitorIndex = index;
                                $scope.activeVisitorDetail = $scope.liveVisitorDetails[index];
                            }
                        } else{
                            $scope.selectedVisitorIndex = index;
                            $scope.activeVisitorDetail = $scope.liveVisitorDetails[index];
                        }
                    } else{
                        $scope.selectedVisitorIndex = index;
                        $scope.activeVisitorDetail = $scope.liveVisitorDetails[index];
                    }
        
                }
			}]
		};
	});
}()); 