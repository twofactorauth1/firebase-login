(function () {
	"use strict";
	app.directive('liveStatus', function () {
		return {
            restrict: 'E',
            transclude: false,
			scope: {
				liveVisitorDetails: "=live",
                activeVisitorDetail: '=active',
                loading:"=",
                selectedVisitorIndex: "=index"
			},
            templateUrl: '/admin/assets/views/partials/visitor.html',
			controller: ['$scope', '$state', '$filter', function ($scope, $state, $filter) {
                if(!angular.isDefined($scope.loading)){
                    $scope.loading=true;
                }
                $scope.selectedVisitorIndex=0;
                $scope.sortData = {
                    column: '',
                    details: {}
                }
                $scope.currentSortData = {

                }
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
                };

                $scope.goToContactDetails = function(contactId){
                    $state.go('app.singleContact', {contactId: contactId});
                };

                $scope.$watch('liveVisitorDetails', function(newData, oldData){
                    if(newData && $scope.currentSortData.key && !angular.equals(newData, oldData)){
                        sortData();
                    }
                })

                $scope.sortLiveDetails = function(name, key){
                    if($scope.sortData.column !== name){
                        $scope.sortData.details = {};
                    }
                    $scope.sortData.column = name;
                    if($scope.sortData.details[name]){
                        if($scope.sortData.details[name].direction === 1){
                            $scope.sortData.details[name].direction = -1;
                        }
                        else{
                            $scope.sortData.details[name].direction = 1;
                        }
                    }
                    else{
                        $scope.sortData.details[name] = {
                            direction: 1
                        }
                    }
                    var sortOrder = $scope.sortData.details[name].direction === 1 ? true : false;                    
                    $scope.currentSortData = {
                        key : key,
                        data: sortOrder
                    }
                    sortData();                    
                }

                function sortData(){
                    $scope.liveVisitorDetails = $filter('orderBy')($scope.liveVisitorDetails, $scope.currentSortData.key, $scope.currentSortData.data);
                    $scope.setActiveVisitorIndex($scope.selectedVisitorIndex, true);
                }
			}]
		};
	});
}()); 