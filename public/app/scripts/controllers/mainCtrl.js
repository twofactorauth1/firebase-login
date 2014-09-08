'use strict';

mainApp.controller('MainCtrl', ['$scope',
    function ($scope) {

        var account, pages,that = this,
            themeName = 'fittester';

        //Include Layout For Theme
        that.themeUrl = 'components/layout/layout_' + themeName + '.html';

        //Include CSS For Theme
        that.themeStyle = 'styles/style.' + themeName + '.css';

    }]);
