/*global app, angular */
/*jslint unparam:true*/
app.directive('singlePostComponent',  function () {
	"use strict";
	return {
		scope: {
			component: '=',
			control: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			if (!scope.ssbEditor) {
				scope.component.spacing = scope.$parent.defaultSpacings;
			}
			scope.isEditing = true;
			scope.blog = {};
			scope.datePicker = {};
			/*
			 * @dateOptions
			 * -
			 */

			scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			/*
			 * @open
			 * -
			 */

			scope.open = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				scope.datePicker.isOpen = true;
			};

			/*
			 * @endOpen
			 * -
			 */

			scope.endOpen = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				scope.startOpened = false;
				scope.endOpened = !scope.endOpened;
			};

			/*
			 * @startOpen
			 * -
			 */

			scope.startOpen = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				scope.endOpened = false;
				scope.startOpened = !scope.startOpened;
			};
			if (scope.$parent.blog) {
				scope.blog.post = scope.$parent.blog.post;
			}
			scope.control.getSinglePost = function () {
				return scope.blog.post;
			};
			scope.control.setSinglePost = function () {
				return scope.blog.post = scope.$parent.blog.post;
			};
			scope.getEncodedUrl = function (url) {
				return encodeURI(url);
			};
			scope.getPlainTitle = function (title) {
				var returnValue = title;
				if (title) {
					var element = angular.element(".plain-post-title");
					if (element && element.length) {
						returnValue = element.text().trim();
					}
				}
				return returnValue;
			};
		}
	};
});
