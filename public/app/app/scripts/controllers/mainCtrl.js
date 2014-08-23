'use strict';

mainApp.controller('MainCtrl', ['$scope', 'accountService', 'websiteService', 'themeService', 'pagesService', function ($scope, accountService, websiteService, themeService, pagesService) {

    //Checking Services Working Only Do not use all the services here

    //Getting Data From Database According to Subdomain
    //TODO
    this.account = accountService('enter-subdomain-url-here');
    //console.log(this.account);

    //Getting All the Data Related to website
    //TODO
    this.website = websiteService(this.account.website.websiteId);
    //console.log(this.website);

    //Getting All the Data Related to theme
    //TODO
    this.theme = themeService(this.account.website.websiteId);
    //console.log(this.theme);

    //Getting All ARRAY of PAGES to theme
    //TODO
    this.pages = pagesService(this.account.website.websiteId);
    //console.log(this.pages);

    //Include Layout For Theme
    this.themeUrl = 'components/layout/layout_' + this.account.website.themeId + '.html';

    //Include CSS For Theme
    this.themeStyle = 'styles/style.' + this.account.website.themeId + '.css';

    //Set Page Title
    this.pageName = this.pages[0].title;

}]);
