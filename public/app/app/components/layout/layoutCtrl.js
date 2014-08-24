'use strict';

/*
* TODO
* We have to make one transport service which will take
* Theme Dependent Data from the server only one time in
* MainCtrl and we have to inject the service into current LayoutCtrl
*
* */

 mainApp.controller('LayoutCtrl', ['$scope','accountService','themeService','websiteService','pagesService', function ($scope,accountService,themeService,websiteService,pagesService) {

    console.log('i m layout controller');

    //Getting Data From Database According to Subdomain
    //TODO
    this.account = accountService('enter-subdomain-url-here');

    //Getting All the Data Related to theme
    //TODO
    this.theme = themeService(this.account.website.websiteId);

    //Getting All the Data Related to website
    //TODO
    this.website = websiteService(this.account.website.websiteId);

    //Getting All ARRAY of PAGES to theme
    //TODO
    this.pages = pagesService(this.account.website.websiteId);
    console.log(this.pages[0].components);


}]);
