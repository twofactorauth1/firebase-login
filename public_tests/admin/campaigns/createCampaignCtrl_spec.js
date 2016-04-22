'use strict';

var $$ = {
    'models': {},
    'm': {},
    'collections': {},
    'c': {},
    'views': {},
    'v': {},
    'routers': {},
    'r': {},
    'utils': {},
    'u': {},
    'security': {},
    's': {},
    'global': {},
    'g': {},
    'services': {},
    'svc': {},
    'constants': {},
    'events': {},
    'e': {},
    'modules': {},
    'Charts': {},
    'server': {
        'router': 'account/admin',
        'root': 'admin',
        'userId': 1358,
        'isLoggedIn': true,
        'accountId': 1,
        'websiteId': 'e4fcdc01-d678-4c35-9133-3870f6f809b4',
        'trialDaysRemaining': 56
    }
}

describe('createCampaignCtrl', function () {

    var $rootScope, $scope, $controller;

    beforeEach(module('indigenousApp'));
    beforeEach(module('toaster'));
    beforeEach(module('ipCookie'));
    beforeEach(module('xeditable'));
    beforeEach(module('oitozero.ngSweetAlert'));

    beforeEach(inject(function (_$rootScope_, _$controller_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $controller = _$controller_;
    }));

    it('should have no customer tags set by default', function () {
        var CreateCampaignCtrl =  $controller('CreateCampaignCtrl', {
            '$rootScope': $rootScope,
            '$scope': $scope
        });
        expect($scope.newCampaignObj.searchTags.tags).toEqual([]);
    });

    it('should have customer tag operation set to "set" by default', function () {
        var CreateCampaignCtrl =  $controller('CreateCampaignCtrl', {
            '$rootScope': $rootScope,
            '$scope': $scope
        });
        expect($scope.newCampaignObj.searchTags.operation).toBe('set');
    });

    it('formatTagsFn should be empty string by default', function () {
        var CreateCampaignCtrl =  $controller('CreateCampaignCtrl', {
            '$rootScope': $rootScope,
            '$scope': $scope
        });
        expect($scope.formatTagsFn()).toEqual('');
    });

    it('formatTagsFn should return comma separated tag names', function () {
        var CreateCampaignCtrl =  $controller('CreateCampaignCtrl', {
            '$rootScope': $rootScope,
            '$scope': $scope
        });
        var searchTags = {
            "operation":"set",
            "tags":[
                {
                    "label":"Jobim",
                    "data":"Jobim"
                },
                {
                    "label":"Johnson",
                    "data":"Johnson"
                }
            ]};

        $scope.newCampaignObj.searchTags = searchTags;

        expect($scope.formatTagsFn()).toBe('Jobim, Johnson');
    });

});
