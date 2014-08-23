mainApp.filter('CreateUrlFilter', ['accountService', function (accountService) {
    console.log('i m filter');
    var themeName = accountService('enter-subdomain-url-here').website.themeId;
    return function (obj) {
        obj.filter(function (item) {
            item['url'] = 'components/' + item.type + '/' + item.type.trim() + '_' + themeName + '.html';
            return item;
        });
        return obj;
    }
}]);
