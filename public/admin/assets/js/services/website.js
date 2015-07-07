'use strict';
/*global app, moment, angular, window, $$*/
/*jslint unparam:true*/
(function (angular) {
  app.service('WebsiteService', function ($http) {
    var baseUrl = '/api/1.0/';
    this.editPageHandle = null;

    this.getEditedPageHandle = function () {
      return this.editPageHandle;
    };

    this.setEditedPageHandle = function (handle) {
      this.editPageHandle = handle;
    };

    this.getWebsite = function (fn) {
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId].join('/');
      $http.get(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    //website
    this.updateWebsite = function (data, fn) {
      var apiUrl = baseUrl + ['cms', 'website'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(data)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR', err);
        fn(err, null);
      });
    };

    //website/:websiteid/page/:handle
    this.getSinglePage = function (handle, fn) {
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId, 'page', handle].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (err) {
          console.log('END:getSinglePage with ERROR');
          fn(err, null);
        });
    };

    //website/:websiteid/page/:handle
    this.getSinglePost = function (handle, fn) {
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId, 'blog', handle].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (err) {
          console.log('END:getSinglePost with ERROR');
          fn(err, null);
        });
    };

    //page/:id/versions
    this.getPageVersions = function (pageId, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'versions'].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (err) {
          console.log('END:getPageVersions with ERROR');
          fn(err, null);
        });
    };

    //page/:id/revert/:version
    this.revertPageVersion = function (pageId, versionId, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'revert', versionId].join('/');
      $http({
        url: apiUrl,
        method: "POST"
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service revertPageVersion with ERROR');
        fn(err, null);
      });
    };

    this.getPages = function (fn) {
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId.replace(/&quot;/g, ''), 'pages'].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (err) {
          console.log('END:Website Service with ERROR');
          fn(err, null);
        });
    };

    this.getPagesWithLimit = function (accountId, queryParams, fn) {
      var apiUrl = baseUrl + ['cms', 'website', accountId, 'pages'].join('/');
      $http({
        url: apiUrl,
        method: 'GET',
        params: queryParams
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR');
        fn(err, null);
      });
    };

    this.getEmails = function (fn) {
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId.replace(/&quot;/g, ''), 'emails'].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (err) {
          console.log('END:Website Service with ERROR');
          fn(err, null);
        });
    };

    this.getPosts = function (fn) {
      var apiUrl = baseUrl + ['cms', 'editor', 'blog'].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data.results);
        })
        .error(function (err) {
          console.log('END:Get Posts with ERROR');
          fn(err, null);
        });
    };

    this.getPostsWithLimit = function (queryParams, fn) {
      var apiUrl = baseUrl + ['cms', 'editor', 'blog'].join('/');
      $http({
        url: apiUrl,
        method: 'GET',
        params: queryParams
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Get Posts with ERROR');
        fn(err, null);
      });
    };

    // website/:websiteId/page/:id
    this.updatePage = function (page, fn) {
      if (!page.modified) {
        page.modified = {};
      }
      page.modified.date = new Date();
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId, 'page', page._id].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(page)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service updatePage with ERROR');
        fn(err, null);
      });
    };

    //page/:id/components/all
    this.updateComponentOrder = function (pageId, componentId, newOrder, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', componentId, 'order', newOrder].join('/');
      $http({
        url: apiUrl,
        method: "POST"
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR');
        fn(err, null);
      });
    };

    //page/:id/components/all
    this.updateAllComponents = function (pageId, componentJSON, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', 'all'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        //angular.toJson() used instead of JSON.stringify to remove $$hashkey value
        data: angular.toJson(componentJSON)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:updateAllComponents with ERROR', err);
        fn(err);
      });
    };

    //page/:id/components/:componentId
    this.updateComponent = function (pageId, componentId, componentJSON, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', componentId].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        //angular.toJson() used instead of JSON.stringify to remove $$hashkey value
        data: angular.toJson(componentJSON)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR');
        fn(err);
      });
    };

    //page/:id/components
    this.addNewComponent = function (pageId, title, type, cmpVersion, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'components'].join('/');
      var data = {
        title: title,
        type: type,
        cmpVersion: cmpVersion
      };
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(data)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR');
      });
    };

    //page/:id/components/:componentId
    this.deleteComponent = function (pageId, componentId, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', componentId].join('/');
      $http({
        url: apiUrl,
        method: "DELETE"
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR');
      });
    };

    //website/:websiteId/page
    this.createPage = function (websiteId, pagedata, fn) {
      var apiUrl = baseUrl + ['cms', 'website', websiteId, 'page'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(pagedata)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Create Page with ERROR');
      });
    };

    //website/:websiteId/duplicate/page
    this.createDuplicatePage = function (pagedata, fn) {
      var apiUrl = baseUrl + ['cms', 'website', $$.server.websiteId, 'duplicate', 'page'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(pagedata)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Create Page with ERROR');
      });
    };

    //template/:id/website/:websiteId/page/
    this.createPageFromTemplate = function (templateId, pagedata, fn) {
      var apiUrl = baseUrl + ['cms', 'template', templateId, 'website', $$.server.websiteId, 'page'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(pagedata)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:createPageFromTemplate with ERROR');
      });
    };

    this.createPost = function (pageId, postdata, fn) {
      postdata.post_tags = null;
      if (!postdata.created) {
        postdata.created = {};
      }
      if (!postdata.modified) {
        postdata.modified = {};
      }
      postdata.created.date = new Date().getTime();
      postdata.modified.date = new Date().getTime();
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(postdata)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Create Page with ERROR', err);
      });
    };

    //website/:websiteId/page/:id/:label
    this.deletePage = function (pageId, websiteId, label, fn) {
      var apiUrl = baseUrl + ['cms', 'website', websiteId, 'page', pageId, label].join('/');
      $http.delete(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Delete Page with ERROR', err);
        fn(err);
      });
    };

    this.getTemplates = function (fn) {
      var apiUrl = baseUrl + ['cms', 'template'].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.updateTemplate = function (templateId, templatedata, fn) {
      var apiUrl = baseUrl + ['cms', 'template', templateId].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(templatedata)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Update Template with ERROR', err);
      });
    };

    this.getPageComponents = function (pageId, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'components'].join('/');
      $http.get(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    this.getComponentVersions = function (componentType, fn) {
      var apiUrl = baseUrl + ['cms', 'component', componentType, 'versions'].join('/');
      $http.get(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    this.setWebsiteTheme = function (themeId, websiteId, fn) {
      var apiUrl = baseUrl + ['cms', 'theme', themeId, 'website', websiteId].join('/');
      $http.post(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    this.createPageFromTheme = function (themeId, websiteId, handle, fn) {
      var apiUrl = baseUrl + ['cms', 'theme', themeId, 'website', websiteId, 'page', handle].join('/');
      $http.post(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    this.updateLinkList = function (data, websiteId, handle, fn) {
      var apiUrl = baseUrl + ['cms', 'website', websiteId, 'linklists', handle].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: data
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service with ERROR', err);
        fn(err, null);
      });
    };

    this.getComponent = function (component, cmpVersion, fn) {
      var apiUrl = baseUrl + ['cms', 'component', component.type].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson({
          version: cmpVersion
        })
      }).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    this.getPageScreenShot = function (handle, fn) {
      var apiUrl = baseUrl + ['cms', 'page', handle, 'savedscreenshot'].join('/');
      $http.get(apiUrl).success(function (data, status, headers, config) {
        fn(data);
      });
    };

    //page/:pageId/blog/:postId'
    this.updatePost = function (pageId, postId, postdata, fn) {
      var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog', postId].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(postdata)
      }).success(function (data, status, headers, config) {
        fn(data);
      }).error(function (err) {
        console.log('END:Website Service updatePage with ERROR');
        fn(err, null);
      });
    };

  });
}(angular));
