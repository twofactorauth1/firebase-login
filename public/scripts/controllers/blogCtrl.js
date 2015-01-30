'use strict';

mainApp.controller('BlogCtrl', ['$scope', 'postsService', 'pagesService', '$location', '$route', '$routeParams', '$filter','postService', 'websiteService', 'accountService',
    function ($scope, postsService, pagesService, $location, $route, $routeParams, $filter,PostService, websiteService, accountService) {

        var account, pages, website, route, postTags, currentTag, categories, currentCat, authors, currentAuthor, latestposts, that = this;
        var post = {};
        var blogposts = {};

        route = $location.$$path;

        $scope.$back = function() {
            window.history.back();
          };

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                    if (route.indexOf("blog/") > -1) {
                        route = 'single-post';
                    }
                    if (route.indexOf("post/") > -1) {
                        route = 'single-post';
                    }
                    if (route === 'blog' || route === '/blog' || route.indexOf("tag/") > -1 || route.indexOf("category/") > -1 || route.indexOf("author/") > -1) {
                        route = 'blog';
                    }
                    that.pages = data[route];
                    console.log("current Page");
                   // console.log($scope.$parent)
            }
        });

        accountService(function(err, data) {
          if (err) {
            console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
          } else {
            that.account = data;

            //Include Layout For Theme
            that.themeUrl = 'components/layout/layout_indimain.html';

          }
        });

        websiteService(function(err, data) {
          if (err) {
            console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
          } else {
            that.website = data;
          }
        });

        postsService(function(err, data){
            console.log('BlogCtrl: postsService >>> ', post);
            if(err) {
                console.log('BlogCtrl Error: ' + err);
            } else {
                that.currentTag, that.currentAuthor, that.currentCat = '';
                //get post tags for sidebar
                    //should be replaced by get tags filter
                    that.postTags = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_tags) {
                            var tags = data[i].post_tags;
                            for (var j = 0; j < tags.length; j++) {
                                if(that.postTags.indexOf(tags[j]) == -1) {
                                    that.postTags.push(tags[j]);
                                }
                            };
                        }
                    };

                     //get post cateogires for sidebar
                    //should be replaced by get cateogires filter
                    that.categories = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_category) {
                            if(that.categories.indexOf(data[i].post_category) <= -1) {
                                that.categories.push(data[i].post_category);
                            }
                        }
                    };

                     //get latest posts for sidebar
                    //should be replaced by get latest posts filter
                    that.latestposts = [];
                    for (var i = 0; i < data.length; i++) {
                        that.latestposts.push(data[i]);
                    };
                    that.latestposts.slice(Math.max(data.length - 3, 1));

                if (route.indexOf('blog') > -1)  {
                    that.blogposts = data;
                }

                //if tagname is present, filter the cached posts with the tagname
                if ($route.current.params.tagname != null) {
                    var filterPosts = [];
                    that.currentTag = decodeURIComponent($route.current.params.tagname);
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_tags) {
                            var tags = data[i].post_tags;
                            for (var i2 = 0; i2 < tags.length; i2++) {
                                if (tags[i2] === $route.current.params.tagname) {
                                    filterPosts.push(data[i]);
                                }
                            };
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                //if authorname is present, filter the cached posts with the authorname
                if ($route.current.params.authorname != null) {
                    var filterPosts = [];
                    that.currentAuthor = $route.current.params.authorname;
                    for (var i = 0; i < data.length; i++) {
                        if (typeof data[i].post_author !== "undefined") {
                            if (data[i].post_author === $route.current.params.authorname) {
                                filterPosts.push(data[i]);
                            }
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                //if catname is present, filter the cached posts with the catname
                if ($route.current.params.catname != null) {
                    var filterPosts = [];
                    that.currentCat = $route.current.params.catname;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_category) {
                            if (data[i].post_category === $route.current.params.catname) {
                                filterPosts.push(data[i]);
                            }
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                if ($route.current.params.postname != null) {
                    var found = $filter('getByProperty')('post_url', $route.current.params.postname, data);
                    if (found) {
                        that.post = found;
                        var iframe = window.parent.document.getElementById("iframe-website")
                        iframe && iframe.contentWindow && iframe.contentWindow.parent.checkIfSinglePost && iframe.contentWindow.parent.checkIfSinglePost(found);
                    }
                    return;
                }

                return;
            }
        });

        window.copyPostMode=function(){
            console.log(that.post);
            that.tempPost=angular.copy(that.post);
        };

        window.getPostData = function()
        {
            return that.post;
        }

        window.deletePost = function(post_data, toaster) {
            var pageId = $scope.$parent.currentpage ? $scope.$parent.currentpage._id : post_data.pageId
            PostService.deletePost(pageId, post_data._id, function(data) {
                toaster.pop('success', "Post deleted successfully");
            });
        };

         window.savePostMode=function(toaster){ 

            var post_data =  angular.copy(that.post);
            post_data.post_tags.forEach(function(v,i) {
                if(v.text)
                    post_data.post_tags[i] = v.text;
            });
            var post_content_container = $('.post_content_div');
            if(post_content_container.length > 0)
                post_data.post_content = post_content_container.html();

            var post_title_container = $('.blog_post_title');
            if(post_title_container.length > 0)
                post_data.post_title = post_title_container.text(); 

            var post_author_container = $('.blog_post_author');
            if(post_author_container.length > 0)
                post_data.post_author = post_author_container.text(); 

            var post_category_container = $('.blog_post_category');
            if(post_category_container.length > 0)
                post_data.post_category = post_category_container.text();  

            
            var post_excerpt_container = $('.post_excerpt_div');
            if(post_excerpt_container.length > 0)
                post_data.post_excerpt = post_excerpt_container.text();
            
            var postImageUrl = window.parent.getPostImageUrl();
            if(postImageUrl)
            {
                post_data.featured_image = postImageUrl;
            }
            var pageId = $scope.$parent.currentpage ? $scope.$parent.currentpage._id : post_data.pageId
            PostService.updatePost(pageId, post_data._id,post_data,function(data){
                console.log(data);
                console.log("Post Saved");
                window.parent.window.setLoading(false);
                if(toaster)                      
                    toaster.pop('success', "Post Saved");
            });
        };
        $scope.refreshPost = function()
        {
            var post_content_container = $('.post_content_div');
            if(post_content_container.length > 0)
                that.post.post_content = post_content_container.html();

            var post_title_container = $('.blog_post_title');
            if(post_title_container.length > 0)
                that.post.post_title = post_title_container.text(); 

            var post_author_container = $('.blog_post_author');
            if(post_author_container.length > 0)
                that.post.post_author = post_author_container.text(); 

            var post_category_container = $('.blog_post_category');
            if(post_category_container.length > 0)
                that.post.post_category = post_category_container.text();  
            
            var post_excerpt_container = $('.post_excerpt_div');
            if(post_excerpt_container.length > 0)
                that.post.post_excerpt = post_excerpt_container.text();
        }
        $scope.changeBlogImage = function(blogpost) {
          window.parent.changeBlogImage(blogpost);
        }

        window.setBlogImage = function(url) {
           $scope.$apply(function() {
            that.post.featured_image = url;
          })
        }

        window.updatePostMode = function() {
            console.log('post cancel');
            console.log(that.post);
            console.log(that.tempPost);
            that.post=that.tempPost;
            $scope.$$phase||$scope.$digest();

        };

         window.triggerEditMode = function() {
          console.log('edit mode engaged');
          var body = document.getElementsByTagName('body')[0];
          var hasClass = body.classList.contains('editing');
          if (hasClass === false) {
            body.className += ' editing';
          }

          // var toolbar = body.querySelectorAll('.btn-toolbar')[0];
          // if (toolbar.classList.contains('editing') === false) {
          //     toolbar.className += ' editing';
          // }
          $scope.isEditing = true;

          $scope.$digest();
        };

       $scope.activated = false;  
       
       window.checkIfActivated = function()
       {
           return $scope.activated;
       } 
       
       function toTitleCase(str)
    {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    window.activateAloha = function() {
      //if ($scope.activated == false) {
        for(name in CKEDITOR.instances)
        {
            CKEDITOR.instances[name].destroy()
        }
        CKEDITOR.disableAutoInline = true;
        var elements = $('.editable');
        elements.each(function() {
          if(!$(this).parent().hasClass('edit-wrap')) {
            var dataClass = $(this).data('class').replace('.item.', ' ');
            $(this).wrapAll('<div class="edit-wrap"></div>').parent().append('<span class="editable-title">'+toTitleCase(dataClass)+'</span>');
          }
        $scope.activated = true;
          CKEDITOR.inline(this, {
            on: {
              instanceReady: function(ev) {
                var editor = ev.editor;
                editor.setReadOnly(false);
                editor.on('change', function() {
                  $scope.isPageDirty = true;
                });
              }
            },
            sharedSpaces: {
              top: 'editor-toolbar'
            }
          });
        });

        //CKEDITOR.setReadOnly(true);//TODO: getting undefined why?
      //}
    };

    window.deactivateAloha = function() {
      for(name in CKEDITOR.instances)
        {
            CKEDITOR.instances[name].destroy()
        }
      // $('.editable').mahalo();
      // if (aloha.editor && aloha.editor.selection) {
      // aloha.dom.setStyle(aloha.editor.selection.caret, 'display', 'none');
      // $('.aloha-caret.aloha-ephemera', document).css('visibility', 'collapse');
      // }
      // aloha.dom.query('.editable', document).forEach(aloha.mahalo);
    };

    window.addCKEditorImageInput = function(url) {
      console.log('addCKEditorImageInput ', url);
      if ($scope.urlInput) {
        $scope.urlInput.val(url);
      }
    };

    window.addCKEditorImage = function(url) {
      console.log('addCKEditorImage ', url);
      console.log('$scope.inlineInput ', $scope.inlineInput);
      if ($scope.inlineInput) {
        console.log('inserting html');
        $scope.inlineInput.insertHtml( '<img data-cke-saved-src="'+url+'" src="'+url+'"/>' );
      }
    };

    window.clickImageButton = function(btn) {
      $scope.urlInput = $(btn).closest('td').prev('td').find('input');
      window.parent.clickImageButton();
    }

    window.clickandInsertImageButton = function(editor) {
      $scope.inlineInput = editor;
      window.parent.clickImageButton();
    }

    $scope.setPostImage = function(componentId, blogpost) {
      window.parent.setPostImage(componentId);
      blogpost.featured_image = window.parent.postImageUrl;
    }

    }]);
