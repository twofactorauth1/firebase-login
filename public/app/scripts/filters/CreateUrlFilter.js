mainApp.filter('createUrlFilter', ['accountService', function (accountService) {
    return function (obj) {
        if (obj) {
            accountService(function (err, data) {
                if (err) {
                    console.log('Error ' + err);
                    return err;
                } else {
                    obj.forEach(function (cp) {
                        cp['url'] = 'components/' + cp.type + '_' + cp.version + '.html';
                        console.log(cp['url']);
                    });
                }
            });
        }
        return obj;
    }
}]);
