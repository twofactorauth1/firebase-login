/*global app */
/*jslint unparam:true*/
app.filter('generateURLforLinks', function () {
	'use strict';
	return function (linkToObject) {
		if (linkToObject) {
			switch (linkToObject.type) {
				case "page":
					//if (linkToObject.data != 'blog') {
					return '/page/' + linkToObject.data;
					// } else {
					//     _url = '/'+linkToObject.data;
					// }
				case "home":
					return "/";
				case "url":
					return linkToObject.data;
				case "section":
					return '/#' + linkToObject.data;
				case "product":
					return ""; //Not yet implemented
				case "collection":
					return ""; //Not yet implemented
				case "external":
					var value = linkToObject.data;
					if (value && !/http[s]?/.test(value)) {
						value = 'http://' + value;
					}
					return value;
				default:
					return "#";
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
	};
});
