mainApp.filter('createUrlFilter', ['accountService', function (accountService) {
    return function (obj) {
        if (obj) {
            var componentName = 'contact-us',
                themeName = 'default';

            accountService(function (err, data) {
                if (err) {
                    console.log('Error ' + err);
                    return err;
                } else {
                    obj.forEach(function (cp) {
                        cp['url'] = 'components/' + componentName + '/'+ componentName + '_'+ themeName + '.html';
                    });
                }
            });
        }
        return obj;
    }
}]);
