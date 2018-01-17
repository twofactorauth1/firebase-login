/*global app, urlParser*/
app.directive('videoComponent', ['$sce', function ($sce) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.flvVideoUrl = function (iframeUrl, url, autoPlay, controls, branding) {
				var parsedUrl = urlParser.parse(url), retUrl = "";
				if (parsedUrl) {
					retUrl = iframeUrl + parsedUrl.id + '?rel=0&hd=1';
					if (autoPlay) {
						retUrl = retUrl + '&autoplay=1';
					}
					if (!controls) {
						retUrl = retUrl + '&controls=0';
					}
					if (!branding) {
						retUrl = retUrl + '&modestbranding=1';
					}
				} else {
					retUrl = iframeUrl;
				}
				return $sce.trustAsResourceUrl(retUrl);
			};

			scope.trustSrc = function (src) {
				return $sce.trustAsResourceUrl(src);
			};

			scope.config = {
				autoHide: true,
				autoPlay: false,
				autoHideTime: 1500,
				responsive: true,
				stretch: 'fit',
				theme: {
					url: "../../js/libs/videogular-themes-default/videogular.css",
					playIcon: "&#xe000;",
					pauseIcon: "&#xe001;",
					volumeLevel3Icon: "&#xe002;",
					volumeLevel2Icon: "&#xe003;",
					volumeLevel1Icon: "&#xe004;",
					volumeLevel0Icon: "&#xe005;",
					muteIcon: "&#xe006;",
					enterFullScreenIcon: "&#xe007;",
					exitFullScreenIcon: "&#xe008;"
				}
			};
		}
	};
}]);
