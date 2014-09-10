mainApp.filter('createUrlFilter', [function () {
    return function (obj) {
        if (obj) {
            obj.forEach(function (cp) {
                cp['url'] = 'components/' + cp.type + '_' + cp.version + '.html';
            });
        }else{
            console.log('CreateUrlFilter Else Check');
        }
        return obj;
    }
}]);
