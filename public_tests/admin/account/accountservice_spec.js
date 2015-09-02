describe(‘test accountService, function() {
    var $scope, $httpBackend;
    beforeEach(module(‘app.test’));
    beforeEach(inject(_$rootScope_, _$controller_, _$httpBackend_){
        $scope = _$rootScope_.$new();
        $controller(‘testCtrl, {$scope: $scope});
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/get_number').respond({
            number: 42
        });
    });

    it('$scope.getNumber', function() {
        $scope.getNumber();
        $httpBackend.flush();
        $scope.$digest();
        expect($scope.number).toEqual(42);
    });
});