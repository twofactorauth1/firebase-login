var mainApp = angular.module("mainApp");

mainApp.filter('generateURLforLinks', function () {
    return function (linkToObject) {
        var _url = "";
        if(linkToObject)
        {
           switch (linkToObject.type) {
            case "page":                
                    _url = '/'+linkToObject.data;
                return _url;
                break;
            case "home":
                _url = "/";
                break;
            case "url":
                return linkToObject.data;
                break;
            case "section":                
                if(linkToObject.page)
                    return '/'+linkToObject.page+'/#'+linkToObject.data;
                else
                    return '/#'+linkToObject.data;
                break;
            case "product":
                _url = ""; //Not yet implemented
                break;
            case "collection":
                _url = ""; //Not yet implemented
                break;
            case "external":
                var value = linkToObject.data;
                if (value && !/http[s]?/.test(value)) {
                    value = 'http://' + value;
                }
                _url = value;
                break;    
            default:
                return "#";
                break;
        }
        }

        //toDo findOut use of isEditor
        /*var isEditor = true;
        if (_url != null && isEditor === true) {
            if (_url.indexOf("?") == -1) {
                _url = _url + "?";
            }
            _url += "&editor=true";
        }*/
        return _url;
    }

});