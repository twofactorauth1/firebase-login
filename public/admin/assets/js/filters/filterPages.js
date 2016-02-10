'use strict';

app.filter('filterPages', function () {
  return function (pages, websiteLinks, customLinks, customNav, handle) {
    var linkList = [];    
    var _links = null;
    if(customNav){
      _links = customLinks;
    }
    else{
      _links = websiteLinks;
    }
    _links.forEach(function (value, index) {
      if (value.handle === "head-menu") {
        linkList = value.links;
      }
    });
    if (pages) {
      return pages.filter(function (page) {   
          var valid = true;   
          _.each(linkList, function (link) {
            if (page.handle === link.linkTo.data && (link.linkTo.type === 'page' || link.linkTo.type === 'home')) {
              if(handle && handle === link.linkTo.data){
                valid = true;
              }
              else
                valid = false;
            }
          });
          return valid;          
      });
    }
  };
});
