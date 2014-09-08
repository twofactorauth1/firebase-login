mainApp.filter('createUrlFilter', ['accountService', function (accountService) {
    return function (obj) {
        if (obj) {
            var componentName = 'social';
             var account;


            accountService(function (err, data) {
                if (err) {
                    console.log('Error ' + err);
                    return err;
                } else {
                    account = data;
                    themeName = account.website.themeId;
                    obj.forEach(function (cp) {
                        cp['url'] = 'components/' + cp.type + '_v' + cp.version + '.html';
                    });
                }
            });
        }
        return obj;
    }
}]);
