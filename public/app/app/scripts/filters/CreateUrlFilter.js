mainApp.filter('CreateUrlFilter', ['accountService', function (accountService) {
    var themeName;
    console.log('i m filter');
    accountService(function (err, data) {
        if (err) {
            console.log(err);
        } else {
            themeName = data.website.themeId;
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', themeName);
        }
    });
    return function (obj) {
        obj.filter(function (item) {
            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', item);
            item['url'] = 'components/' + item.type + '/' + item.type.trim() + '_' + themeName + '.html';
            return item;
        });
        return obj;
    }
}]);
