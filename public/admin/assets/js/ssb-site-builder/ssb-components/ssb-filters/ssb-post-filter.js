
/*global app*/
app.filter('ssbPostFilter', function () {
	"use strict";
	return function (posts, component, featured, vm) {
		return filterPosts(posts);
		//return posts;
		function filterPosts(posts) {
			var _filteredPosts = [];
			_.each(posts, function (post) {
				if (filterTags(post)) {
					if (filterCategory(post)) {
						_filteredPosts.push(post);
					}
				}
			});
			if (featured) {
				_filteredPosts = _.filter(_filteredPosts, function (post) {
					return post.featured;
				});
			}
			if(vm)
				vm.totalFilteredPosts = _filteredPosts.length;
			return _filteredPosts;
		}


		function filterTags(post) {
			var _tags = component.postTags;
			if (_tags && _tags.length > 0) {
				if (post.post_tags) {
					var post_tags = _.map(post.post_tags, function (tag) {
						return tag.text || tag;
					});
					return _.intersection(_tags, post_tags).length > 0;
				}
			} else {
				return true;
			}
		}


		function filterCategory(post) {
			var _categories = component.postCategories;
			if (_categories && _categories.length > 0) {
				if (post.post_categories) {
					return (_.intersection(_categories, _.pluck(post.post_categories, "text")).length > 0);
				}
			} else {
				return true;
			}
		}
	};
});
