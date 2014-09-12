mainApp.filter('createUrlFilter', [function () {
    return function (obj) {
        if (obj) {
            obj.forEach(function (cp) {
                cp['url'] = '/components/' + cp.type + '_v' + cp.version + '.html';
            });
        } else {
            console.log('CreateUrlFilter Else Check');
        }
        return obj;
    }
}]);
