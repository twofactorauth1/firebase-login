mainApp.filter('CreateUrlFilter', ['accountService', function (accountService) {
    console.log('i m filter');
    var componentURL;

    return function (obj) {
        if (obj) {
            accountService(function (err, data) {
                if (err) {
                    console.log('Error ' + err);
                    return err;
                } else {
                    console.log(data, "==========data=======");
                    obj.forEach(function (component) {
                        component['url'] = 'components/' + component.type + '/'+ component.type + '_'+ data.website.themeId + '.html';
                        console.log(component.url);
                    });
                    console.log("@#@##############@@@@",obj);
                    return obj;
                }
            });
        }
    }
}]);
