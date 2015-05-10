'use strict';

mainApp.controller('BlogCtrl', ['$scope', 'postsService', 'pagesService', '$location', '$route', '$routeParams', '$filter', 'postService', 'websiteService', 'accountService', '$window',
    function($scope, postsService, pagesService, $location, $route, $routeParams, $filter, PostService, websiteService, accountService, $window) {

        var account, pages, website, route, postTags, currentTag, categories, currentCat, authors, currentAuthor, latestposts, that = this;
        var post = {};
        var blogposts = {};

        route = $location.$$path;

        $scope.testing = 'hello';
        $scope.activeEditor = null;

        /*
         * @back
         * -
         */

        $scope.$back = function() {
            window.history.back();
        };

        /*
         * @parentScope
         * - access to the parent scope
         */

        $scope.parentScope = parent.angular.element('#iframe-website').scope();

        /*
         * @pagesService
         * -
         */

        pagesService(function(err, data) {
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
                $(document).ready(function() {
                    setTimeout(function() {
                        console.log("Page loaded");
                            $scope.isLoaded = true;

                    }, 500);
                });
                if($scope.parentScope)
                    $scope.parentScope.afteriframeLoaded(that.pages);
                //var iframe = window.parent.document.getElementById("iframe-website")
                //iframe && iframe.contentWindow && iframe.contentWindow.parent.updateAdminPageScope && iframe.contentWindow.parent.updateAdminPageScope(that.pages);
                // console.log("current Page");
                // console.log($scope.$parent)
            }
        });

        /*
         * @accountService
         * -
         */

        accountService(function(err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                that.account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_indimain.html';

            }
        });

        /*
         * @websiteService
         * -
         */

        websiteService(function(err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
            }
        });

        /*
         * @postsService
         * -
         */

        postsService(function(err, data) {
            if (err) {
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
                            if (that.postTags.indexOf(tags[j]) == -1) {
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
                        if (that.categories.indexOf(data[i].post_category) <= -1) {
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

                if (route.indexOf('blog') > -1) {
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

        /*
         * @copyPostMode
         * -
         */

        $scope.copyPostMode = function() {
            that.tempPost = angular.copy(that.post);
        };

        /*
         * @getPostData
         * -
         */

        $scope.getPostData = function() {
            return that.post;
        };

        /*
         * @deletePost
         * -
         */

        $scope.deletePost = function(post_data, toaster) {
            var pageId = $scope.parentScope.currentPage._id;
            PostService.deletePost(pageId, post_data._id, function(data) {
                $scope.parentScope.showToaster(false, true, "Post deleted successfully", data, true);
            });
        };

        /*
         * @savePostMode
         * -
         */

        $scope.savePostMode = function(toaster, msg) {

            var post_data = angular.copy(that.post);
            post_data.post_tags.forEach(function(v, i) {
                if (v.text)
                    post_data.post_tags[i] = v.text;
            });
            var post_content_container = $('.post_content_div');
            if (post_content_container.length > 0)
                post_data.post_content = post_content_container.html();

            var post_title_container = $('.blog_post_title');
            if (post_title_container.length > 0)
                post_data.post_title = post_title_container.text().trim();

            var post_author_container = $('.blog_post_author');
            if (post_author_container.length > 0)
                post_data.post_author = post_author_container.text().trim();

            var post_category_container = $('.blog_post_category');
            if (post_category_container.length > 0)
                post_data.post_category = post_category_container.text().trim();


            var post_excerpt_container = $('.post_excerpt_div');
            if (post_excerpt_container.length > 0)
                post_data.post_excerpt = post_excerpt_container.text();

            var postImageUrl = $scope.parentScope.getPostImageUrl();
            if (postImageUrl) {
                post_data.featured_image = postImageUrl;
            }
            var pageId = $scope.parentScope.currentPage._id;
            PostService.updatePost(pageId, post_data._id, post_data, function(data) {
                $scope.parentScope.showToaster(false, true, msg, data);
            });
        };

        /*
         * @refreshPost
         * -
         */

        $scope.refreshPost = function() {
            if (!that.tempPost)
                that.tempPost = angular.copy(that.post);

            $scope.$apply(function() {
                $scope.initializePostData();
            })
        }

        /*
         * @initializePostData
         * -
         */

        //TODO: sync with scope values instead of retrieving through angular.element

        $scope.initializePostData = function(revert) {
            var post_content = angular.copy(that.post.post_content);
            var post_content_container = angular.element('.post_content_div');
            if (post_content_container.length > 0)
                that.post.post_content = post_content_container.html();

            var post_title_container = angular.element('.blog_post_title');
            if (post_title_container.length > 0)
                that.post.post_title = post_title_container.text();

            var post_author_container = angular.element('.blog_post_author');
            if (post_author_container.length > 0)
                that.post.post_author = post_author_container.text();

            var post_category_container = angular.element('.blog_post_category');
            if (post_category_container.length > 0)
                that.post.post_category = post_category_container.text();

            if (revert) {
                var post_excerpt_container = angular.element('.post_excerpt_div');
                if (post_excerpt_container.length > 0)
                    post_excerpt_container.text(that.post.post_excerpt);
            } else {
                var post_excerpt_container = angular.element('.post_excerpt_div');
                if (post_excerpt_container.length > 0)
                    that.post.post_excerpt = post_excerpt_container.text();
                $scope.autoCreateExcerpt(post_excerpt_container, post_content_container, post_content);
            }
        };

        /*
         * @autoCreateExcerpt
         * -
         */

        $scope.autoCreateExcerpt = function(post_excerpt_container, post_content_container, post_content) {
            if (post_excerpt_container.length > 0 && post_content_container.length > 0 && post_content !== that.post.post_content && jQuery.trim(post_content_container.text())) {
                post_excerpt_container.text(jQuery.trim(post_content_container.text()).substring(0, 300) + "...");
            }
        };

        /*
         * @revertComponent
         * -
         */

        $scope.revertComponent = function() {
            that.post.post_excerpt = that.tempPost.post_excerpt;
            that.post.featured_image = that.tempPost.featured_image;
            $scope.initializePostData(true);

        };

        /*
         * @changeBlogImage
         * -
         */

        $scope.changeBlogImage = function(blogpost) {
            $scope.parentScope.changeBlogImage(blogpost);
        };

        /*
         * @setBlogImage
         * -
         */

        $scope.setBlogImage = function(url) {
            $scope.$apply(function() {
                that.post.featured_image = url;
            })
        };

        /*
         * @updatePostMode
         * -
         */

         //TODO: could not find where this function is used
        $scope.updatePostMode = function() {
            that.post = that.tempPost;
            $scope.$$phase || $scope.$digest();
        };

        /*
         * @triggerEditMode
         * -
         */

        $scope.triggerEditMode = function() {
            var body = document.getElementsByTagName('body')[0];
            var hasClass = body.classList.contains('editing');
            if (hasClass === false) {
                body.className += ' editing';
            };
            $scope.isEditing = true;
        };

        /*
         * @toTitleCase
         * -
         */

        $scope.toTitleCase = function(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };

        /*
         * @activateCKEditor
         * -
         */

        $scope.activateCKEditor = function() {
            //if ($scope.activated == false) {
            $scope.isEditing = true;
            for (name in CKEDITOR.instances) {
                CKEDITOR.instances[name].destroy()
                //CKEDITOR.instances[name].removeAllListeners();
                //CKEDITOR.remove(CKEDITOR.instances[name]);
            }
            CKEDITOR.disableAutoInline = true;
            var elements = angular.element('.editable');
            elements.each(function(index) {
                if (!angular.element(this).parent().hasClass('edit-wrap')) {
                    var dataClass = angular.element(this).data('class').replace('.item.', ' ');
                    angular.element(this).wrapAll('<div class="edit-wrap"></div>').parent().append('<span class="editable-title">' + $scope.toTitleCase(dataClass) + '</span>');
                }
                CKEDITOR.inline(this, {
                    on: {
                        instanceReady: function(ev) {
                            var editor = ev.editor;
                            if(index === 0)
                                $scope.activeEditor = editor;
                            editor.setReadOnly(false);
                            editor.on('change', function() {
                                $scope.isPageDirty = true;
                            });
                            editor.on('focus', function() {
                                $scope.activeEditor = editor;
                            });
                            editor.on('blur', function() {
                                $scope.activeEditor = null;
                            });
                        }
                    },
                    sharedSpaces: {
                        top: 'editor-toolbar'
                    }
                });
            });
            $scope.parentScope.resizeIframe();
        };

        /*
         * @deactivateCKEditor
         * -
         */

        $scope.deactivateCKEditor = function() {
            for (name in CKEDITOR.instances) {
                CKEDITOR.instances[name].destroy()
            }
        };


        window.calculateWindowHeight = function() {
           return $scope.parentScope.calculateWindowHeight();
        };

        /*
         * @checkOrSetPageDirty
         * -
         */

        $scope.checkOrSetPageDirty = function(status) {
            if (status)
                $scope.isPageDirty = false;
            else
                return $scope.isPageDirty;
        };

        /*
         * @addCKEditorImageInput
         * -
         */

         //TODO: could not find where this function is being used
        $scope.addCKEditorImage = function(url, inlineInput, edit) {
            if(inlineInput)
            {
                if (edit)
                    inlineInput.val(url);
                else
                    inlineInput.insertHtml('<img data-cke-saved-src="' + url + '" src="' + url + '"/>');
            }
        };

        /*
         * @addCKEditorImage
         * -
         */

        $scope.addCKEditorImage = function(url, inlineInput, edit) {
            if(edit)
                inlineInput.val(url);
            else    
                inlineInput.insertHtml('<img data-cke-saved-src="' + url + '" src="' + url + '"/>');
        };

        /*
         * @clickImageButton
         * -
         */

        window.clickImageButton = function(btn) {
            var urlInput = $(btn).closest('td').prev('td').find('input');
            $scope.parentScope.clickImageButton(urlInput, true);
        };
        
        /*
         * @clickandInsertImageButton
         * -
         */

        window.clickandInsertImageButton = function(editor) {
            $scope.parentScope.clickImageButton(editor);
        };

        /*
         * @Get active editor instance
         * -
         */
        $scope.getActiveEditor = function() {
           return $scope.activeEditor;
        };


        /*
         * @setPostImage
         * -
         */

        $scope.setPostImage = function(componentId, blogpost) {
            $scope.parentScope.setPostImage(componentId);
            blogpost.featured_image = $scope.parentScope.postImageUrl;
        };

        /*
         * @sharePost
         * -
         */

        $scope.sharePost = function(post, type) {
            var url = $location.$$absUrl;
            var postData = {};
            switch (type) {
                case "twitter":
                    postData = {
                        status: url
                    }
                    PostService.sharePostOnTwitter(postData, function(data) {

                    });
                    break;
                case "facebook":
                    postData = {
                        url: url,
                        picture: post.featured_image,
                        name: post.post_title,
                        caption: post.post_excerpt,
                        description: post.post_excerpt
                    }
                    PostService.sharePostOnFacebook(postData, function(data) {

                    });
                    break;
                case "linked-in":
                    postData = {
                        url: url,
                        picture: post.featured_image,
                        name: post.post_title,
                        caption: post.post_excerpt,
                        description: post.post_excerpt
                    }
                    PostService.sharePostOnLinkedIn(postData, function(data) {

                    });
                    break;
            }
        }

    }
]);
