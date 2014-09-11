var mainApp = angular.module("mainApp");

mainApp.filter('generateURLforLinks', function () {
    return function (linkToObject) {
        var _url = "";
        switch (linkToObject.type) {
            case "page":
                _url = "#/page/" + linkToObject.data;
                return _url;
                break;
            case "home":
                _url = "/";
                break;
            case "url":
                return linkToObject.data;
            case "section":
                return "#" + linkToObject.data;
            case "product":
                _url = ""; //Not yet implemented
                break;
            case "collection":
                _url = ""; //Not yet implemented
                break;
            default:
                return "#";
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